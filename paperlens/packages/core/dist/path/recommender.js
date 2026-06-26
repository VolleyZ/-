import { getPaperById, getReadingProgress, getLearningPathWithStages } from '@paperlens/db';
/**
 * 获取学习路径详情（包含用户进度）
 */
export function getPathDetail(pathId) {
    const path = getLearningPathWithStages(pathId);
    if (!path)
        return null;
    const stages = (path.stages || []).map((stage) => {
        const paperIds = stage.paper_ids ? stage.paper_ids.split(',') : [];
        const papers = paperIds.map((paperId) => {
            const paper = getPaperById(paperId);
            const progress = getReadingProgress(paperId);
            return {
                id: paperId,
                title: paper?.title || paperId,
                status: progress?.status || 'unread',
                progress: progress?.progress || 0
            };
        });
        return {
            id: stage.id,
            title: stage.title,
            description: stage.description || '',
            papers
        };
    });
    // 计算总体进度
    const totalPapers = stages.reduce((sum, s) => sum + s.papers.length, 0);
    const completedPapers = stages.reduce((sum, s) => sum + s.papers.filter(p => p.status === 'completed').length, 0);
    const progress = totalPapers > 0 ? Math.round((completedPapers / totalPapers) * 100) : 0;
    return {
        id: path.id,
        title: path.title,
        description: path.description || '',
        category: path.category || '',
        difficulty: path.difficulty || 'intermediate',
        estimatedDuration: path.estimated_duration || '',
        stages,
        progress
    };
}
/**
 * 获取推荐的下一步阅读论文
 */
export function getRecommendedNextPaper(pathId) {
    const detail = getPathDetail(pathId);
    if (!detail)
        return null;
    for (const stage of detail.stages) {
        for (const paper of stage.papers) {
            if (paper.status === 'unread' || (paper.status === 'reading' && paper.progress < 100)) {
                return paper.id;
            }
        }
    }
    return null;
}
/**
 * 获取学习路径的总体统计信息
 */
export function getPathStats(pathId) {
    const detail = getPathDetail(pathId);
    if (!detail)
        return null;
    const totalPapers = detail.stages.reduce((sum, s) => sum + s.papers.length, 0);
    const completedPapers = detail.stages.reduce((sum, s) => sum + s.papers.filter(p => p.status === 'completed').length, 0);
    const inProgressPapers = detail.stages.reduce((sum, s) => sum + s.papers.filter(p => p.status === 'reading').length, 0);
    const unreadPapers = totalPapers - completedPapers - inProgressPapers;
    return {
        totalPapers,
        completedPapers,
        inProgressPapers,
        unreadPapers,
        progress: detail.progress
    };
}
