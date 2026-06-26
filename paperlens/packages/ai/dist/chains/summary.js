import { SUMMARY_USER_PROMPT } from '../prompts/summary';
export class SummaryChain {
    constructor(llm) {
        this.llm = llm;
    }
    async generate(title, content) {
        const prompt = SUMMARY_USER_PROMPT
            .replace('{title}', title)
            .replace('{content}', content.slice(0, 15000));
        const response = await this.llm.generate(prompt, {
            temperature: 0.3,
            maxTokens: 3000
        });
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (e) {
            console.error('Failed to parse summary JSON:', e);
        }
        throw new Error('Failed to generate summary');
    }
    async generateWithRetry(title, content, retries = 2) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.generate(title, content);
            }
            catch (e) {
                if (i === retries - 1)
                    throw e;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        throw new Error('Failed to generate summary after retries');
    }
}
