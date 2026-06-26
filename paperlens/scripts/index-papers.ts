/**
 * 论文索引脚本
 * 
 * 这个脚本会扫描论文目录并索引论文信息到数据库
 * 实际使用中需要配合 PWL 仓库的论文文件
 */

import { getDB } from '@paperlens/db'
import { indexPaper } from '@paperlens/core'
import { OpenAIProvider } from '@paperlens/ai'
import fs from 'fs'
import path from 'path'

// 定义要从 PWL 仓库索引的论文
const PAPERS_TO_INDEX = [
  // 分布式系统
  { id: 'paxos-made-simple', title: 'Paxos Made Simple', category: 'distributed_systems', pdfPath: 'distributed_systems/paxos-made-simple.pdf' },
  { id: 'in-search-of-an-understandable-consensus-algorithm', title: 'In Search of an Understandable Consensus Algorithm (Raft)', category: 'distributed_systems', pdfPath: 'distributed_systems/in-search-of-an-understandable-consensus-algorithm.pdf' },
  { id: 'brewers-conjecture', title: 'Brewer\'s Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services', category: 'distributed_systems', pdfPath: 'distributed_systems/brewers-conjecture.pdf' },
  { id: 'dynamo-amazons-highly-available-key-value-store', title: 'Dynamo: Amazon\'s Highly Available Key-value Store', category: 'datastores', pdfPath: 'datastores/dynamo-amazons-highly-available-key-value-store.pdf' },
  { id: 'bigtable-a-distributed-storage-system-for-structured-data', title: 'Bigtable: A Distributed Storage System for Structured Data', category: 'datastores', pdfPath: 'datastores/bigtable-a-distributed-storage-system-for-structured-data.pdf' },
  { id: 'spanner-google\'s-globally-distributed-database', title: 'Spanner: Google\'s Globally-Distributed Database', category: 'datastores', pdfPath: 'datastores/spanner-google\'s-globally-distributed-database.pdf' },
]

async function indexPapers() {
  console.log('📄 开始索引论文...\n')
  
  // 检查是否有 OpenAI API Key
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.log('⚠️ 未设置 OPENAI_API_KEY，跳过 AI 摘要生成')
    console.log('   将只索引论文元数据')
    console.log('')
  }
  
  // 创建 LLM Provider（如果没有 API Key，使用模拟模式）
  let llm = null
  if (apiKey) {
    llm = new OpenAIProvider(apiKey)
    console.log('✓ OpenAI API 已配置\n')
  }
  
  let success = 0
  let skipped = 0
  
  for (const paper of PAPERS_TO_INDEX) {
    // 检查 PDF 是否存在
    const pdfFullPath = path.join(process.cwd(), 'data', 'papers', paper.pdfPath)
    
    if (!fs.existsSync(pdfFullPath)) {
      console.log(`⏭️  跳过: ${paper.title} (PDF 不存在)`)
      skipped++
      continue
    }
    
    try {
      if (llm) {
        await indexPaper(paper, llm)
      }
      console.log(`✓ 索引: ${paper.title}`)
      success++
    } catch (error) {
      console.error(`✗ 失败: ${paper.title}`, error)
    }
  }
  
  console.log(`\n📊 索引完成:`)
  console.log(`   成功: ${success}`)
  console.log(`   跳过: ${skipped}`)
}

// 运行脚本
indexPapers().catch(console.error)