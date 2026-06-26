import type { LLMProvider } from '../models/types';
import type { AISummary } from '../models/types';
export declare class SummaryChain {
    private llm;
    constructor(llm: LLMProvider);
    generate(title: string, content: string): Promise<AISummary>;
    generateWithRetry(title: string, content: string, retries?: number): Promise<AISummary>;
}
//# sourceMappingURL=summary.d.ts.map