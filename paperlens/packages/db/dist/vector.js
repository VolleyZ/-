import { ChromaClient } from 'chromadb';
import path from 'path';
export class VectorDB {
    constructor(persistPath) {
        this.collectionName = 'paper_chunks';
        this.initialized = false;
        const resolvedPath = persistPath || path.join(process.cwd(), 'data', 'vectors');
        this.client = new ChromaClient({
            path: resolvedPath
        });
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.client.getOrCreateCollection({
                name: this.collectionName,
                metadata: { 'hnsw:space': 'cosine' }
            });
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize vector DB:', error);
            throw error;
        }
    }
    async addChunks(chunks) {
        await this.initialize();
        const collection = await this.client.getCollection({ name: this.collectionName });
        await collection.add({
            ids: chunks.map(c => c.id),
            embeddings: chunks.map(c => c.embedding),
            metadatas: chunks.map(c => c.metadata),
            documents: chunks.map(c => c.metadata.text)
        });
    }
    async search(embedding, topK = 5) {
        await this.initialize();
        const collection = await this.client.getCollection({ name: this.collectionName });
        const results = await collection.query({
            queryEmbeddings: [embedding],
            nResults: topK
        });
        if (!results.ids || results.ids.length === 0 || !results.ids[0]) {
            return [];
        }
        return results.ids[0].map((id, i) => ({
            id,
            embedding: results.embeddings?.[0]?.[i] || [],
            metadata: (results.metadatas?.[0]?.[i] || {})
        }));
    }
    async searchByFilter(filter, topK = 5) {
        await this.initialize();
        const collection = await this.client.getCollection({ name: this.collectionName });
        const results = await collection.get({
            where: filter,
            limit: topK
        });
        if (!results.ids || results.ids.length === 0) {
            return [];
        }
        return results.ids.map((id, i) => ({
            id,
            embedding: results.embeddings?.[i] || [],
            metadata: (results.metadatas?.[i] || {})
        }));
    }
    async deleteByPaperId(paperId) {
        await this.initialize();
        const collection = await this.client.getCollection({ name: this.collectionName });
        try {
            await collection.delete({
                where: { paper_id: paperId }
            });
        }
        catch (error) {
            console.error('Failed to delete vectors for paper:', paperId, error);
        }
    }
}
let vectorInstance = null;
export function getVectorDB(persistPath) {
    if (!vectorInstance) {
        vectorInstance = new VectorDB(persistPath);
    }
    return vectorInstance;
}
export function resetVectorDB() {
    vectorInstance = null;
}
