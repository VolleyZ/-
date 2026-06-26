# PaperLens 设计文档

> AI 驱动的智能论文探索平台 — 基于 Papers We Love 仓库构建

**日期：** 2026-06-26
**版本：** v1.0
**状态：** 设计阶段

---

## 1. 项目背景与目标

### 1.1 背景

Papers We Love (PWL) 是一个致力于阅读、讨论和学习计算机科学学术论文的社区。其 GitHub 仓库收录了 200+ 篇经典论文，按 50+ 个主题分类。然而，当前仓库仅以静态文件目录形式存在，存在以下痛点：

- **发现困难**：新手不知道从哪篇论文开始读起
- **理解门槛高**：学术论文专业性强，缺乏通俗解读
- **知识孤立**：论文之间的关联、演进脉络不清晰
- **缺乏引导**：没有系统化的学习路径推荐

### 1.2 目标

构建一个 **AI 驱动的智能论文探索平台 (PaperLens)**，让经典计算机科学论文更易理解、更易发现、更系统地学习。

**核心价值主张：**
- 🔍 **智能发现**：通过知识图谱和推荐系统，帮助用户找到感兴趣的论文
- 📝 **降低门槛**：AI 摘要、通俗解读、关键概念解释
- 🛤️ **系统学习**：按主题和难度生成阅读路径，循序渐进
- 💬 **对话互动**：针对论文内容提问，AI 实时解答

---

## 2. 产品定位与核心功能

### 2.1 产品定位

面向软件工程师、计算机专业学生、技术爱好者的 **AI 论文阅读助手与知识探索平台**。

### 2.2 四大核心功能模块

#### 模块一：智能摘要与解读

- 自动生成论文中文摘要（比原 Abstract 更通俗易懂）
- 提取核心观点（3-5 条关键 takeaways）
- 关键概念解释（自动识别专业术语并给出通俗解释）
- 难度评级（入门 / 进阶 / 深入）
- 前置知识提示（读这篇论文前需要了解什么）

#### 模块二：AI 问答对话

- 针对单篇论文的问答（基于 RAG 的上下文理解）
- 支持追问、延伸讨论
- 公式/算法解释
- 代码实现建议（如适用）

#### 模块三：阅读路径推荐

- 按主题生成从入门到精通的学习路径
- 基于当前阅读历史推荐下一篇论文
- 前置论文 / 延伸论文推荐
- 学习进度追踪

#### 模块四：知识关联图谱

- 可视化论文之间的引用关系
- 主题聚类展示（哪些论文属于同一研究方向）
- 时间线视图（展示研究方向的演进脉络）
- 交互式探索（点击节点查看详情，拖拽缩放）

---

## 3. 系统架构

### 3.1 技术栈选型

| 层级 | 技术选型 | 选择理由 |
|------|----------|----------|
| 前端框架 | Next.js 14 (App Router) + TypeScript | 全栈框架，API Routes 一体化，SSR/SSG 支持好 |
| UI 样式 | TailwindCSS + shadcn/ui | 开发效率高，组件库质量好 |
| 状态管理 | React Query + Zustand | 服务端状态用 React Query，客户端状态用 Zustand |
| AI 框架 | LangChain.js | 多模型支持，RAG 链现成，生态丰富 |
| 向量数据库 | ChromaDB (本地) / Pinecone (可选) | 轻量本地优先，可扩展到云端 |
| 关系数据库 | SQLite (via better-sqlite3) | 轻量，部署简单，适合单机应用 |
| PDF 渲染 | PDF.js | Mozilla 官方库，功能完整 |
| 图谱可视化 | D3.js (force-directed graph) | 灵活强大，适合自定义力导向图 |

### 3.2 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                        前端层                             │
│  Next.js Pages + React Components + TailwindCSS         │
│  首页 / 论文详情 / 知识图谱 / 阅读路径 / 个人中心        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                        API 层                            │
│  Next.js API Routes / tRPC                              │
│  论文检索 / AI 摘要 / 问答 / 图谱数据 / 路径推荐        │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  AI 服务层   │ │  数据服务层  │ │  图谱服务层   │
│  LangChain  │ │  论文索引    │ │  关系构建    │
│  多模型适配  │ │  向量检索    │ │  聚类分析    │
│  Prompt 管理 │ │  元数据管理  │ │  路径算法    │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       ▼
              ┌─────────────────┐
              │   数据存储层     │
              │  SQLite +       │
              │  ChromaDB +     │
              │  PDF 文件系统    │
              └─────────────────┘
```

### 3.3 项目目录结构

```
paperlens/
├── apps/
│   └── web/                      # Next.js 前端应用
│       ├── app/                   # App Router 页面
│       │   ├── page.tsx          # 首页
│       │   ├── papers/           # 论文列表 & 详情
│       │   ├── graph/            # 知识图谱页
│       │   ├── paths/            # 阅读路径页
│       │   └── api/              # API Routes
│       ├── components/            # UI 组件
│       │   ├── paper/            # 论文相关组件
│       │   ├── graph/            # 图谱组件
│       │   ├── chat/             # AI 对话组件
│       │   └── ui/               # 通用 UI 组件
│       └── lib/                   # 前端工具函数
├── packages/
│   ├── ai/                        # AI 服务层
│   │   ├── models/               # 多模型适配器 (OpenAI/Ollama/...)
│   │   ├── prompts/              # Prompt 模板
│   │   ├── chains/               # LangChain 处理链
│   │   └── index.ts
│   ├── core/                      # 核心业务逻辑
│   │   ├── paper/                # 论文解析、索引、检索
│   │   ├── graph/                # 知识图谱构建与查询
│   │   └── path/                 # 阅读路径生成算法
│   └── db/                        # 数据访问层
│       ├── sqlite/               # SQLite 操作
│       └── vector/               # 向量数据库操作
├── data/
│   ├── papers/                   # PDF 论文文件（复用 PWL 仓库）
│   ├── db/                       # SQLite 数据库文件
│   └── vectors/                  # 向量数据库文件
├── scripts/
│   ├── index-papers.ts           # 论文索引脚本
│   └── generate-summaries.ts     # 批量生成摘要脚本
└── package.json                  # monorepo (pnpm workspaces)
```

---

## 4. 核心页面设计

### 4.1 首页 - 探索入口

**功能：**
- 搜索框：支持按标题、作者、关键词搜索
- 主题分类卡片：展示各领域论文数量，点击进入分类浏览
- 推荐论文：基于热门/新手友好/最新添加的推荐
- 学习路径入口：精选学习路径展示

**布局：**
- 顶部导航栏（Logo + 搜索 + 导航链接）
- Hero 区域（大标题 + 搜索框）
- 主题分类网格（6-8 个主要分类）
- 推荐论文列表
- 页脚

### 4.2 论文详情页 - 核心阅读体验

**功能：**
- 左侧：PDF 阅读器（支持翻页、缩放、目录）
- 右侧：AI 助手面板（三个 Tab）
  - **摘要 Tab**：核心观点、关键概念、前置知识、延伸阅读
  - **问答 Tab**：对话界面，针对论文内容提问
  - **相关 Tab**：相关论文推荐、引用关系图

**交互：**
- 选中 PDF 文字后可提问 AI 解释
- AI 摘要可一键复制
- 支持收藏/标记已读
- 支持添加个人笔记

### 4.3 知识图谱页 - 可视化探索

**功能：**
- 力导向图展示论文节点和关系边
- 筛选器：按主题、难度、年代筛选
- 搜索定位：输入论文名高亮对应节点
- 节点详情弹窗：点击节点显示论文摘要和跳转链接
- 图谱模式切换：引用关系 / 主题聚类 / 时间线

**交互：**
- 拖拽节点调整位置
- 滚轮缩放
- 双击节点进入论文详情
- Hover 显示简要信息

### 4.4 阅读路径页 - 系统化学习

**功能：**
- 路径列表：按主题分类的学习路径
- 路径详情：阶段划分 + 每阶段论文列表
- 进度追踪：已读/未读/进行中状态
- 智能推荐：根据当前进度推荐下一步

---

## 5. AI 处理管线

### 5.1 论文索引流程

```
PDF 文件
  ↓
PDF.js 文本提取
  ↓
文本分段（按章节/段落，带重叠）
  ↓
生成 Embedding (OpenAI / 本地模型)
  ↓
存入向量数据库 (ChromaDB)
  ↓
同时存入 SQLite 元数据
```

### 5.2 摘要生成链

输入：论文完整文本
输出：结构化摘要对象

**步骤：**
1. Map 阶段：分段生成各部分摘要
2. Reduce 阶段：合并各部分摘要，生成整体摘要
3. 提取阶段：从摘要中提取关键观点、概念、前置知识
4. 结构化：按预定格式输出 JSON

### 5.3 问答链 (RAG)

输入：用户问题 + 论文 ID
输出：AI 回答

**步骤：**
1. 问题向量化
2. 在向量库中检索最相关的 N 个段落
3. 构建 Prompt（系统提示 + 相关上下文 + 用户问题）
4. 调用 LLM 生成回答
5. 返回回答及引用来源段落

### 5.4 知识图谱构建

**关系类型：**
- 引用关系（论文 A 引用论文 B）
- 主题相似（基于向量相似度聚类）
- 前置关系（基础概念 → 进阶论文）
- 演进关系（同一方向的先后研究）

**构建方式：**
- AI 分析论文引言/参考文献提取引用关系
- 基于向量相似度计算主题聚类
- 基于难度评级和引用方向推导前置关系

---

## 6. 多模型支持

### 6.1 模型适配器设计

统一的 `LLMProvider` 接口：

```typescript
interface LLMProvider {
  name: string;
  generate(prompt: string, options?: LLMOptions): Promise<string>;
  generateStreaming(prompt: string, options?: LLMOptions): AsyncIterable<string>;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
```

### 6.2 支持的模型后端

| 后端 | 模型 | 适用场景 | 配置要求 |
|------|------|----------|----------|
| OpenAI | GPT-4 / GPT-3.5-turbo | 高质量摘要、问答 | API Key |
| Ollama | Llama 3 / Mistral / Gemma | 本地部署、隐私敏感 | 本地运行 Ollama |
| Anthropic (可选) | Claude 3 | 长文本处理 | API Key |

### 6.3 模型选择策略

- **摘要生成**：优先使用高质量模型（如 GPT-4）
- **问答对话**：根据问题复杂度动态选择
- **Embedding**：text-embedding-3-small（OpenAI）或 nomic-embed-text（本地）
- 用户可在设置中手动选择模型

---

## 7. 数据模型

### 7.1 SQLite 数据模型

```sql
-- 论文表
CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  category TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  summary_json TEXT,
  summary_generated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- 论文-标签关联表
CREATE TABLE paper_tags (
  paper_id TEXT REFERENCES papers(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (paper_id, tag_id)
);

-- 论文引用关系表
CREATE TABLE paper_references (
  paper_id TEXT REFERENCES papers(id),
  referenced_paper_id TEXT REFERENCES papers(id),
  PRIMARY KEY (paper_id, referenced_paper_id)
);

-- 用户表（本地单用户模式可选）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  settings_json TEXT
);

-- 阅读记录表
CREATE TABLE reading_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id TEXT REFERENCES papers(id),
  status TEXT NOT NULL, -- unread / reading / completed
  progress INTEGER DEFAULT 0, -- 0-100
  notes TEXT,
  last_read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 收藏表
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper_id TEXT REFERENCES papers(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习路径表
CREATE TABLE learning_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  estimated_duration TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 路径阶段表
CREATE TABLE path_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id TEXT REFERENCES learning_paths(id),
  stage_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

-- 阶段论文表
CREATE TABLE stage_papers (
  stage_id INTEGER REFERENCES path_stages(id),
  paper_id TEXT REFERENCES papers(id),
  paper_order INTEGER NOT NULL,
  PRIMARY KEY (stage_id, paper_id)
);
```

### 7.2 向量数据库 Schema

**Collection: `paper_chunks`**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | chunk ID (paper_id:page:index) |
| embedding | float[] | 向量 |
| metadata | object | { paper_id, page_num, section, text } |

---

## 8. 错误处理与降级策略

### 8.1 分级降级

| 级别 | 场景 | 降级行为 |
|------|------|----------|
| L0 | 完全正常 | 所有功能可用 |
| L1 | AI 服务超时/限流 | 显示缓存结果，提示稍后重试 |
| L2 | 向量库不可用 | 降级为关键词搜索 |
| L3 | 无 API Key / 无本地模型 | 仅展示论文元数据和 PDF，AI 功能禁用 |
| L4 | 数据库异常 | 只读模式，展示静态内容 |

### 8.2 错误类型与处理

- **模型调用失败**：重试 2 次（指数退避），失败后返回友好提示
- **PDF 解析失败**：跳过该论文，记录日志，不影响其他功能
- **向量检索失败**：降级为全文搜索
- **缓存失效**：正常触发重新生成

### 8.3 缓存策略

- AI 生成的摘要永久缓存（论文内容不变则结果不变）
- 问答结果按问题+论文维度缓存（相同问题直接返回）
- 向量嵌入永久缓存
- 推荐结果每日更新缓存

---

## 9. 性能与扩展性

### 9.1 性能目标

- 首页加载 < 2s
- 论文详情页 PDF 渲染 < 3s
- AI 问答首字响应 < 2s（流式输出）
- 知识图谱 200 个节点流畅交互

### 9.2 优化策略

- **预生成摘要**：批量离线生成所有论文摘要，避免在线等待
- **流式输出**：AI 问答使用 streaming 提升感知速度
- **渐进式加载**：图谱先加载主要节点，再加载边和细节
- **本地优先**：所有数据存储在本地，无需网络即可用核心功能
- **按需索引**：首次使用时索引论文，后台静默处理

### 9.3 扩展性考虑

- 支持添加更多论文源（不止 PWL 仓库）
- 支持自定义模型后端
- 支持多用户模式（当前优先单用户本地使用）
- 支持云同步（可选功能）

---

## 10. 首期 MVP 范围

### 10.1 包含功能（MVP）

1. **论文浏览**
   - 主题分类浏览
   - 论文列表 + 详情
   - PDF 在线阅读

2. **AI 摘要**
   - 论文结构化摘要（核心观点、关键概念、前置知识）
   - 支持 OpenAI 和 Ollama

3. **AI 问答**
   - 基于单篇论文的 RAG 问答
   - 流式输出

4. **基础知识图谱**
   - 简单力导向图
   - 按主题筛选

5. **阅读路径**
   - 预置 3-5 条经典学习路径
   - 阅读进度标记

### 10.2 后续迭代方向

- 更丰富的图谱关系类型
- 个人笔记系统
- 全文搜索增强
- 更多学习路径自动生成
- 论文对比功能
- 移动端适配
- 多语言支持

---

## 11. 开发阶段规划

**阶段一：基础框架（1-2 周）**
- 项目脚手架搭建
- 数据库设计与实现
- 论文索引脚本
- 基础 UI 框架

**阶段二：核心功能（2-3 周）**
- PDF 阅读器集成
- AI 摘要生成链
- AI 问答链
- 论文详情页

**阶段三：知识图谱（1-2 周）**
- 图谱可视化
- 关系构建
- 交互优化

**阶段四：学习路径（1 周）**
- 路径数据模型
- 路径页面
- 进度追踪

**阶段五：优化与打磨（1-2 周）**
- 性能优化
- UI 打磨
- 错误处理完善
- 文档与测试

---

## 附录：与 PWL 仓库的关系

PaperLens **以 PWL 仓库为数据源**，但作为独立项目存在：
- 直接复用 PWL 的 PDF 文件和目录结构
- 从各目录的 README.md 中提取论文元数据
- 新增的索引数据、AI 生成内容存储在独立目录中
- 不修改 PWL 仓库原有文件

这种设计使得：
- PWL 仓库更新时可轻松同步
- PaperLens 的数据不会污染原仓库
- 用户可以选择使用自己的论文集合
