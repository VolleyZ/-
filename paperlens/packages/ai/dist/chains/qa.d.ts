import type { LLMProvider } from '../models/types';
import type { QAResponse } from '../models/types';
export interface ContextChunk {
    text: string;
    page: number;
}
export declare class QAChain {
    private llm;
    constructor(llm: LLMProvider);
    answer(title: string, abstract: string, question: string, context: ContextChunk[]): Promise<QAResponse>;
    answerStreaming(title: string, abstract: string, question: string, context: ContextChunk[]): AsyncIterable<QAResponse>;
}
//# sourceMappingURL=qa.d.ts.map