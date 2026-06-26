export const SUMMARY_SYSTEM_PROMPT = `You are an expert in computer science and academic papers. 
Your task is to analyze academic papers and provide structured summaries in Chinese.
Be concise but comprehensive. Focus on the key contributions and insights.`

export const SUMMARY_USER_PROMPT = `请分析以下论文内容，生成一个结构化的摘要：

论文标题：{title}
论文内容：
{content}

请以 JSON 格式返回，字段说明：
- abstract: 通俗易懂的摘要（150-200字），用中文撰写，比原文摘要更易理解
- keyPoints: 3-5个核心观点，每个观点用一句话概括
- keyConcepts: 关键概念解释，包含3-5个重要术语或概念，每个包含术语名和通俗解释
- prerequisites: 前置知识，列出阅读这篇论文前需要了解的基础概念（3-5个）
- difficulty: 难度评级（beginner/intermediate/advanced），基于论文的数学复杂度和背景知识要求
- estimatedReadTime: 预计阅读时间，格式如"30分钟"或"2小时"

只返回 JSON，不要有其他内容。`

export const SUMMARY_WITH_REFERENCES_PROMPT = `请分析以下论文内容，生成一个结构化的摘要：

论文标题：{title}
作者：{authors}
年份：{year}
论文内容：
{content}

相关论文列表（可选参考）：
{relatedPapers}

请以 JSON 格式返回，字段说明：
- abstract: 通俗易懂的摘要（150-200字），用中文撰写
- keyPoints: 3-5个核心观点，每个观点用一句话概括
- keyConcepts: 关键概念解释，包含3-5个重要术语或概念
- prerequisites: 前置知识，列出阅读这篇论文前需要了解的基础概念（3-5个）
- difficulty: 难度评级（beginner/intermediate/advanced）
- estimatedReadTime: 预计阅读时间

只返回 JSON，不要有其他内容。`