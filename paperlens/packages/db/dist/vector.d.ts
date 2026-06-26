export interface VectorChunk {
    id: string;
    embedding: number[];
    metadata: {
        paper_id: string;
        page_num: number;
        section: string;
        text: string;
    };
}
export declare class VectorDB {
    private client;
    private collectionName;
    private initialized;
    constructor(persistPath?: string);
    initialize(): Promise<void>;
    addChunks(chunks: VectorChunk[]): Promise<void>;
    search(embedding: number[], topK?: number): Promise<VectorChunk[]>;
    searchByFilter(filter: Record<string, any>, topK?: number): Promise<VectorChunk[]>;
    deleteByPaperId(paperId: string): Promise<void>;
}
export declare function getVectorDB(persistPath?: string): VectorDB;
export declare function resetVectorDB(): void;
//# sourceMappingURL=vector.d.ts.map