/**
 * 数据库初始化脚本
 */

import { getDB } from '@paperlens/db'
import fs from 'fs'
import path from 'path'

async function initDatabase() {
  console.log('🗄️ 初始化数据库...\n')
  
  const dataDir = path.join(process.cwd(), 'data', 'db')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log(`✓ 创建目录: ${dataDir}`)
  }
  
  // 初始化数据库
  const db = getDB()
  console.log('✓ 数据库连接成功')
  
  // 验证表是否存在
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
  `).all() as { name: string }[]
  
  console.log(`✓ 已创建 ${tables.length} 个表:`)
  tables.forEach(t => console.log(`   - ${t.name}`))
  
  db.close()
  console.log('\n✅ 数据库初始化完成！')
}

// 运行脚本
initDatabase().catch(console.error)