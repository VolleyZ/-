export interface LLMOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
}

export interface LLMProvider {
  name: string
  generate(prompt: string, options?: LLMOptions): Promise<string>
  generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string>
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

export interface AISummary {
  abstract: string
  keyPoints: string[]
  keyConcepts: { term: string; explanation: string }[]
  prerequisites: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: string
}

export interface QAResponse {
  answer: string
  sources: { text: string; page: number }[]
}