import type { LLMProvider, LLMOptions } from './types';
export declare class OllamaProvider implements LLMProvider {
    name: string;
    private baseUrl;
    private model;
    private embedModel;
    constructor(baseUrl?: string, model?: string, embedModel?: string);
    generate(prompt: string, options?: LLMOptions): Promise<string>;
    generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string>;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
}
//# sourceMappingURL=ollama.d.ts.map