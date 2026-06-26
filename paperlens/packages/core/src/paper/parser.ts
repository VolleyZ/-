// PDF 解析器 - 使用 pdfjs-dist
// 注意：这个文件是可选的，如果 pdfjs-dist 在服务端运行有问题，可以简化为文件读取

export interface ParsedPaper {
  id: string
  title: string
  authors: string[]
  year: number | null
  text: string
  pages: { pageNum: number; text: string }[]
}

export interface PaperMetadata {
  id: string
  title: string
  category: string
  pdfPath: string
}

/**
 * 从 PDF 文本中提取标题
 */
function extractTitleFromText(text: string): string {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length > 0) {
    const title = lines[0].trim()
    if (title.length > 10 && title.length < 200) {
      return title
    }
  }
  return ''
}

/**
 * 解析作者字符串
 */
function parseAuthors(authorStr: string): string[] {
  if (!authorStr) return []
  return authorStr.split(/[,;]/).map(a => a.trim()).filter(a => a)
}

/**
 * 从日期字符串提取年份
 */
function extractYear(dateStr: string): number | null {
  const match = dateStr.match(/(\d{4})/)
  if (match) {
    return parseInt(match[1])
  }
  return null
}

/**
 * 简单 PDF 文本提取（用于服务端）
 * 实际项目中可以使用 pdf-parse 或其他服务端 PDF 库
 */
export async function parsePDFSimple(pdfPath: string): Promise<ParsedPaper> {
  const fs = await import('fs')
  const path = await import('path')
  
  // 读取文件基本信息
  const stats = fs.statSync(pdfPath)
  const fileName = path.basename(pdfPath, '.pdf')
  
  // 简化实现：返回基本信息
  // 实际项目中应该使用 pdf-parse 等库解析 PDF 内容
  return {
    id: fileName,
    title: fileName.replace(/-/g, ' ').replace(/_/g, ' '),
    authors: [],
    year: null,
    text: '',
    pages: []
  }
}

/**
 * 创建模拟的论文解析数据（用于开发和测试）
 */
export function createMockParsedPaper(metadata: PaperMetadata): ParsedPaper {
  return {
    id: metadata.id,
    title: metadata.title,
    authors: [],
    year: null,
    text: '这是论文的模拟文本内容。在实际部署时，应该使用 pdf-parse 等库来提取真实的 PDF 内容。',
    pages: [
      { pageNum: 1, text: '第一页内容...' },
      { pageNum: 2, text: '第二页内容...' }
    ]
  }
}

/**
 * 提取章节信息
 */
export function extractSection(fullText: string, pageText: string): string {
  const sections = ['abstract', 'introduction', 'related work', 'background', 'method', 'experiment', 'evaluation', 'conclusion']
  const lowerText = pageText.toLowerCase()
  
  for (const section of sections) {
    if (lowerText.includes(section)) {
      return section
    }
  }
  return 'content'
}

/**
 * 将长文本分段（用于向量嵌入）
 */
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  if (text.length <= chunkSize) {
    return [text]
  }
  
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - overlap
    if (start >= text.length) break
  }
  
  return chunks
}