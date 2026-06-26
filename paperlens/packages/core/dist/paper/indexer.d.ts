import type { LLMProvider } from '@paperlens/ai';
import type { PaperMetadata } from './parser';
/**
 * 索引单篇论文
 */
export declare function indexPaper(metadata: PaperMetadata, llm: LLMProvider): Promise<void>;
/**
 * 批量索引论文
 */
export declare function indexPapers(papers: PaperMetadata[], llm: LLMProvider, onProgress?: (current: number, total: number) => void): Promise<{
    success: number;
    failed: number;
}>;
//# sourceMappingURL=indexer.d.ts.map