export interface LearningStage {
    id: number;
    title: string;
    description: string;
    papers: {
        id: string;
        title: string;
        status: string;
        progress: number;
    }[];
}
export interface LearningPathDetail {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedDuration: string;
    stages: LearningStage[];
    progress: number;
}
/**
 * 获取学习路径详情（包含用户进度）
 */
export declare function getPathDetail(pathId: string): LearningPathDetail | null;
/**
 * 获取推荐的下一步阅读论文
 */
export declare function getRecommendedNextPaper(pathId: string): string | null;
/**
 * 获取学习路径的总体统计信息
 */
export declare function getPathStats(pathId: string): {
    totalPapers: number;
    completedPapers: number;
    inProgressPapers: number;
    unreadPapers: number;
    progress: number;
} | null;
//# sourceMappingURL=recommender.d.ts.map