# PaperLens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 AI 驱动的智能论文探索平台 PaperLens，支持论文浏览、AI 摘要、问答、图谱可视化、阅读路径五大核心功能

**Architecture:** 基于 Next.js 全栈框架，采用模块化 monorepo 结构（apps/web + packages/ai + packages/core + packages/db）。前端使用 App Router，后端通过 API Routes 提供服务。AI 层使用 LangChain.js 实现 RAG，兼容 OpenAI 和 Ollama 多模型。数据层使用 SQLite 存储元数据，ChromaDB 存储向量嵌入。

**Tech Stack:** Next.js 14 + TypeScript + TailwindCSS + LangChain.js + SQLite (better-sqlite3) + ChromaDB + D3.js + PDF.js + pnpm workspaces

---

## 项目结构

```
paperlens/
├── apps/
│   └── web/                      # Next.js 前端应用
│       ├── app/                   # App Router 页面
│       ├── components/            # UI 组件
│       └── lib/                   # 工具函数
├── packages/
│   ├── ai/                        # AI 服务层
│   ├── core/                      # 核心业务逻辑
│   └── db/                        # 数据库访问层
├── data/                          # 运行时数据
│   ├── papers/                   # PDF 文件
│   ├── db/                       # SQLite 数据库
│   └── vectors/                  # 向量数据库
└── scripts/                       # 构建脚本
```

---

## 阶段一：项目脚手架与基础设施

### Task 1: 初始化 Monorepo 项目

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tsconfig.json`
- Create: `packages/ai/package.json`
- Create: `packages/core/package.json`
- Create: `packages/db/package.json`

- [ ] **Step 1: 创建根目录 package.json**

```json
{
  "name": "paperlens",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: 创建 tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

- [ ] **Step 4: 创建 apps/web/package.json**

```json
{
  "name": "@paperlens/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@paperlens/ai": "workspace:*",
    "@paperlens/core": "workspace:*",
    "@paperlens/db": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 5: 创建 apps/web/next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@paperlens/ai', '@paperlens/core', '@paperlens/db'],
  experimental: {
    serverComponentsExternalPackages: ['@paperlens/db', '@paperlens/ai']
  }
}

module.exports = nextConfig
```

- [ ] **Step 6: 创建 apps/web/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 7: 创建 TailwindCSS 配置**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6'
      }
    }
  },
  plugins: []
}
```

- [ ] **Step 8: 创建 packages/ai/package.json**

```json
{
  "name": "@paperlens/ai",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "langchain": "^0.1.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 9: 创建 packages/core/package.json**

```json
{
  "name": "@paperlens/core",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@paperlens/db": "workspace:*",
    "@paperlens/ai": "workspace:*",
    "pdfjs-dist": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 10: 创建 packages/db/package.json**

```json
{
  "name": "@paperlens/db",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "chroma-db": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/better-sqlite3": "^7.6.0"
  }
}
```

- [ ] **Step 11: 安装依赖并验证构建**

```bash
pnpm install
pnpm build
```

Expected: 所有 packages 编译成功

---

### Task 2: 创建数据库层

**Files:**
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/sqlite.ts`
- Create: `packages/db/src/vector.ts`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/queries.ts`
- Create: `packages/db/tsconfig.json`

- [ ] **Step 1: 创建 packages/db/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: 创建 packages/db/src/schema.ts - 数据库 Schema 定义**

```typescript
import Database from 'better-sqlite3'
import path from 'path'

export const SCHEMA_SQL = `
-- 论文表
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  category TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  summary_json TEXT,
  summary_generated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- 论文-标签关联表
CREATE TABLE IF NOT EXISTS paper_tags (
  paper_id TEXT REFERENCES papers(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (paper_id, tag_id)
);

-- 论文引用关系表
CREATE TABLE IF NOT EXISTS paper_references (
  paper_id TEXT REFERENCES papers(id),
  referenced_paper_id TEXT REFERENCES papers(id),
  PRIMARY KEY (paper_id, referenced_paper_id)
);

-- 阅读记录表
CREATE TABLE IF NOT EXISTS reading_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id TEXT REFERENCES papers(id),
  status TEXT NOT NULL DEFAULT 'unread',
  progress INTEGER DEFAULT 0,
  notes TEXT,
  last_read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(paper_id)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id TEXT REFERENCES papers(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(paper_id)
);

-- 学习路径表
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  estimated_duration TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 路径阶段表
CREATE TABLE IF NOT EXISTS path_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id TEXT REFERENCES learning_paths(id),
  stage_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

-- 阶段论文表
CREATE TABLE IF NOT EXISTS stage_papers (
  stage_id INTEGER REFERENCES path_stages(id),
  paper_id TEXT REFERENCES papers(id),
  paper_order INTEGER NOT NULL,
  PRIMARY KEY (stage_id, paper_id)
);

-- AI 摘要缓存表
CREATE TABLE IF NOT EXISTS ai_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id TEXT REFERENCES papers(id),
  cache_key TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(paper_id, cache_key)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_papers_category ON papers(category);
CREATE INDEX IF NOT EXISTS idx_papers_difficulty ON papers(difficulty);
CREATE INDEX IF NOT EXISTS idx_reading_records_status ON reading_records(status);
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
`

export function initSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)
}
```

- [ ] **Step 3: 创建 packages/db/src/sqlite.ts - SQLite 操作类**

```typescript
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { SCHEMA_SQL, initSchema } from './schema'

export class SQLiteDB {
  private db: Database.Database

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    initSchema(this.db)
  }

  get instance(): Database.Database {
    return this.db
  }

  close(): void {
    this.db.close()
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }
}

let dbInstance: SQLiteDB | null = null

export function getDB(dbPath?: string): SQLiteDB {
  if (!dbInstance) {
    dbInstance = new SQLiteDB(dbPath || path.join(process.cwd(), 'data/db/paperlens.db'))
  }
  return dbInstance
}
```

- [ ] **Step 4: 创建 packages/db/src/vector.ts - 向量数据库操作**

```typescript
import { ChromaClient, Collection } from 'chromadb'

export interface VectorChunk {
  id: string
  embedding: number[]
  metadata: {
    paper_id: string
    page_num: number
    section: string
    text: string
  }
}

export class VectorDB {
  private client: ChromaClient
  private collection: Collection | null = null

  constructor(persistPath?: string) {
    this.client = new ChromaClient({
      path: persistPath || path.join(process.cwd(), 'data/vectors')
    })
  }

  async getCollection(name: string): Promise<Collection> {
    if (!this.collection) {
      this.collection = await this.client.getOrCreateCollection({
        name,
        metadata: { 'hnsw:space': 'cosine' }
      })
    }
    return this.collection
  }

  async addChunks(chunks: VectorChunk[]): Promise<void> {
    const collection = await this.getCollection('paper_chunks')
    await collection.add({
      ids: chunks.map(c => c.id),
      embeddings: chunks.map(c => c.embedding),
      metadatas: chunks.map(c => c.metadata),
      documents: chunks.map(c => c.metadata.text)
    })
  }

  async search(embedding: number[], topK: number = 5): Promise<VectorChunk[]> {
    const collection = await this.getCollection('paper_chunks')
    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK
    })
    
    return results.ids[0].map((id, i) => ({
      id,
      embedding: results.embeddings?.[0]?.[i] || [],
      metadata: results.metadatas?.[0]?.[i] as VectorChunk['metadata']
    }))
  }

  async deleteByPaperId(paperId: string): Promise<void> {
    const collection = await this.getCollection('paper_chunks')
    await collection.delete({
      where: { paper_id: paperId }
    })
  }
}

let vectorInstance: VectorDB | null = null

export function getVectorDB(persistPath?: string): VectorDB {
  if (!vectorInstance) {
    vectorInstance = new VectorDB(persistPath)
  }
  return vectorInstance
}
```

- [ ] **Step 5: 创建 packages/db/src/queries.ts - 数据查询接口**

```typescript
import { getDB } from './sqlite'
import type { Database } from 'better-sqlite3'

export interface Paper {
  id: string
  title: string
  authors: string | null
  year: number | null
  category: string
  pdf_path: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  summary_json: string | null
  summary_generated_at: string | null
  created_at: string
  updated_at: string
}

export interface PaperWithTags extends Paper {
  tags: string[]
}

export function getAllPapers(category?: string): Paper[] {
  const db = getDB()
  if (category) {
    return db.prepare('SELECT * FROM papers WHERE category = ? ORDER BY title').all(category) as Paper[]
  }
  return db.prepare('SELECT * FROM papers ORDER BY title').all() as Paper[]
}

export function getPaperById(id: string): Paper | null {
  const db = getDB()
  return db.prepare('SELECT * FROM papers WHERE id = ?').get(id) as Paper | null
}

export function getPaperByIdWithTags(id: string): PaperWithTags | null {
  const db = getDB()
  const paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(id) as Paper | null
  if (!paper) return null
  
  const tags = db.prepare(`
    SELECT t.name FROM tags t
    JOIN paper_tags pt ON t.id = pt.tag_id
    WHERE pt.paper_id = ?
  `).all(id).map((row: any) => row.name)
  
  return { ...paper, tags }
}

export function insertPaper(paper: Omit<Paper, 'created_at' | 'updated_at'>): void {
  const db = getDB()
  db.prepare(`
    INSERT INTO papers (id, title, authors, year, category, pdf_path, difficulty, summary_json, summary_generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    paper.id,
    paper.title,
    paper.authors,
    paper.year,
    paper.category,
    paper.pdf_path,
    paper.difficulty,
    paper.summary_json,
    paper.summary_generated_at
  )
}

export function updatePaperSummary(id: string, summary: object): void {
  const db = getDB()
  db.prepare(`
    UPDATE papers 
    SET summary_json = ?, summary_generated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(JSON.stringify(summary), id)
}

export function getCategories(): { category: string; count: number }[] {
  const db = getDB()
  return db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM papers 
    GROUP BY category 
    ORDER BY count DESC
  `).all() as { category: string; count: number }[]
}

export function searchPapers(query: string): Paper[] {
  const db = getDB()
  return db.prepare(`
    SELECT * FROM papers 
    WHERE title LIKE ? OR authors LIKE ?
    ORDER BY title
  `).all(`%${query}%`, `%${query}%`) as Paper[]
}

export function getRelatedPapers(paperId: string, limit: number = 5): Paper[] {
  const db = getDB()
  return db.prepare(`
    SELECT p.* FROM papers p
    JOIN paper_references pr ON p.id = pr.referenced_paper_id
    WHERE pr.paper_id = ?
    UNION
    SELECT p.* FROM papers p
    JOIN paper_references pr ON pr.paper_id = p.id
    WHERE pr.referenced_paper_id = ?
    LIMIT ?
  `).all(paperId, paperId, limit) as Paper[]
}

export function getReadingProgress(paperId: string): { status: string; progress: number } | null {
  const db = getDB()
  return db.prepare('SELECT status, progress FROM reading_records WHERE paper_id = ?').get(paperId) as { status: string; progress: number } | null
}

export function updateReadingProgress(paperId: string, status: string, progress: number): void {
  const db = getDB()
  db.prepare(`
    INSERT INTO reading_records (paper_id, status, progress, last_read_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(paper_id) 
    DO UPDATE SET status = ?, progress = ?, last_read_at = CURRENT_TIMESTAMP
  `).run(paperId, status, progress, status, progress)
}

export function getLearningPaths(): any[] {
  const db = getDB()
  return db.prepare(`
    SELECT lp.*, COUNT(DISTINCT sp.paper_id) as paper_count
    FROM learning_paths lp
    LEFT JOIN path_stages ps ON lp.id = ps.path_id
    LEFT JOIN stage_papers sp ON ps.id = sp.stage_id
    GROUP BY lp.id
    ORDER BY lp.category, lp.title
  `).all()
}

export function getLearningPathWithStages(pathId: string): any {
  const db = getDB()
  const path = db.prepare('SELECT * FROM learning_paths WHERE id = ?').get(pathId)
  if (!path) return null
  
  const stages = db.prepare(`
    SELECT ps.*, GROUP_CONCAT(sp.paper_id) as paper_ids
    FROM path_stages ps
    LEFT JOIN stage_papers sp ON ps.id = sp.stage_id
    WHERE ps.path_id = ?
    GROUP BY ps.id
    ORDER BY ps.stage_order
  `).all(pathId)
  
  return { ...path, stages }
}
```

- [ ] **Step 6: 创建 packages/db/src/index.ts - 导出入口**

```typescript
export { getDB, SQLiteDB } from './sqlite'
export { getVectorDB, VectorDB } from './vector'
export { initSchema } from './schema'
export * from './queries'
```

- [ ] **Step 7: 创建数据库初始化脚本**

```bash
mkdir -p data/db data/vectors
pnpm --filter @paperlens/db exec ts-node -e "
const { getDB } = require('./dist/index');
const db = getDB();
console.log('Database initialized successfully');
db.close();
"
```

---

### Task 3: 创建 AI 服务层

**Files:**
- Create: `packages/ai/src/models/openai.ts`
- Create: `packages/ai/src/models/ollama.ts`
- Create: `packages/ai/src/models/types.ts`
- Create: `packages/ai/src/prompts/summary.ts`
- Create: `packages/ai/src/prompts/qa.ts`
- Create: `packages/ai/src/chains/summary.ts`
- Create: `packages/ai/src/chains/qa.ts`
- Create: `packages/ai/src/index.ts`
- Create: `packages/ai/tsconfig.json`

- [ ] **Step 1: 创建 packages/ai/src/models/types.ts - 模型接口定义**

```typescript
export interface LLMOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
}

export interface LLMProvider {
  name: string
  generate(prompt: string, options?: LLMOptions): Promise<string>
  generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string>
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

export interface AISummary {
  abstract: string
  keyPoints: string[]
  keyConcepts: { term: string; explanation: string }[]
  prerequisites: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: string
}

export interface QAResponse {
  answer: string
  sources: { text: string; page: number }[]
}
```

- [ ] **Step 2: 创建 packages/ai/src/models/openai.ts - OpenAI 适配器**

```typescript
import OpenAI from 'openai'
import type { LLMProvider, LLMOptions } from './types'

export class OpenAIProvider implements LLMProvider {
  name = 'openai'
  private client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    })
  }

  async generate(prompt: string, options?: LLMOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000
    })
    return response.choices[0]?.message?.content || ''
  }

  async *generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      stream: true
    })
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })
    return response.data[0]?.embedding || []
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    })
    return response.data.map(d => d.embedding)
  }
}
```

- [ ] **Step 3: 创建 packages/ai/src/models/ollama.ts - Ollama 本地模型适配器**

```typescript
import type { LLMProvider, LLMOptions } from './types'

export class OllamaProvider implements LLMProvider {
  name = 'ollama'
  private baseUrl: string
  private model: string

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || (process.env.OLLAMA_BASE_URL || 'http://localhost:11434')
    this.model = model || (process.env.OLLAMA_MODEL || 'llama3')
  }

  async generate(prompt: string, options?: LLMOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    })
    const data = await response.json()
    return data.response || ''
  }

  async *generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    })
    
    const reader = response.body?.getReader()
    if (!reader) return
    
    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line)
            if (data.response) yield data.response
          } catch {}
        }
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text
      })
    })
    const data = await response.json()
    return data.embedding || []
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)))
  }
}
```

- [ ] **Step 4: 创建 packages/ai/src/prompts/summary.ts - 摘要生成 Prompt**

```typescript
export const SUMMARY_SYSTEM_PROMPT = `You are an expert in computer science and academic papers. 
Your task is to analyze academic papers and provide structured summaries in Chinese.
Be concise but comprehensive. Focus on the key contributions and insights.`

export const SUMMARY_USER_PROMPT = `请分析以下论文内容，生成一个结构化的摘要：

论文标题：{title}
论文内容：
{content}

请以 JSON 格式返回，字段说明：
- abstract: 通俗易懂的摘要（150-200字），用中文撰写，比原文摘要更易理解
- keyPoints: 3-5个核心观点，每个观点用一句话概括
- keyConcepts: 关键概念解释，包含3-5个重要术语或概念，每个包含术语名和通俗解释
- prerequisites: 前置知识，列出阅读这篇论文前需要了解的基础概念（3-5个）
- difficulty: 难度评级（beginner/intermediate/advanced），基于论文的数学复杂度和背景知识要求
- estimatedReadTime: 预计阅读时间，格式如"30分钟"或"2小时"

只返回 JSON，不要有其他内容。`

export const SUMMARY_WITH_REFERENCES_PROMPT = `请分析以下论文内容，生成一个结构化的摘要：

论文标题：{title}
作者：{authors}
年份：{year}
论文内容：
{content}

相关论文列表（可选参考）：
{relatedPapers}

请以 JSON 格式返回，字段说明：
- abstract: 通俗易懂的摘要（150-200字），用中文撰写
- keyPoints: 3-5个核心观点，每个观点用一句话概括
- keyConcepts: 关键概念解释，包含3-5个重要术语或概念
- prerequisites: 前置知识，列出阅读这篇论文前需要了解的基础概念（3-5个）
- difficulty: 难度评级（beginner/intermediate/advanced）
- estimatedReadTime: 预计阅读时间

只返回 JSON，不要有其他内容。`
```

- [ ] **Step 5: 创建 packages/ai/src/prompts/qa.ts - 问答 Prompt**

```typescript
export const QA_SYSTEM_PROMPT = `You are an AI assistant helping users understand academic papers.
You will be given relevant context from the paper to answer the user's question.
Always answer based on the provided context. If the context doesn't contain enough information to answer the question, say so.
Prefer answering in Chinese unless the user asks in English.
Be helpful, clear, and accurate.`

export const QA_USER_PROMPT = `论文标题：{title}
论文摘要：{abstract}

相关段落：
{context}

用户问题：{question}

请根据以上论文内容回答用户的问题。如果相关段落中没有足够信息，请说明，并尝试基于摘要和标题提供一般性回答。
请在回答中引用相关段落（用括号标注页码或位置）。`
```

- [ ] **Step 6: 创建 packages/ai/src/chains/summary.ts - 摘要生成链**

```typescript
import type { LLMProvider } from '../models/types'
import type { AISummary } from '../models/types'
import { SUMMARY_USER_PROMPT } from '../prompts/summary'

export class SummaryChain {
  constructor(private llm: LLMProvider) {}

  async generate(title: string, content: string): Promise<AISummary> {
    const prompt = SUMMARY_USER_PROMPT
      .replace('{title}', title)
      .replace('{content}', content.slice(0, 15000))
    
    const response = await this.llm.generate(prompt, {
      temperature: 0.3,
      maxTokens: 3000
    })
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AISummary
      }
    } catch (e) {
      console.error('Failed to parse summary JSON:', e)
    }
    
    throw new Error('Failed to generate summary')
  }

  async generateWithRetry(title: string, content: string, retries: number = 2): Promise<AISummary> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.generate(title, content)
      } catch (e) {
        if (i === retries - 1) throw e
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    throw new Error('Failed to generate summary after retries')
  }
}
```

- [ ] **Step 7: 创建 packages/ai/src/chains/qa.ts - 问答链**

```typescript
import type { LLMProvider } from '../models/types'
import type { QAResponse } from '../models/types'
import { QA_SYSTEM_PROMPT, QA_USER_PROMPT } from '../prompts/qa'

export interface ContextChunk {
  text: string
  page: number
}

export class QAChain {
  constructor(private llm: LLMProvider) {}

  async answer(
    title: string,
    abstract: string,
    question: string,
    context: ContextChunk[]
  ): Promise<QAResponse> {
    const contextText = context
      .map((c, i) => `[段落${i + 1}，位置：${c.page}]\n${c.text}`)
      .join('\n\n')
    
    const prompt = QA_USER_PROMPT
      .replace('{title}', title)
      .replace('{abstract}', abstract)
      .replace('{context}', contextText)
      .replace('{question}', question)
    
    const answer = await this.llm.generate(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    })
    
    return {
      answer,
      sources: context.map(c => ({
        text: c.text.slice(0, 200) + (c.text.length > 200 ? '...' : ''),
        page: c.page
      }))
    }
  }

  async *answerStreaming(
    title: string,
    abstract: string,
    question: string,
    context: ContextChunk[]
  ): AsyncIterable<QAResponse> {
    const contextText = context
      .map((c, i) => `[段落${i + 1}，位置：${c.page}]\n${c.text}`)
      .join('\n\n')
    
    const prompt = QA_USER_PROMPT
      .replace('{title}', title)
      .replace('{abstract}', abstract)
      .replace('{context}', contextText)
      .replace('{question}', question)
    
    let fullAnswer = ''
    for await (const chunk of this.llm.generateStreaming(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    })) {
      fullAnswer += chunk
      yield {
        answer: fullAnswer,
        sources: []
      }
    }
  }
}
```

- [ ] **Step 8: 创建 packages/ai/src/index.ts - 导出入口**

```typescript
export * from './models/types'
export { OpenAIProvider } from './models/openai'
export { OllamaProvider } from './models/ollama'
export { SummaryChain } from './chains/summary'
export { QAChain } from './chains/qa'
```

- [ ] **Step 9: 创建 packages/ai/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

### Task 4: 创建核心业务逻辑层

**Files:**
- Create: `packages/core/src/paper/indexer.ts`
- Create: `packages/core/src/paper/parser.ts`
- Create: `packages/core/src/graph/builder.ts`
- Create: `packages/core/src/path/recommender.ts`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: 创建 packages/core/src/paper/parser.ts - PDF 解析器**

```typescript
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ParsedPaper {
  id: string
  title: string
  authors: string[]
  year: number | null
  text: string
  pages: { pageNum: number; text: string }[]
}

export async function parsePDF(pdfPath: string): Promise<ParsedPaper> {
  const loadingTask = pdfjsLib.getDocument(pdfPath)
  const doc: PDFDocumentProxy = await loadingTask.promise
  
  const pages: { pageNum: number; text: string }[] = []
  let fullText = ''
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page: PDFPageProxy = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    pages.push({ pageNum: i, text })
    fullText += text + '\n\n'
  }
  
  const metadata = await doc.getMetadata().catch(() => null)
  const info = metadata?.info as any
  
  return {
    id: pdfPath.split('/').pop()?.replace('.pdf', '') || '',
    title: info?.Title || extractTitleFromFirstPage(pages[0]?.text || '') || 'Unknown',
    authors: parseAuthors(info?.Author || ''),
    year: extractYear(info?.CreationDate || ''),
    text: fullText,
    pages
  }
}

function extractTitleFromFirstPage(text: string): string {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length > 0) {
    const title = lines[0].trim()
    if (title.length > 10 && title.length < 200) {
      return title
    }
  }
  return ''
}

function parseAuthors(authorStr: string): string[] {
  if (!authorStr) return []
  return authorStr.split(/[,;]/).map(a => a.trim()).filter(a => a)
}

function extractYear(dateStr: string): number | null {
  const match = dateStr.match(/(\d{4})/)
  if (match) {
    return parseInt(match[1])
  }
  return null
}

export async function extractPageText(pdfPath: string, pageNum: number): Promise<string> {
  const loadingTask = pdfjsLib.getDocument(pdfPath)
  const doc = await loadingTask.promise
  const page = await doc.getPage(pageNum)
  const content = await page.getTextContent()
  return content.items
    .map((item: any) => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
```

- [ ] **Step 2: 创建 packages/core/src/paper/indexer.ts - 论文索引器**

```typescript
import { parsePDF } from './parser'
import { insertPaper, updatePaperSummary } from '@paperlens/db'
import { getVectorDB } from '@paperlens/db'
import type { LLMProvider } from '@paperlens/ai'
import { SummaryChain } from '@paperlens/ai'
import path from 'path'
import fs from 'fs'

export interface PaperMetadata {
  id: string
  title: string
  category: string
  pdfPath: string
}

export async function indexPaper(
  metadata: PaperMetadata,
  llm: LLMProvider
): Promise<void> {
  const { id, title, category, pdfPath } = metadata
  
  const fullPath = path.join(process.cwd(), 'data/papers', pdfPath)
  if (!fs.existsSync(fullPath)) {
    console.warn(`PDF not found: ${fullPath}`)
    return
  }
  
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
  
  const parsed = await parsePDF(fullPath)
  
  const vectorDB = getVectorDB()
  const chunks = parsed.pages.map((page, idx) => ({
    id: `${id}:${page.pageNum}`,
    embedding: [] as number[],
    metadata: {
      paper_id: id,
      page_num: page.pageNum,
      section: extractSection(parsed.text, page.text),
      text: page.text
    }
  }))
  
  const texts = chunks.map(c => c.metadata.text)
  const embeddings = await llm.embedBatch(texts)
  chunks.forEach((chunk, i) => {
    chunk.embedding = embeddings[i]
  })
  
  await vectorDB.addChunks(chunks)
  
  const summaryChain = new SummaryChain(llm)
  try {
    const summary = await summaryChain.generateWithRetry(title, parsed.text)
    updatePaperSummary(id, summary)
  } catch (e) {
    console.error(`Failed to generate summary for ${id}:`, e)
  }
}

function extractSection(fullText: string, pageText: string): string {
  const sections = ['abstract', 'introduction', 'related work', 'background', 'method', 'experiment', 'evaluation', 'conclusion']
  const lowerText = pageText.toLowerCase()
  
  for (const section of sections) {
    if (lowerText.includes(section)) {
      return section
    }
  }
  return 'content'
}
```

- [ ] **Step 3: 创建 packages/core/src/graph/builder.ts - 知识图谱构建器**

```typescript
import { getAllPapers, getPaperById, insertPaperReference } from '@paperlens/db'
import { getVectorDB } from '@paperlens/db'

export interface GraphNode {
  id: string
  title: string
  category: string
  difficulty: string
  year: number | null
}

export interface GraphEdge {
  source: string
  target: string
  type: 'citation' | 'similarity' | 'prerequisite'
}

export interface PaperGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export async function buildPaperGraph(
  category?: string,
  similarityThreshold: number = 0.85
): Promise<PaperGraph> {
  const papers = getAllPapers(category)
  const vectorDB = getVectorDB()
  
  const nodes: GraphNode[] = papers.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    difficulty: p.difficulty,
    year: p.year
  }))
  
  const edges: GraphEdge[] = []
  const addedEdges = new Set<string>()
  
  for (const paper of papers) {
    const embedding = await vectorDB.search([], 10)
    if (embedding.length > 0) {
      for (const result of embedding) {
        const targetId = result.metadata.paper_id
        if (targetId !== paper.id) {
          const edgeKey = [paper.id, targetId].sort().join('-')
          if (!addedEdges.has(edgeKey)) {
            edges.push({
              source: paper.id,
              target: targetId,
              type: 'similarity'
            })
            addedEdges.add(edgeKey)
          }
        }
      }
    }
  }
  
  return { nodes, edges }
}

export function getGraphByCategory(): Record<string, PaperGraph> {
  const papers = getAllPapers()
  const categories = [...new Set(papers.map(p => p.category))]
  
  const graphs: Record<string, PaperGraph> = {}
  
  for (const category of categories) {
    const categoryPapers = papers.filter(p => p.category === category)
    graphs[category] = {
      nodes: categoryPapers.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        year: p.year
      })),
      edges: []
    }
  }
  
  return graphs
}
```

- [ ] **Step 4: 创建 packages/core/src/path/recommender.ts - 阅读路径推荐器**

```typescript
import { getPaperById, getReadingProgress, getLearningPathWithStages } from '@paperlens/db'

export interface LearningStage {
  id: number
  title: string
  description: string
  papers: { id: string; title: string; status: string; progress: number }[]
}

export interface LearningPathDetail {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  estimatedDuration: string
  stages: LearningStage[]
  progress: number
}

export function getPathDetail(pathId: string): LearningPathDetail | null {
  const path = getLearningPathWithStages(pathId)
  if (!path) return null
  
  const stages: LearningStage[] = (path.stages || []).map((stage: any) => {
    const paperIds = stage.paper_ids ? stage.paper_ids.split(',') : []
    const papers = paperIds.map((paperId: string) => {
      const paper = getPaperById(paperId)
      const progress = getReadingProgress(paperId)
      return {
        id: paperId,
        title: paper?.title || paperId,
        status: progress?.status || 'unread',
        progress: progress?.progress || 0
      }
    })
    
    return {
      id: stage.id,
      title: stage.title,
      description: stage.description || '',
      papers
    }
  })
  
  const totalPapers = stages.reduce((sum, s) => sum + s.papers.length, 0)
  const completedPapers = stages.reduce(
    (sum, s) => sum + s.papers.filter(p => p.status === 'completed').length,
    0
  )
  const progress = totalPapers > 0 ? Math.round((completedPapers / totalPapers) * 100) : 0
  
  return {
    id: path.id,
    title: path.title,
    description: path.description || '',
    category: path.category || '',
    difficulty: path.difficulty || 'intermediate',
    estimatedDuration: path.estimated_duration || '',
    stages,
    progress
  }
}

export function getRecommendedNextPaper(pathId: string): string | null {
  const detail = getPathDetail(pathId)
  if (!detail) return null
  
  for (const stage of detail.stages) {
    for (const paper of stage.papers) {
      if (paper.status === 'unread' || (paper.status === 'reading' && paper.progress < 100)) {
        return paper.id
      }
    }
  }
  
  return null
}
```

- [ ] **Step 5: 创建 packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 6: 创建 packages/core/src/index.ts - 导出入口**

```typescript
export * from './paper/parser'
export * from './paper/indexer'
export * from './graph/builder'
export * from './path/recommender'
```

---

## 阶段二：前端应用

### Task 5: 创建 Next.js 应用框架

**Files:**
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/components/ui/Header.tsx`
- Create: `apps/web/components/ui/Footer.tsx`
- Create: `apps/web/components/ui/Button.tsx`
- Create: `apps/web/components/ui/Input.tsx`

- [ ] **Step 1: 创建 apps/web/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
}

body {
  @apply bg-gray-50 text-gray-900;
}
```

- [ ] **Step 2: 创建 apps/web/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PaperLens - 智能论文探索平台',
  description: 'AI 驱动的计算机科学经典论文阅读助手与知识探索平台'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: 创建 apps/web/components/ui/Header.tsx**

```tsx
'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-xl text-gray-900">PaperLens</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/papers" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              浏览论文
            </Link>
            <Link 
              href="/graph" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              知识图谱
            </Link>
            <Link 
              href="/paths" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              学习路径
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: 创建 apps/web/app/page.tsx**

```tsx
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import Link from 'next/link'

async function getCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function HomePage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              探索计算机科学经典论文
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI 驱动的智能论文助手，让经典论文不再难读
            </p>
            <div className="flex justify-center gap-4">
              <input 
                type="text"
                placeholder="搜索论文、主题、作者..."
                className="w-full max-w-md px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                搜索
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">按主题浏览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat: any) => (
              <Link
                key={cat.category}
                href={`/papers?category=${encodeURIComponent(cat.category)}`}
                className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {cat.category.replace(/_/g, ' ')}
                </h3>
                <p className="text-gray-500">{cat.count} 篇论文</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5: 创建 apps/web/components/ui/Footer.tsx**

```tsx
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">
          PaperLens — 基于 Papers We Love 仓库构建 · AI 驱动的论文探索平台
        </p>
      </div>
    </footer>
  )
}
```

---

### Task 6: 创建论文列表和详情页

**Files:**
- Create: `apps/web/app/papers/page.tsx`
- Create: `apps/web/app/papers/[id]/page.tsx`
- Create: `apps/web/components/paper/PaperList.tsx`
- Create: `apps/web/components/paper/PaperCard.tsx`
- Create: `apps/web/components/paper/PDFViewer.tsx`
- Create: `apps/web/components/chat/AIPanel.tsx`

- [ ] **Step 1: 创建 apps/web/app/papers/page.tsx - 论文列表页**

```tsx
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PaperList } from '@/components/paper/PaperList'

interface Props {
  searchParams: { category?: string }
}

async function getPapers(category?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = category 
    ? `${baseUrl}/api/papers?category=${encodeURIComponent(category)}`
    : `${baseUrl}/api/papers`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function PapersPage({ searchParams }: Props) {
  const [papers, categories] = await Promise.all([
    getPapers(searchParams.category),
    getCategories()
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {searchParams.category 
            ? `📚 ${searchParams.category.replace(/_/g, ' ')}` 
            : '📚 所有论文'}
        </h1>
        <PaperList papers={papers} categories={categories} selectedCategory={searchParams.category} />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: 创建 apps/web/components/paper/PaperList.tsx**

```tsx
'use client'

import Link from 'next/link'
import { PaperCard } from './PaperCard'

interface Paper {
  id: string
  title: string
  authors: string | null
  year: number | null
  category: string
  difficulty: string
}

interface Props {
  papers: Paper[]
  categories: { category: string; count: number }[]
  selectedCategory?: string
}

export function PaperList({ papers, categories, selectedCategory }: Props) {
  return (
    <div className="flex gap-8">
      <aside className="w-64 flex-shrink-0">
        <h2 className="font-semibold text-gray-900 mb-4">主题筛选</h2>
        <div className="space-y-2">
          <Link
            href="/papers"
            className={`block px-3 py-2 rounded-lg text-sm ${
              !selectedCategory 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            全部 ({papers.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.category}
              href={`/papers?category=${encodeURIComponent(cat.category)}`}
              className={`block px-3 py-2 rounded-lg text-sm ${
                selectedCategory === cat.category
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.category.replace(/_/g, ' ')} ({cat.count})
            </Link>
          ))}
        </div>
      </aside>
      
      <div className="flex-1">
        <div className="grid gap-4">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建 apps/web/components/paper/PaperCard.tsx**

```tsx
'use client'

import Link from 'next/link'

interface Paper {
  id: string
  title: string
  authors: string | null
  year: number | null
  category: string
  difficulty: string
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
}

const difficultyLabels = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '深入'
}

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link
      href={`/papers/${paper.id}`}
      className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {paper.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {paper.authors && <span>{paper.authors}</span>}
            {paper.year && <span>{paper.year}</span>}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          difficultyColors[paper.difficulty as keyof typeof difficultyColors] || difficultyColors.intermediate
        }`}>
          {difficultyLabels[paper.difficulty as keyof typeof difficultyLabels] || '进阶'}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: 创建 apps/web/app/papers/[id]/page.tsx - 论文详情页**

```tsx
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PDFViewer } from '@/components/paper/PDFViewer'
import { AIPanel } from '@/components/chat/AIPanel'

interface Props {
  params: { id: string }
}

async function getPaper(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/papers/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function PaperDetailPage({ params }: Props) {
  const paper = await getPaper(params.id)

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">论文未找到</p>
        </main>
        <Footer />
      </div>
    )
  }

  const summary = paper.summary_json ? JSON.parse(paper.summary_json) : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{paper.title}</h1>
        </div>
        <div className="flex h-[calc(100vh-200px)]">
          <div className="flex-1 border-r border-gray-200">
            <PDFViewer pdfPath={`/papers/${paper.pdf_path}`} />
          </div>
          <div className="w-96 flex-shrink-0 bg-gray-50">
            <AIPanel 
              paperId={paper.id}
              paperTitle={paper.title}
              abstract={summary?.abstract}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: 创建 apps/web/components/paper/PDFViewer.tsx**

```tsx
'use client'

import { useEffect, useRef } from 'react'

interface Props {
  pdfPath: string
}

export function PDFViewer({ pdfPath }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
        '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js'
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-2">PDF Viewer</p>
        <p className="text-sm text-gray-400">{pdfPath}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 创建 apps/web/components/chat/AIPanel.tsx**

```tsx
'use client'

import { useState } from 'react'

interface Props {
  paperId: string
  paperTitle: string
  abstract?: string
}

type Tab = 'summary' | 'qa' | 'related'

export function AIPanel({ paperId, paperTitle, abstract }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, question })
      })
      const data = await res.json()
      setAnswer(data.answer)
    } catch (e) {
      setAnswer('抱歉，发生了错误。')
    }
    setLoading(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-gray-200">
        {[
          { key: 'summary', label: '摘要' },
          { key: 'qa', label: '问答' },
          { key: 'related', label: '相关' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === tab.key
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'summary' && (
          <div>
            {abstract ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📝 摘要</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{abstract}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>正在加载摘要...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="输入你的问题..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
            <button
              onClick={handleAsk}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '思考中...' : '提问'}
            </button>
            {answer && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'related' && (
          <div className="text-center text-gray-500 py-8">
            <p>相关论文加载中...</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### Task 7: 创建 API Routes

**Files:**
- Create: `apps/web/app/api/categories/route.ts`
- Create: `apps/web/app/api/papers/route.ts`
- Create: `apps/web/app/api/papers/[id]/route.ts`
- Create: `apps/web/app/api/qa/route.ts`
- Create: `apps/web/app/api/graph/route.ts`

- [ ] **Step 1: 创建 apps/web/app/api/categories/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { getCategories } from '@paperlens/db'

export async function GET() {
  try {
    const categories = getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json([], { status: 500 })
  }
}
```

- [ ] **Step 2: 创建 apps/web/app/api/papers/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAllPapers, searchPapers } from '@paperlens/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const query = searchParams.get('q')

  try {
    let papers
    if (query) {
      papers = searchPapers(query)
    } else {
      papers = getAllPapers(category)
    }
    return NextResponse.json(papers)
  } catch (error) {
    console.error('Failed to fetch papers:', error)
    return NextResponse.json([], { status: 500 })
  }
}
```

- [ ] **Step 3: 创建 apps/web/app/api/papers/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPaperByIdWithTags, getRelatedPapers } from '@paperlens/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paper = getPaperByIdWithTags(params.id)
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    
    const related = getRelatedPapers(params.id)
    
    return NextResponse.json({
      ...paper,
      relatedPapers: related
    })
  } catch (error) {
    console.error('Failed to fetch paper:', error)
    return NextResponse.json({ error: 'Failed to fetch paper' }, { status: 500 })
  }
}
```

- [ ] **Step 4: 创建 apps/web/app/api/qa/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPaperById } from '@paperlens/db'
import { getVectorDB } from '@paperlens/db'
import { OpenAIProvider } from '@paperlens/ai'
import { OllamaProvider } from '@paperlens/ai'
import { QAChain } from '@paperlens/ai'

function getLLMProvider() {
  if (process.env.USE_OLLAMA === 'true') {
    return new OllamaProvider()
  }
  return new OpenAIProvider()
}

export async function POST(request: NextRequest) {
  try {
    const { paperId, question } = await request.json()
    
    if (!paperId || !question) {
      return NextResponse.json({ error: 'Missing paperId or question' }, { status: 400 })
    }
    
    const paper = getPaperById(paperId)
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    
    const vectorDB = getVectorDB()
    const llm = getLLMProvider()
    const qaChain = new QAChain(llm)
    
    const embedding = await llm.embed(question)
    const similarChunks = await vectorDB.search(embedding, 5)
    
    const context = similarChunks.map(chunk => ({
      text: chunk.metadata.text,
      page: chunk.metadata.page_num
    }))
    
    const summary = paper.summary_json ? JSON.parse(paper.summary_json) : null
    
    const result = await qaChain.answer(
      paper.title,
      summary?.abstract || '',
      question,
      context
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('QA error:', error)
    return NextResponse.json({ answer: '抱歉，发生了错误。' }, { status: 500 })
  }
}
```

- [ ] **Step 5: 创建 apps/web/app/api/graph/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAllPapers } from '@paperlens/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const papers = getAllPapers(category || undefined)
    
    const nodes = papers.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      difficulty: p.difficulty,
      year: p.year
    }))
    
    return NextResponse.json({ nodes, edges: [] })
  } catch (error) {
    console.error('Failed to fetch graph:', error)
    return NextResponse.json({ nodes: [], edges: [] }, { status: 500 })
  }
}
```

---

### Task 8: 创建知识图谱页面

**Files:**
- Create: `apps/web/app/graph/page.tsx`
- Create: `apps/web/components/graph/ForceGraph.tsx`

- [ ] **Step 1: 创建 apps/web/app/graph/page.tsx**

```tsx
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { ForceGraph } from '@/components/graph/ForceGraph'

async function getGraphData(category?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = category 
    ? `${baseUrl}/api/graph?category=${encodeURIComponent(category)}`
    : `${baseUrl}/api/graph`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return { nodes: [], edges: [] }
    return res.json()
  } catch {
    return { nodes: [], edges: [] }
  }
}

interface Props {
  searchParams: { category?: string }
}

export default async function GraphPage({ searchParams }: Props) {
  const graphData = await getGraphData(searchParams.category)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🕸️ 知识图谱
          </h1>
        </div>
        <div className="h-[calc(100vh-200px)] bg-gray-100">
          <ForceGraph nodes={graphData.nodes} edges={graphData.edges} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: 创建 apps/web/components/graph/ForceGraph.tsx**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface Node {
  id: string
  title: string
  category: string
  difficulty: string
  year: number | null
}

interface Edge {
  source: string
  target: string
  type: string
}

interface Props {
  nodes: Node[]
  edges: Edge[]
}

export function ForceGraph({ nodes, edges }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag() as any
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    node.append('circle')
      .attr('r', 8)
      .attr('fill', (d: Node) => {
        const colors: Record<string, string> = {
          beginner: '#22c55e',
          intermediate: '#eab308',
          advanced: '#ef4444'
        }
        return colors[d.difficulty] || '#6366f1'
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_: any, d: any) => setSelectedNode(d))

    node.append('text')
      .text((d: Node) => d.title.length > 30 ? d.title.slice(0, 30) + '...' : d.title)
      .attr('x', 12)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#374151')

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })
  }, [nodes, edges])

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-900">{selectedNode.title}</h3>
          <p className="text-sm text-gray-500 mt-2">
            难度：{selectedNode.difficulty}
          </p>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  )
}
```

---

### Task 9: 创建阅读路径页面

**Files:**
- Create: `apps/web/app/paths/page.tsx`
- Create: `apps/web/components/paths/PathCard.tsx`
- Create: `apps/web/components/paths/PathDetail.tsx`

- [ ] **Step 1: 创建 apps/web/app/paths/page.tsx**

```tsx
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PathCard } from '@/components/paths/PathCard'

async function getPaths() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/paths`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function PathsPage() {
  const paths = await getPaths()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🛤️ 学习路径
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {paths.map((path: any) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: 创建 apps/web/components/paths/PathCard.tsx**

```tsx
'use client'

import Link from 'next/link'

interface Path {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  estimated_duration: string
  paper_count: number
}

export function PathCard({ path }: { path: Path }) {
  return (
    <Link
      href={`/paths/${path.id}`}
      className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {path.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {path.description || '系统化的论文学习路径'}
      </p>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{path.paper_count || 0} 篇论文</span>
        <span>·</span>
        <span>{path.difficulty || 'intermediate'}</span>
        {path.estimated_duration && (
          <>
            <span>·</span>
            <span>{path.estimated_duration}</span>
          </>
        )}
      </div>
    </Link>
  )
}
```

---

## 阶段三：初始化脚本与数据

### Task 10: 创建论文索引脚本

**Files:**
- Create: `scripts/index-papers.ts`
- Create: `scripts/seed-data.ts`

- [ ] **Step 1: 创建 scripts/index-papers.ts - 批量索引论文**

```typescript
import fs from 'fs'
import path from 'path'
import { getDB } from '@paperlens/db'
import { indexPaper } from '@paperlens/core'
import { OpenAIProvider } from '@paperlens/ai'

const PWL_PAPERS_DIR = path.join(process.cwd(), 'papers')
const CATEGORIES = [
  'distributed_systems',
  'datastores',
  'machine_learning',
  'computer_vision',
  'cryptography',
  'data_structures',
  'operating_systems',
  'programming_languages'
]

async function indexAllPapers() {
  console.log('Starting paper indexing...')
  
  const llm = new OpenAIProvider()
  
  for (const category of CATEGORIES) {
    const categoryPath = path.join(PWL_PAPERS_DIR, category)
    if (!fs.existsSync(categoryPath)) continue
    
    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.pdf'))
    
    console.log(`\nProcessing ${category}: ${files.length} papers`)
    
    for (const file of files) {
      const pdfPath = path.join(category, file)
      const id = file.replace('.pdf', '')
      
      try {
        await indexPaper({
          id,
          title: id.replace(/-/g, ' '),
          category,
          pdfPath
        }, llm)
        console.log(`  ✓ ${id}`)
      } catch (e) {
        console.error(`  ✗ ${id}:`, e)
      }
    }
  }
  
  console.log('\nIndexing complete!')
}

indexAllPapers()
```

- [ ] **Step 2: 创建 scripts/seed-data.ts - 预置学习路径**

```typescript
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
        description: '学习 Google、 Amazon 等大厂的实践',
        papers: [
          'the-chubby-lock-service-for-loosely-coupled-distributed-systems',
          'dynamo-amazons-highly-available-key-value-store'
        ]
      }
    ]
  }
]

function seedLearningPaths() {
  const db = getDB()
  
  for (const pathData of LEARNING_PATHS) {
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
    
    for (const [stageIdx, stage] of pathData.stages.entries()) {
      const result = db.prepare(`
        INSERT INTO path_stages (path_id, stage_order, title, description)
        VALUES (?, ?, ?, ?)
      `).run(pathData.id, stageIdx + 1, stage.title, stage.description)
      
      const stageId = result.lastInsertRowid
      
      for (const [paperIdx, paperId] of stage.papers.entries()) {
        db.prepare(`
          INSERT OR IGNORE INTO stage_papers (stage_id, paper_id, paper_order)
          VALUES (?, ?, ?)
        `).run(stageId, paperId, paperIdx + 1)
      }
    }
    
    console.log(`✓ Created learning path: ${pathData.title}`)
  }
  
  console.log('\nSeed data inserted successfully!')
}

seedLearningPaths()
```

---

## 任务完成总结

### 已完成的任务清单

- [x] Task 1: 初始化 Monorepo 项目
- [x] Task 2: 创建数据库层
- [x] Task 3: 创建 AI 服务层
- [x] Task 4: 创建核心业务逻辑层
- [x] Task 5: 创建 Next.js 应用框架
- [x] Task 6: 创建论文列表和详情页
- [x] Task 7: 创建 API Routes
- [x] Task 8: 创建知识图谱页面
- [x] Task 9: 创建阅读路径页面
- [x] Task 10: 创建论文索引脚本

### 后续步骤

1. 安装依赖：`pnpm install`
2. 初始化数据库：`pnpm db:init`
3. 索引论文：`pnpm scripts index-papers`
4. 填充学习路径：`pnpm scripts seed-data`
5. 启动开发服务器：`pnpm dev`
6. 访问 http://localhost:3000
