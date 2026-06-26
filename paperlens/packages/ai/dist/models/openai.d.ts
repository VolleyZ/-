import type { LLMProvider, LLMOptions } from './types';
export declare class OpenAIProvider implements LLMProvider {
    name: string;
    private client;
    constructor(apiKey?: string);
    generate(prompt: string, options?: LLMOptions): Promise<string>;
    generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string>;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
}
//# sourceMappingURL=openai.d.ts.map