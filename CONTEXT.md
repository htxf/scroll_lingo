# scroll_lingo - 需求与架构规格书 (CONTEXT.md)

> **版本**：v1.2.0  
> **更新时间**：2026-08-29  
> **设计哲学**：Matt Pocock 强类型范式、极简沉浸式 UI、渐进式降级渲染、无感自然语言习得、确定性同源静态音频、真机实时可视化调试。
> **避坑与知识沉淀**：详见 [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md)

---

## 1. 产品定位与核心设计 (Product Overview)

`scroll_lingo` 是一款为“假零基础”和“碎片化学习者”设计的移动端 H5/PWA 应用。它伪装成类似 Twitter/X 的社交媒体信息流，通过 AI 虚拟博主发布贴合用户个人兴趣的短图文动态，将语言学习（目前主攻日语，覆盖 N0 萌芽至 N1）无缝融入用户的日常“刷屏”习惯中。

### 1.1 核心功能要点
- **拟真社交信息流**：拥有头像、昵称、@handle、发布时间戳、动态点赞/转推数，以及包含交互式假名/查词的双语评论区。
- **N0 萌芽级零基础适配**：支持五十音图可视化点读、单字/极短动态伴学，让真正零基础用户从第 1 天就能轻松刷推。
- **渐进式降级注音 (Progressive Furigana Degradation)**：根据用户基线（N0~N1）与显式 `knownWords` 标记，利用纯函数算法动态隐藏/显示 `<ruby>` 振假名与罗马音。
- **0ms 交互拆解卡片**：点击任意单词/短语瞬间弹出解析卡片（含读音、词性、原形、声调 Pitch Accent 可视化、AI 语法解构实时响应）。
- **同源静态预烘焙音频 (Pre-Baked Static Audio)**：推文音频预先合成物理 MP3（`public/audio/*.mp3`）并由同源 CDN 分发，彻底消除跨域防盗链、网络超时与系统语音包缺失问题；单字调用有道真人词典音频。
- **vConsole 移动端实时调试**：真机右下角一键展开 DevTools 控制台，实时排查 Console 日志、网络状态码与 IndexedDB 数据。
- **防疲劳 Feed 节奏控制**：单日推荐上限（默认 12 篇）与全量语料库完结状态（提供重置与温故复习闭环）。
- **Guest First 零门槛**：无需注册即可秒刷，通过本地 IndexedDB 保存所有进度；登录后采用 CRDT 并集策略无缝同步多设备。

---

## 2. 整体架构与技术选型 (Architecture & Tech Stack)

```mermaid
graph TD
    subgraph 前端 PWA 客户端 (Vite + React 19 + TS)
        A[信息流主界面] --> B[注音降级引擎 Ruby Parser]
        A --> C[本地数据库 Dexie.js / IndexedDB]
        A --> D[同源静态音频 + 词典双轨发音引擎]
        A --> E[0ms 拆解卡片 & AI 语法解构]
        A --> F[vConsole 移动端开发者面板]
    end

    subgraph 语料管线与静态资产 (Corpus Pipeline & Assets)
        G[语料生成/导入器] --> H[音频预烘焙脚本 generate-static-audio]
        H --> I[静态音频库 public/audio/*.mp3]
        G --> J[种子语料库 seedPosts.ts]
        K[管理员 Admin CMS] -->|审核/新增推文| C
    end

    subgraph 用户管理与云端同步 (Auth & Cloud Sync)
        L[Supabase Auth / Magic Link] --> M[云端数据库 Sync Service]
        C <-->|并集智能合并 Union Merge| M
    end

    I -->|同源 CDN 分发| D
    J -->|初始化加载| C
```

### 2.1 技术栈清单
| 维度 | 选用技术 | 选型理由 |
| :--- | :--- | :--- |
| **前端框架** | React 19 + TypeScript | 强类型契合 Matt Pocock 范式，极高的 React Native / Expo 移植复用率 |
| **构建工具** | Vite | 极致的 HMR 速度，高效编译 PWA 静态资源包 |
| **移动端调试**| vConsole | 手机屏幕一键呼出 DevTools，毫秒级定位真机网络与音频问题 |
| **音频分发** | Pre-Baked MP3 (Cloudflare CDN) | 彻底规避手机系统缺少日语语音包、第三方 API 防盗链与 404 问题 |
| **本地数据库** | Dexie.js (IndexedDB) | 高性能客户端存储，离线缓存帖子、用户词汇库 `knownWords` 与学习历史 |
| **语料解析** | MeCab/Kuromoji + LLM | 双重管道校对多音字上下文，注音准确率达 99.9% |
| **云端同步** | Supabase Auth / PostgreSQL | 轻量级 Auth，基于 CRDT 并集算法无冲突同步 |

---

## 3. 核心领域数据模型 (TypeScript Domain Schemas)

```typescript
/** 1. 假名与声调标注 Token */
export type PitchAccentType = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka'; // ⓪平板 ①头高 中高 尾高
export type JLPTLevel = 'N0' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

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
  level: JLPTLevel; // 词汇难易度 (含 N0 萌芽)
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
  audioUrl?: string; // 静态本地音频文件路径 (例: '/audio/post_life_01.mp3')
  category: string;
  level: JLPTLevel;
  likesCount: number;
  repostsCount: number;
  comments: Comment[];
  createdAt: string;
  targetVocabIds?: string[]; // SRS 目标复习词汇
  legoBlocks?: { text: string; color: string; labelZh: string }[];
}

/** 5. 用户知识状态 UserKnowledgeState */
export interface UserKnowledgeState {
  userId?: string;
  deviceUuid: string;
  baselineLevel: 'N0' | 'N5' | 'N4' | 'N3';
  explicitKnownWords: Set<string>; // 用户标记“已认识”的词汇 Lemma / Surface
  explicitFocusWords: Set<string>; // 用户标红需重点练习的词汇
  interestCategories: string[];
  totalPostsRead: number;
  totalWordsMastered: number;
  lastActiveTimestamp: number;
  hasCompletedOnboarding?: boolean;
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
  if (userState.explicitFocusWords.has(token.lemma) || userState.explicitFocusWords.has(token.surface)) {
    return true;
  }
  // 3. 词汇等级高于用户基线等级则显示，低于等于则隐藏
  const levelRank = { N0: 0, N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
  const tokenRank = levelRank[token.level] ?? 1;
  const userRank = levelRank[userState.baselineLevel] ?? 0;

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
│   ├── audio/                # 预烘焙静态 MP3 音频资产 (post_*.mp3)
│   ├── favicon.svg
│   ├── manifest.json         # PWA 配置
│   └── sw.js                 # Service Worker 离线缓存与自动热更新
├── scripts/
│   ├── generate-daily-posts.js  # 每日语料生成脚本
│   └── generate-static-audio.js # 静态音频批量烘焙生成脚本
├── src/
│   ├── assets/               # 静态图标与图片
│   ├── components/           # UI 组件
│   │   ├── admin/            # Admin CMS 语料与词汇纠错面板
│   │   ├── auth/             # 账号登录与云端同步弹窗
│   │   ├── bookmarks/        # 生词书签本
│   │   ├── common/           # OfflineBadge, Button, Modal, Card
│   │   ├── feed/             # PostCard, ActionButtons, PersonaHeader
│   │   ├── kana/             # Fifty-Sounds 五十音图弹窗
│   │   ├── layout/           # BottomNav
│   │   ├── onboarding/       # 兴趣与基线定级向导
│   │   ├── profile/          # 个人中心
│   │   └── reader/           # RubyTokenText, InteractiveCard, PitchAccentView
│   ├── db/                   # Dexie.js 数据库初始化与 Seed 语料
│   │   ├── database.ts
│   │   └── seedPosts.ts
│   ├── hooks/                # 自定义 Hooks (useSpeech, useUserKnowledge)
│   ├── services/             # 语料管线与校对
│   ├── styles/               # Design Tokens & Universal Smooth Scrollbar CSS
│   │   ├── variables.css
│   │   └── global.css
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                # 纯函数工具集 (rubyParser, srsEngine, syncMerger, implicitAlgorithm)
│   ├── App.tsx
│   └── main.tsx
├── CONTEXT.md                # 需求与架构规格书 (本文档)
├── KNOWLEDGE_BASE.md         # 架构经验与采坑知识库
├── SPEC.md                   # 详细规范文档
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
