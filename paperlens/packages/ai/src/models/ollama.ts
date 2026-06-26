import type { LLMProvider, LLMOptions } from './types'

export class OllamaProvider implements LLMProvider {
  name = 'ollama'
  private baseUrl: string
  private model: string
  private embedModel: string

  constructor(baseUrl?: string, model?: string, embedModel?: string) {
    this.baseUrl = baseUrl || (process.env.OLLAMA_BASE_URL || 'http://localhost:11434')
    this.model = model || (process.env.OLLAMA_MODEL || 'llama3')
    this.embedModel = embedModel || 'nomic-embed-text'
  }

  async generate(prompt: string, options?: LLMOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    })
    const data = await response.json()
    return data.response || ''
  }

  async *generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    })
    
    const reader = response.body?.getReader()
    if (!reader) return
    
    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line)
            if (data.response) yield data.response
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.embedModel,
        prompt: text
      })
    })
    const data = await response.json()
    return data.embedding || []
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embed(t)))
  }
}