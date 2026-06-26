import { insertPaper, updatePaperSummary } from '@paperlens/db'
import { getVectorDB, VectorChunk } from '@paperlens/db'
import type { LLMProvider } from '@paperlens/ai'
import { SummaryChain } from '@paperlens/ai'
import { extractSection, chunkText, createMockParsedPaper } from './parser'
import type { PaperMetadata } from './parser'
import path from 'path'
import fs from 'fs'

/**
 * 索引单篇论文
 */
export async function indexPaper(
  metadata: PaperMetadata,
  llm: LLMProvider
): Promise<void> {
  const { id, title, category, pdfPath } = metadata
  
  // 检查 PDF 文件是否存在
  let fullPath = pdfPath
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(process.cwd(), 'data', 'papers', pdfPath)
  }
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`PDF not found: ${fullPath}, using mock data`)
  }
  
  // 检查论文是否已存在
  const existingPath = path.join(process.cwd(), 'data', 'db', 'paperlens.db')
  if (!fs.existsSync(path.dirname(existingPath))) {
    fs.mkdirSync(path.dirname(existingPath), { recursive: true })
  }
  
  // 插入论文元数据
  insertPaper({
    id,
    title,
    authors: null,
    year: null,
    category,
    pdf_path: pdfPath,
    difficulty: 'intermediate',
    summary_json: null,
    summary_generated_at: null
  })
  
  // 创建模拟的解析数据（实际应使用 PDF 解析库）
  const parsed = createMockParsedPaper(metadata)
  
  // 处理向量嵌入
  try {
    const vectorDB = getVectorDB()
    
    // 如果有实际文本内容，则进行分段和嵌入
    if (parsed.text && parsed.text.length > 100) {
      const chunks = chunkText(parsed.text, 1000, 200)
      
      const vectorChunks: VectorChunk[] = chunks.map((chunk, idx) => ({
        id: `${id}:chunk:${idx}`,
        embedding: [] as number[],
        metadata: {
          paper_id: id,
          page_num: 0,
          section: extractSection(parsed.text, chunk),
          text: chunk
        }
      }))
      
      // 生成嵌入（可选，因为可能会很慢）
      // 如果 LLM 支持 embed 方法，可以取消下面的注释
      // const embeddings = await llm.embedBatch(chunks)
      // vectorChunks.forEach((chunk, i) => {
      //   chunk.embedding = embeddings[i]
      // })
      
      // 添加到向量数据库
      await vectorDB.addChunks(vectorChunks)
    }
  } catch (error) {
    console.error('Failed to index vectors:', error)
  }
  
  // 生成 AI 摘要
  try {
    const summaryChain = new SummaryChain(llm)
    const summary = await summaryChain.generateWithRetry(title, parsed.text || title)
    updatePaperSummary(id, summary)
  } catch (error) {
    console.error('Failed to generate summary:', error)
  }
}

/**
 * 批量索引论文
 */
export async function indexPapers(
  papers: PaperMetadata[],
  llm: LLMProvider,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  
  for (let i = 0; i < papers.length; i++) {
    try {
      await indexPaper(papers[i], llm)
      success++
    } catch (error) {
      console.error(`Failed to index ${papers[i].id}:`, error)
      failed++
    }
    
    if (onProgress) {
      onProgress(i + 1, papers.length)
    }
  }
  
  return { success, failed }
}