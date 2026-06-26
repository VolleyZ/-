export interface GraphNode {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    year: number | null;
}
export interface GraphEdge {
    source: string;
    target: string;
    type: 'citation' | 'similarity' | 'prerequisite';
}
export interface PaperGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}
/**
 * 构建论文知识图谱
 */
export declare function buildPaperGraph(category?: string): PaperGraph;
/**
 * 按分类获取图谱
 */
export declare function getGraphByCategory(): Record<string, PaperGraph>;
/**
 * 获取主题聚类信息
 */
export declare function getTopicClusters(): {
    category: string;
    papers: GraphNode[];
}[];
//# sourceMappingURL=builder.d.ts.map