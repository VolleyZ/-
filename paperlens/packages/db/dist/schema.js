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
`;
export function initSchema(db) {
    db.exec(SCHEMA_SQL);
}
