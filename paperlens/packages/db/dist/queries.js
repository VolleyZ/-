import { getDB } from './sqlite';
export function getAllPapers(category) {
    const db = getDB();
    if (category) {
        return db.prepare('SELECT * FROM papers WHERE category = ? ORDER BY title').all(category);
    }
    return db.prepare('SELECT * FROM papers ORDER BY title').all();
}
export function getPaperById(id) {
    const db = getDB();
    return db.prepare('SELECT * FROM papers WHERE id = ?').get(id);
}
export function getPaperByIdWithTags(id) {
    const db = getDB();
    const paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(id);
    if (!paper)
        return null;
    const tags = db.prepare(`
    SELECT t.name FROM tags t
    JOIN paper_tags pt ON t.id = pt.tag_id
    WHERE pt.paper_id = ?
  `).all(id).map((row) => row.name);
    return { ...paper, tags };
}
export function insertPaper(paper) {
    const db = getDB();
    db.prepare(`
    INSERT INTO papers (id, title, authors, year, category, pdf_path, difficulty, summary_json, summary_generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(paper.id, paper.title, paper.authors, paper.year, paper.category, paper.pdf_path, paper.difficulty, paper.summary_json, paper.summary_generated_at);
}
export function updatePaperSummary(id, summary) {
    const db = getDB();
    db.prepare(`
    UPDATE papers 
    SET summary_json = ?, summary_generated_at = datetime('now')
    WHERE id = ?
  `).run(JSON.stringify(summary), id);
}
export function getCategories() {
    const db = getDB();
    return db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM papers 
    GROUP BY category 
    ORDER BY count DESC
  `).all();
}
export function searchPapers(query) {
    const db = getDB();
    return db.prepare(`
    SELECT * FROM papers 
    WHERE title LIKE ? OR authors LIKE ?
    ORDER BY title
  `).all(`%${query}%`, `%${query}%`);
}
export function getRelatedPapers(paperId, limit = 5) {
    const db = getDB();
    return db.prepare(`
    SELECT DISTINCT p.* FROM papers p
    JOIN paper_references pr ON p.id = pr.referenced_paper_id
    WHERE pr.paper_id = ?
    UNION
    SELECT DISTINCT p.* FROM papers p
    JOIN paper_references pr ON pr.paper_id = p.id
    WHERE pr.referenced_paper_id = ?
    LIMIT ?
  `).all(paperId, paperId, limit);
}
export function getReadingProgress(paperId) {
    const db = getDB();
    return db.prepare('SELECT status, progress FROM reading_records WHERE paper_id = ?').get(paperId);
}
export function updateReadingProgress(paperId, status, progress) {
    const db = getDB();
    db.prepare(`
    INSERT INTO reading_records (paper_id, status, progress, last_read_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(paper_id) 
    DO UPDATE SET status = ?, progress = ?, last_read_at = datetime('now')
  `).run(paperId, status, progress, status, progress);
}
export function getLearningPaths() {
    const db = getDB();
    return db.prepare(`
    SELECT lp.*, COUNT(DISTINCT sp.paper_id) as paper_count
    FROM learning_paths lp
    LEFT JOIN path_stages ps ON lp.id = ps.path_id
    LEFT JOIN stage_papers sp ON ps.id = sp.stage_id
    GROUP BY lp.id
    ORDER BY lp.category, lp.title
  `).all();
}
export function getLearningPathWithStages(pathId) {
    const db = getDB();
    const path = db.prepare('SELECT * FROM learning_paths WHERE id = ?').get(pathId);
    if (!path)
        return null;
    const stages = db.prepare(`
    SELECT ps.*, GROUP_CONCAT(sp.paper_id) as paper_ids
    FROM path_stages ps
    LEFT JOIN stage_papers sp ON ps.id = sp.stage_id
    WHERE ps.path_id = ?
    GROUP BY ps.id
    ORDER BY ps.stage_order
  `).all(pathId);
    return { ...path, stages };
}
