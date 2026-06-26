import { QA_USER_PROMPT } from '../prompts/qa';
export class QAChain {
    constructor(llm) {
        this.llm = llm;
    }
    async answer(title, abstract, question, context) {
        const contextText = context
            .map((c, i) => `[段落${i + 1}，位置：${c.page}]\n${c.text}`)
            .join('\n\n');
        const prompt = QA_USER_PROMPT
            .replace('{title}', title)
            .replace('{abstract}', abstract || '无')
            .replace('{context}', contextText || '无相关段落')
            .replace('{question}', question);
        const answer = await this.llm.generate(prompt, {
            temperature: 0.5,
            maxTokens: 1500
        });
        return {
            answer,
            sources: context.map(c => ({
                text: c.text.slice(0, 200) + (c.text.length > 200 ? '...' : ''),
                page: c.page
            }))
        };
    }
    async *answerStreaming(title, abstract, question, context) {
        const contextText = context
            .map((c, i) => `[段落${i + 1}，位置：${c.page}]\n${c.text}`)
            .join('\n\n');
        const prompt = QA_USER_PROMPT
            .replace('{title}', title)
            .replace('{abstract}', abstract || '无')
            .replace('{context}', contextText || '无相关段落')
            .replace('{question}', question);
        let fullAnswer = '';
        for await (const chunk of this.llm.generateStreaming(prompt, {
            temperature: 0.5,
            maxTokens: 1500
        })) {
            fullAnswer += chunk;
            yield {
                answer: fullAnswer,
                sources: []
            };
        }
    }
}
