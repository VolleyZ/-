/**
 * 种子数据脚本 - 创建预置的学习路径
 */

import { getDB } from '@paperlens/db'

const LEARNING_PATHS = [
  {
    id: 'distributed-systems-intro',
    title: '分布式系统入门',
    description: '从基础概念到一致性协议，建立分布式系统的核心知识体系',
    category: 'distributed_systems',
    difficulty: 'intermediate',
    estimated_duration: '4 周',
    stages: [
      {
        title: '基础概念',
        description: '理解分布式系统的基本挑战',
        papers: [
          'a-note-on-distributed-computing',
          'brewers-conjecture',
          'end-to-end-arguments-in-system-design'
        ]
      },
      {
        title: '一致性协议',
        description: '掌握 Paxos 和 Raft 等共识算法',
        papers: [
          'paxos-made-simple',
          'in-search-of-an-understandable-consensus-algorithm'
        ]
      },
      {
        title: '工业实践',
        description: '学习 Google、Amazon 等大厂的实践',
        papers: [
          'the-chubby-lock-service-for-loosely-coupled-distributed-systems',
          'dynamo-amazons-highly-available-key-value-store'
        ]
      }
    ]
  },
  {
    id: 'database-systems',
    title: '数据库系统设计',
    description: '深入理解数据库系统的核心概念和设计原理',
    category: 'datastores',
    difficulty: 'intermediate',
    estimated_duration: '6 周',
    stages: [
      {
        title: '存储引擎',
        description: '理解数据存储的基础',
        papers: [
          'bigtable-a-distributed-storage-system-for-structured-data'
        ]
      },
      {
        title: '分布式数据库',
        description: '学习分布式数据管理',
        papers: [
          'spanner-google\'s-globally-distributed-database',
          'dynamo-amazons-highly-available-key-value-store'
        ]
      }
    ]
  },
  {
    id: 'machine-learning-fundamentals',
    title: '机器学习基础',
    description: '理解机器学习的核心概念和经典算法',
    category: 'machine_learning',
    difficulty: 'beginner',
    estimated_duration: '4 周',
    stages: [
      {
        title: '基础理论',
        description: '机器学习基本概念',
        papers: [
          'a-few-useful-things-to-know-about-machine-learning'
        ]
      },
      {
        title: '神经网络',
        description: '深度学习基础',
        papers: [
          'imagenet-classification-with-deep-convolutional-neural-networks'
        ]
      }
    ]
  }
]

async function seedLearningPaths() {
  console.log('🌱 开始填充种子数据...\n')
  
  const db = getDB()
  
  // 收集所有需要的学习路径中的论文 ID
  const paperIds = new Set<string>()
  for (const pathData of LEARNING_PATHS) {
    for (const stage of pathData.stages) {
      for (const paperId of stage.papers) {
        paperIds.add(paperId)
      }
    }
  }
  
  // 创建占位论文（如果论文不存在）
  const insertPaper = db.prepare(`
    INSERT OR IGNORE INTO papers (id, title, category, pdf_path)
    VALUES (?, ?, 'unknown', '')
  `)
  
  console.log('📄 创建占位论文条目...')
  for (const paperId of paperIds) {
    insertPaper.run(paperId, paperId)
  }
  console.log(`   ✓ 已创建 ${paperIds.size} 个论文条目\n`)
  
  for (const pathData of LEARNING_PATHS) {
    console.log(`📚 创建学习路径: ${pathData.title}`)
    
    // 插入学习路径
    db.prepare(`
      INSERT OR REPLACE INTO learning_paths (id, title, description, category, difficulty, estimated_duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      pathData.id,
      pathData.title,
      pathData.description,
      pathData.category,
      pathData.difficulty,
      pathData.estimated_duration
    )
    
    // 插入阶段
    for (const [stageIdx, stage] of pathData.stages.entries()) {
      const result = db.prepare(`
        INSERT INTO path_stages (path_id, stage_order, title, description)
        VALUES (?, ?, ?, ?)
      `).run(pathData.id, stageIdx + 1, stage.title, stage.description)
      
      const stageId = result.lastInsertRowid as number
      
      // 插入阶段论文
      for (const [paperIdx, paperId] of stage.papers.entries()) {
        db.prepare(`
          INSERT OR IGNORE INTO stage_papers (stage_id, paper_id, paper_order)
          VALUES (?, ?, ?)
        `).run(stageId, paperId, paperIdx + 1)
      }
      
      console.log(`   ✓ 阶段 ${stageIdx + 1}: ${stage.title} (${stage.papers.length} 篇论文)`)
    }
    
    console.log('')
  }
  
  console.log('✅ 种子数据填充完成！')
}

// 运行脚本
seedLearningPaths().catch(console.error)