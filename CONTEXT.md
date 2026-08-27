# scroll_lingo - 需求与架构规格书 (CONTEXT.md)

> **版本**：v1.1.0  
> **更新时间**：2026-08-09  
> **设计哲学**：Matt Pocock 强类型范式、极简沉浸式 UI、渐进式降级渲染、无感自然语言习得、无冲突数据同步。

---

## 1. 产品定位与核心设计 (Product Overview)

`scroll_lingo` 是一款为“假零基础”和“碎片化学习者”设计的移动端 H5/PWA 应用。它伪装成类似 Twitter/X 的社交媒体信息流，通过 AI 虚拟博主发布贴合用户个人兴趣的短图文动态，将语言学习（目前主攻日语）无缝融入用户的日常“刷屏”习惯中。

### 1.1 核心功能要点
- **拟真社交信息流**：拥有头像、昵称、@handle、发布时间戳、动态点赞/转推数，以及包含交互式假名/查词的双语评论区。
- **渐进式降级注音 (Progressive Furigana Degradation)**：根据用户基线（如 N5）与显式 `knownWords` 标记，利用纯函数算法动态隐藏/显示 `<ruby>` 振假名与罗马音。
- **0ms 交互拆解卡片**：点击任意单词/短语瞬间弹出解析卡片（含读音、词性、原形、声调 Pitch Accent 可视化），支持按需唤醒“AI 语法导师”深入拆解上下文。
- **隐性难度与 SRS 算法**：结合用户停留时长与查词频次自动隐性调配后续帖子难度，并利用推荐算法在 1/3/7 天后自然重现需巩固词汇（In-Feed SRS）。
- **Web Speech 零延迟发音**：基于 Web Speech API (`ja-JP`) 毫秒级发音，搭配 Pitch Accent 高低音调起伏图谱。
- **Guest First 零门槛**：无需注册即可秒刷，通过本地 IndexedDB 保存所有进度；登录后采用 CRDT 并集策略无缝同步多设备。

---

## 2. 整体架构与技术选型 (Architecture & Tech Stack)

```mermaid
graph TD
    subgraph 前端 PWA 客户端 (Vite + React 19 + TS)
        A[信息流主界面] --> B[注音降级引擎 Ruby Parser]
        A --> C[本地数据库 Dexie.js / IndexedDB]
        A --> D[Web Speech API 发音引擎]
        A --> E[0ms 拆解卡片 & AI 导师]
    end

    subgraph 后台语料管线 (Corpus Pipeline & CMS)
        F[热点 RSS / 新闻 API] --> G[LLM 帖子与评论生成器]
        G --> H[双重切词校验: MeCab/Kuromoji + LLM 校验]
        H --> I[Pitch Accent 声调标注器]
        I --> J[语料库 Corpus DB]
        K[管理员 Admin CMS] -->|审核/修正/更正| J
    end

    subgraph 用户管理与云端同步 (Auth & Cloud Sync)
        L[Supabase Auth / Magic Link] --> M[云端数据库 Sync Service]
        C <-->|并集智能合并 Union Merge| M
    end

    J -->|分发 Seed / 增量帖子| C
```

### 2.1 技术栈清单
| 维度 | 选用技术 | 选型理由 |
| :--- | :--- | :--- |
| **前端框架** | React 19 + TypeScript | 强类型契合 Matt Pocock 范式，极高的 React Native / Expo 移植复用率 |
| **构建工具** | Vite | 极致的 HMR 速度，高效编译 PWA 静态资源包 |
| **样式系统** | Vanilla CSS Design Tokens | 灵活控制 CSS 变量、Glassmorphism 玻璃拟态与 60fps 原生手势动效 |
| **本地数据库** | Dexie.js (IndexedDB) | 高性能客户端存储，离线缓存帖子、用户词汇库 `knownWords` 与学习历史 |
| **语料解析** | MeCab/Kuromoji + LLM | 双重管道校对多音字上下文，注音准确率达 99.9% |
| **云端同步** | Supabase Auth / PostgreSQL | 轻量级 Auth，基于 CRDT 并集算法无冲突同步 |

---

## 3. 核心领域数据模型 (TypeScript Domain Schemas)

```typescript
/** 1. 假名与声调标注 Token */
export type PitchAccentType = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka'; // ⓪平板 ①头高 中高 尾高

export interface PitchAccent {
  pattern: PitchAccentType;
  pitchNotation: string; // 例: "0", "1", "2"
}

export interface Token {
  id: string; // 唯一 Token Hash
  surface: string; // 表面型 (如: 行きます)
  reading: string; // 读音假名 (如: いきます)
  romaji: string; // 罗马音 (如: ikimasu)
  lemma: string; // 词汇原形 (如: 行く)
  pos: string; // 词性 (如: 动词-自五)
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'; // 词汇难易度
  definitionZh: string; // 基础中文释义
  pitchAccent?: PitchAccent;
}

/** 2. 虚拟博主 Persona */
export interface Persona {
  id: string;
  name: string;
  handle: string; // 例: @coffee_master_ken
  avatarUrl: string;
  category: 'sports' | 'tech' | 'coffee' | 'gaming' | 'food' | 'lifestyle';
  bioZh: string;
}

/** 3. 评论区 Comment */
export interface Comment {
  id: string;
  persona: Persona;
  contentJa: string; // 日本语评论原文
  tokens: Token[]; // 提前切词数据
  contentZh: string; // 中文译文
  likesCount: number;
  createdAt: string;
}

/** 4. 帖子 Post */
export interface Post {
  id: string;
  persona: Persona;
  titleJa?: string;
  contentJa: string;
  tokens: Token[]; // 切词与注音数据树
  translationZh: string;
  imageUrl?: string;
  category: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  likesCount: number;
  repostsCount: number;
  comments: Comment[];
  createdAt: string;
  targetVocabIds?: string[]; // SRS 目标复习词汇
}

/** 5. 用户知识状态 UserKnowledgeState */
export interface UserKnowledgeState {
  userId?: string;
  deviceUuid: string;
  baselineLevel: 'N5' | 'N4' | 'N3';
  explicitKnownWords: Set<string>; // 用户标记“已认识”的词汇 Lemma / Surface
  explicitFocusWords: Set<string>; // 用户标红需重点练习的词汇
  interestCategories: string[];
  totalPostsRead: number;
  totalWordsMastered: number;
  lastActiveTimestamp: number;
}
```

---

## 4. 关键算法与同步策略 (Algorithms & Data Sync)

### 4.1 渐进式注音渲染纯函数 (Ruby Rendering Pure Function)

```typescript
export function shouldShowFurigana(token: Token, userState: UserKnowledgeState): boolean {
  // 1. 如果用户显式标记为“已认识”，强制隐藏注音
  if (userState.explicitKnownWords.has(token.lemma) || userState.explicitKnownWords.has(token.surface)) {
    return false;
  }
  // 2. 如果用户显式设为“重点关注”，强制显示注音
  if (userState.explicitFocusWords.has(token.lemma)) {
    return true;
  }
  // 3. 词汇等级高于用户基线等级则显示，低于等于则隐藏
  const levelRank = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
  const tokenRank = levelRank[token.level] || 1;
  const userRank = levelRank[userState.baselineLevel] || 1;

  return tokenRank > userRank;
}
```

### 4.2 多设备数据无冲突智能合并 (Union Merge Strategy)

当游客登录账号进行同步时，合并逻辑如下：
$$\text{explicitKnownWords}_{\text{merged}} = \text{explicitKnownWords}_{\text{device}} \cup \text{explicitKnownWords}_{\text{cloud}}$$
$$\text{explicitFocusWords}_{\text{merged}} = \text{explicitFocusWords}_{\text{device}} \cup \text{explicitFocusWords}_{\text{cloud}}$$

---

## 5. 项目目录结构规范 (Directory Structure Layout)

```
scroll_lingo/
├── public/
│   ├── favicon.svg
│   └── manifest.json         # PWA 配置
├── src/
│   ├── assets/               # 静态图标与图片
│   ├── components/           # UI 组件
│   │   ├── common/           # 通用 Button, Modal, Card
│   │   ├── feed/             # PostCard, CommentSection, PersonaHeader
│   │   ├── reader/           # RubyTokenText, InteractiveCard, PitchAccentView
│   │   ├── admin/            # Admin CMS 语料与词汇纠错面板
│   │   └── layout/           # MobileContainer, BottomNav, TopHeader
│   ├── db/                   # Dexie.js 数据库初始化与 Seed 语料
│   │   ├── database.ts
│   │   └── seedPosts.ts
│   ├── hooks/                # 自定义 Hooks (useSpeech, useUserKnowledge, useFeed)
│   ├── services/             # LLM 服务、MeCab 注音校对与 Supabase Sync
│   ├── styles/               # Design Tokens & Vanilla CSS
│   │   ├── variables.css
│   │   └── global.css
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                # 纯函数工具集 (rubyParser, srsEngine, syncMerger)
│   ├── App.tsx
│   └── main.tsx
├── CONTEXT.md                # 需求与架构规格书 (本文档)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 6. 后续实施阶段与路线图 (Milestones)

- [ ] **Phase 1: 基础设施搭建** (Vite + React 19 + TS + Dexie.js 数据层)
- [ ] **Phase 2: 渐进式注音渲染与交互卡片** (RubyTokenText 组件 + 0ms 词卡弹窗 + Web Speech API)
- [ ] **Phase 3: 拟真社交 Feed 界面与博主矩阵** (Twitter 假风格 UI + 拟真评论区)
- [ ] **Phase 4: 冷启动 Onboarding & 隐性算法** (3秒兴趣选择 + 停留/查词数据收集)
- [ ] **Phase 5: 后台语料 CMS 与多音字校验管线** (MeCab + LLM 校验 + 错读反馈)
- [ ] **Phase 6: 云端 Auth & 并集无冲突同步** (Supabase / Magic Link + Union Sync)
