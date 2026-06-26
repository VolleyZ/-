export interface Paper {
    id: string;
    title: string;
    authors: string | null;
    year: number | null;
    category: string;
    pdf_path: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    summary_json: string | null;
    summary_generated_at: string | null;
    created_at: string;
    updated_at: string;
}
export interface PaperWithTags extends Paper {
    tags: string[];
}
export declare function getAllPapers(category?: string): Paper[];
export declare function getPaperById(id: string): Paper | null;
export declare function getPaperByIdWithTags(id: string): PaperWithTags | null;
export declare function insertPaper(paper: Omit<Paper, 'created_at' | 'updated_at'>): void;
export declare function updatePaperSummary(id: string, summary: object): void;
export declare function getCategories(): {
    category: string;
    count: number;
}[];
export declare function searchPapers(query: string): Paper[];
export declare function getRelatedPapers(paperId: string, limit?: number): Paper[];
export declare function getReadingProgress(paperId: string): {
    status: string;
    progress: number;
} | null;
export declare function updateReadingProgress(paperId: string, status: string, progress: number): void;
export declare function getLearningPaths(): any[];
export declare function getLearningPathWithStages(pathId: string): any;
//# sourceMappingURL=queries.d.ts.map