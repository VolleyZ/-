import { getAllPapers } from '@paperlens/db';
/**
 * 构建论文知识图谱
 */
export function buildPaperGraph(category) {
    const papers = getAllPapers(category);
    const nodes = papers.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        year: p.year
    }));
    // 目前返回空边，后续可以通过分析论文引用关系来构建边
    return { nodes, edges: [] };
}
/**
 * 按分类获取图谱
 */
export function getGraphByCategory() {
    const papers = getAllPapers();
    const categories = [...new Set(papers.map(p => p.category))];
    const graphs = {};
    for (const category of categories) {
        const categoryPapers = papers.filter(p => p.category === category);
        graphs[category] = {
            nodes: categoryPapers.map(p => ({
                id: p.id,
                title: p.title,
                category: p.category,
                difficulty: p.difficulty,
                year: p.year
            })),
            edges: []
        };
    }
    return graphs;
}
/**
 * 获取主题聚类信息
 */
export function getTopicClusters() {
    const papers = getAllPapers();
    const categoryMap = new Map();
    for (const paper of papers) {
        const nodes = categoryMap.get(paper.category) || [];
        nodes.push({
            id: paper.id,
            title: paper.title,
            category: paper.category,
            difficulty: paper.difficulty,
            year: paper.year
        });
        categoryMap.set(paper.category, nodes);
    }
    return Array.from(categoryMap.entries()).map(([category, papers]) => ({
        category,
        papers
    }));
}
