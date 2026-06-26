import { getDB } from './sqlite'

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
    SET summary_json = ?, summary_generated_at = datetime('now')
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
    SELECT DISTINCT p.* FROM papers p
    JOIN paper_references pr ON p.id = pr.referenced_paper_id
    WHERE pr.paper_id = ?
    UNION
    SELECT DISTINCT p.* FROM papers p
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
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(paper_id) 
    DO UPDATE SET status = ?, progress = ?, last_read_at = datetime('now')
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
