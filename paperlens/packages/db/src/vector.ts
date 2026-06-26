import { ChromaClient } from 'chromadb'
import path from 'path'

export interface VectorChunk {
  id: string
  embedding: number[]
  metadata: {
    paper_id: string
    page_num: number
    section: string
    text: string
  }
}

export class VectorDB {
  private client: ChromaClient
  private collectionName: string = 'paper_chunks'
  private initialized: boolean = false

  constructor(persistPath?: string) {
    const resolvedPath = persistPath || path.join(process.cwd(), 'data', 'vectors')
    this.client = new ChromaClient({
      path: resolvedPath
    })
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { 'hnsw:space': 'cosine' }
      })
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize vector DB:', error)
      throw error
    }
  }

  async addChunks(chunks: VectorChunk[]): Promise<void> {
    await this.initialize()
    const collection = await this.client.getCollection({ name: this.collectionName })
    
    await collection.add({
      ids: chunks.map(c => c.id),
      embeddings: chunks.map(c => c.embedding),
      metadatas: chunks.map(c => c.metadata),
      documents: chunks.map(c => c.metadata.text)
    })
  }

  async search(embedding: number[], topK: number = 5): Promise<VectorChunk[]> {
    await this.initialize()
    const collection = await this.client.getCollection({ name: this.collectionName })
    
    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK
    })
    
    if (!results.ids || results.ids.length === 0 || !results.ids[0]) {
      return []
    }
    
    return results.ids[0].map((id: string, i: number) => ({
      id,
      embedding: results.embeddings?.[0]?.[i] || [],
      metadata: (results.metadatas?.[0]?.[i] || {}) as VectorChunk['metadata']
    }))
  }

  async searchByFilter(filter: Record<string, any>, topK: number = 5): Promise<VectorChunk[]> {
    await this.initialize()
    const collection = await this.client.getCollection({ name: this.collectionName })
    
    const results = await collection.get({
      where: filter,
      limit: topK
    })
    
    if (!results.ids || results.ids.length === 0) {
      return []
    }
    
    return results.ids.map((id: string, i: number) => ({
      id,
      embedding: results.embeddings?.[i] || [],
      metadata: (results.metadatas?.[i] || {}) as VectorChunk['metadata']
    }))
  }

  async deleteByPaperId(paperId: string): Promise<void> {
    await this.initialize()
    const collection = await this.client.getCollection({ name: this.collectionName })
    
    try {
      await collection.delete({
        where: { paper_id: paperId }
      })
    } catch (error) {
      console.error('Failed to delete vectors for paper:', paperId, error)
    }
  }
}

let vectorInstance: VectorDB | null = null

export function getVectorDB(persistPath?: string): VectorDB {
  if (!vectorInstance) {
    vectorInstance = new VectorDB(persistPath)
  }
  return vectorInstance
}

export function resetVectorDB(): void {
  vectorInstance = null
}
