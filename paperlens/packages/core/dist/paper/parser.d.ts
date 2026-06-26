export interface ParsedPaper {
    id: string;
    title: string;
    authors: string[];
    year: number | null;
    text: string;
    pages: {
        pageNum: number;
        text: string;
    }[];
}
export interface PaperMetadata {
    id: string;
    title: string;
    category: string;
    pdfPath: string;
}
/**
 * 简单 PDF 文本提取（用于服务端）
 * 实际项目中可以使用 pdf-parse 或其他服务端 PDF 库
 */
export declare function parsePDFSimple(pdfPath: string): Promise<ParsedPaper>;
/**
 * 创建模拟的论文解析数据（用于开发和测试）
 */
export declare function createMockParsedPaper(metadata: PaperMetadata): ParsedPaper;
/**
 * 提取章节信息
 */
export declare function extractSection(fullText: string, pageText: string): string;
/**
 * 将长文本分段（用于向量嵌入）
 */
export declare function chunkText(text: string, chunkSize?: number, overlap?: number): string[];
//# sourceMappingURL=parser.d.ts.map