# scroll_lingo UI/UX Pro Max 工业级设计规范 (DESIGN.md)

> 本文档为 `scroll_lingo` 前端交互、视觉设计与工程落地的最高规范标准。所有 UI 组件、样式修改与动效逻辑必须严格遵守以下四大铁律。

---

## 🏛️ 一、 核心设计铁律 (The 4 Non-Negotiable Laws)

### 1. 零布局位移法则 (Zero Layout Shift / 0 CLS)
- **绝对禁止**：在 `:hover`、`:active`、选中、播放或状态切换时改变 `border-width`、`padding`、`margin` 或 `font-size`。
- **正规做法**：固定边框宽度（统一 `1px solid`），状态变化一律采用 `background-color` 透明度变化、`border-color` 切换、微光晕 `box-shadow` 与硬件加速的微缩放（`transform: scale(0.98)`）。

### 2. 空间与网格系统 (The 8pt Grid System)
- **标准间距**：
  - `--space-1: 4px` (微型标签内边距、图标文字间距)
  - `--space-2: 8px` (紧凑组内间距、小按钮内边距)
  - `--space-3: 12px` (标准元素间距、卡片内部间距)
  - `--space-4: 16px` (标准卡片外边距、页面边距)
  - `--space-6: 24px` (模块间大间距)
- **严禁使用任意的 Magic Numbers**（如 `margin: 13px`、`padding: 7px`）。

### 3. 视觉降噪与层级表达 (Information Hierarchy & Anti-AI-Cliché)
- **层级表达依靠明度与字重，不靠粗糙边框**：
  - Primary Text: `#f7f9f9` (100% 不透明，字重 600)
  - Secondary Text: `#71767b` (次级信息、时间戳、手柄)
  - Muted Text: `#53575b` (极弱占位符、辅助线)
- **去塑料感**：严禁五颜六色的高饱和度大粗边框；单词分词统一采用细腻微透胶囊（Subtle Pill）。

### 4. 触控热区与物理动效 (Touch Targets & Spring Motion)
- **移动端触控尺寸**：所有可点击控件最小点击面积 $\ge 40 \times 40\text{px}$（核心按钮 $\ge 44 \times 44\text{px}$）。
- **苹果物理曲线**：统一使用 `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)` 与 `--duration-fast: 0.15s`。

---

## 🎨 二、 语义化 Design Tokens 清单

```css
:root {
  /* 4-Layer Surface System (深度层级) */
  --bg-canvas: #000000;
  --bg-card: #16181c;
  --bg-elevated: #202327;
  --bg-hover: rgba(255, 255, 255, 0.06);
  --bg-active-glow: rgba(29, 155, 240, 0.18);

  /* Brand Accents */
  --accent-primary: #1d9bf0;      /* Twitter Blue */
  --accent-secondary: #00ba7c;    /* Mint Green - 已掌握 */
  --accent-warning: #ffd400;      /* Amber Yellow - 重点关注 */
  --accent-danger: #f4212e;       /* Rose Red - 报错/删除 */

  /* Borders & Radius */
  --border-color: #2f3336;
  --border-subtle: #202327;
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-pill: 9999px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-japanese: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif;
}
```
