# Ferrariwork

> 英语词汇学习项目合集 — 从 SAT 沉浸式阅读到系统化单词训练。
>
> 最后更新：2026-07-02

---

## 每日使用（背单词 / SAT 阅读）

### 首选：GitHub Pages（无需任何本地操作，永远可用）

**不需要启动任何服务器，不需要打开终端，浏览器直接打开即可。**

| 应用 | 地址（加入浏览器书签） |
|------|------|
| **Word Wind 背单词** ★ | https://ferrari-serena.github.io/tasks2/word-wind/dist/ |
| **SAT 词汇阅读器** ★ | https://ferrari-serena.github.io/tasks1/ |
| 项目总入口 | https://ferrari-serena.github.io/ |

从总入口点「项目 tasks1」→ 直接进入 SAT 词汇阅读器（含两本书）。
从总入口点「项目 tasks2」→ 进入导航页 → 点 Word Wind 卡片，直接进入。

**这是最主要的打开方式。不依赖任何本地进程，电脑开机连上网就能用。**

> ⚠️ 线上版的生词本数据和本地版互不相通（localStorage 按域名隔离）。如果你之前在本地用 `localhost` 背过单词，那些生词本数据在线上版是空的。需要本地数据时用下面的方式 B。

### 备选：本地 HTTP 服务器（有本地生词本数据时使用）

只有当你需要访问**之前存在本机浏览器里的生词本数据**时才需要启动本地服务器：

```powershell
node server.js
```

| 应用 | 本地地址 |
|------|------|
| **Word Wind 背单词** ★ | http://localhost:5173/tasks2/word-wind/dist/ |
| 蚕食单词 | http://localhost:5173/tasks2/vocabulary/docs/ |
| SAT 词汇阅读器 | http://localhost:5173/tasks1/ |

**注意：`node server.js` 是手动进程，电脑关机后就停了。** 下一次开机如果想用本地版（访问本地生词本数据），需要再运行一次。日常背单词推荐直接用上面的 GitHub Pages 地址。

---

## 关键避坑

以下是踩过的坑，换电脑或重装系统后特别注意：

### 1. localStorage 数据与端口绑定

Word Wind 的生词本数据存储在浏览器 `localStorage` 中，而 **localStorage 按 `协议 + 域名 + 端口` 隔离**。

| 端口 | 数据 |
|------|------|
| `http://localhost:5173` | ✅ 你的生词本数据在这里 |
| `http://localhost:3000` | ❌ 空的，读不到 |
| `file:///D:/...` | ❌ 空的，且无法加载 ES 模块 |

**所以服务器端口绝对不能改成 5173 以外的值。** 如果不小心改了，数据没丢——改回 5173 就能恢复。

### 2. 端口冲突：server.js vs Vite 开发服务器

- `server.js`（日常用）→ 端口 **5173**
- Word Wind 的 `npm run dev`（改源码时用）→ 也默认 **5173**

**两个不能同时运行。** 日常背单词用 `node server.js`。要改源码时，先 Ctrl+C 停掉 server.js，再 `npm run dev`。改完构建后，切回 `node server.js`。

### 3. 源码修改 ≠ dist/ 自动更新

Word Wind 的源码在 `src/`，日常使用的是 `dist/`（构建产物）。**改完源码后必须重新构建：**

```bash
cd tasks2/word-wind
npm run build
```

构建后 Vite 配置已设为 `base: './'`，路径自动相对，不需要手动修改。

### 4. 不要双击 HTML 文件

任何 Vite/React/Vue 构建的应用，双击打开 `file://` 协议会因为浏览器 CORS 策略无法加载 ES 模块，页面白屏。必须通过 HTTP 服务器访问。

---

## 项目概览

这个仓库围绕**英语词汇学习**（重点 SAT 备考）构建了两条学习路径：

| 路径 | 目录 | 方式 | 技术 |
|------|------|------|------|
| 沉浸式阅读 | [tasks1/](tasks1/) | 两本英文小说边读边查词：《被看见的恐惧》+《The Lightning Thief》 | 纯前端 HTML/JS + Free Dictionary API |
| 系统化训练 | [tasks2/](tasks2/) | 词库浏览 + 闪卡测验，覆盖初中到 SAT 全部词库 | Vue 3 / React 19 + Vite |

仓库同时作为 **GitHub Pages** 部署：`https://ferrari-serena.github.io`

---

## 目录结构

```
Ferrariwork/
├── server.js                  # ★ 统一 HTTP 服务器（node server.js → :5173）
├── start.ps1                  # 一键启动脚本（自动打开浏览器到 Word Wind）
├── _config.yml                # GitHub Pages (Jekyll) 配置
├── skills-lock.json           # Agent 技能版本锁
├── README.md                  # ← 本文件
│
├── tasks1/                    # SAT 词汇阅读器
│   ├── app.js                 # ★ 唯一源码（~5300 行），所有应用逻辑
│   ├── SAT-Vocabulary-Reader.html  # 构建产物：自包含单文件应用
│   ├── chapters_all.html      # 16 章小说全文（SAT 词汇 <b> 加粗标注）
│   ├── merged_dict.json       # SAT 词汇合并词典（2000+ 词条）
│   ├── full_novel_text.txt    # 小说纯文本
│   ├── build_final.js         # 生产构建脚本
│   ├── build_all.js           # 完整数据处理流水线
│   ├── BUILD.md               # 构建说明（必读！）
│   ├── init_db.js             # CloudBase 数据库初始化
│   └── index.html             # 重定向到 SAT-Vocabulary-Reader.html
│
├── tasks2/                    # 英语词汇学习工具集
│   ├── index.html             # 导航页（自动检测 file:// 并提示）
│   │
│   ├── vocabulary/            # "蚕食单词" — 词条概览
│   │   ├── src/App.vue        # Vue 3 主组件
│   │   ├── docs/              # 静态构建产物（可直接通过 HTTP 访问）
│   │   ├── src/vocabulary/    # 词库数据（KyleBing/english-vocabulary git 子模块）
│   │   ├── package.json       # Vue 3 + Vite 4 + Pinia + SCSS
│   │   └── README.md
│   │
│   └── word-wind/             # "Word Wind" — 单词卡片学习 ★
│       ├── src/App.tsx        # React 19 主组件
│       ├── src/components/    # 生词本 (UnknownWordsPage)、测试 (TestPage)、闪卡 (WordCard) 等
│       ├── dist/              # 静态构建产物（node server.js 后通过 HTTP 访问）
│       ├── package.json       # React 19 + Vite 7 + Supabase + styled-components
│       ├── vite.config.ts     # base: './' 已配置相对路径
│       └── README.md
│
├── .agents/skills/            # Agent 技能
│   └── guizang-ppt-skill/     # HTML 演示文稿生成技能
│
├── .frontend-slides/          # 幻灯片预览缓存
│
└── memory/                    # Claude 持久化记忆（项目上下文）
    └── MEMORY.md
```

---

## 仓库信息

| 项目 | 值 |
|------|-----|
| **GitHub 仓库** | [Ferrari-Serena/Ferrari-Serena.github.io](https://github.com/Ferrari-Serena/Ferrari-Serena.github.io) |
| **Git 用户** | Serena (`serena@example.com`) |
| **主分支** | `main` |
| **本地路径** | `d:\睿谊的WPS\Ferrariwork` |
| **Git 工具路径** | `D:\my AI agent\`（不在默认 PATH 中） |
| **Git 标签** | `v1.0-punctuation`、`v2.0-mobile-fix` |
| **GitHub Pages** | `https://ferrari-serena.github.io` |

---

## 各项目详情

### 1. SAT 词汇阅读器 ([tasks1/](tasks1/))

一部原创英文成长小说《被看见的恐惧》（The Fear of Being Seen），主角 Serena 在杭州国际学校就读并筹备 TEDx 演讲。SAT 词汇以**粗体**标注，点击查看中英文释义和发音。

**核心功能：**
- 📖 16 章小说逐段阅读
- 🔍 点击 SAT 词汇弹出词典（中英释义 + 词性）
- 🔊 单词发音（浏览器 TTS）
- 📝 生词本（localStorage + CloudBase 云端同步）
- 🃏 闪卡复习模式
- ✏️ 选择题测验

**开发要点：**
- `app.js` 是**唯一源码**，所有修改都在此文件进行
- 运行 `node build_final.js` 构建 `SAT-Vocabulary-Reader.html`
- ⚠️ **不要用 PowerShell `-replace` 改 JS 代码**，会吃掉 `$` 符号（详见 `BUILD.md`）
- CloudBase 环境 ID：`ferrari-d8gusxzk6b74a91a3`

### 2. 蚕食单词 — 词条概览 ([tasks2/vocabulary/](tasks2/vocabulary/))

基于 Vue 3 的词汇浏览应用，以表格形式展示词库内容。

**核心功能：**
- 🖱️ 悬停发音、点击标记已掌握
- 🖱️ 右键查看详细释义
- 📊 学习进度 localStorage 持久化
- 📚 支持初中 → SAT 全部词库

**技术栈：** Vue 3 + Vite 4 + Pinia + Vue Router + TypeScript + SCSS
**词库来源：** `KyleBing/english-vocabulary`（git 子模块位于 `src/vocabulary/`）

### 3. Word Wind — 单词卡片 ([tasks2/word-wind/](tasks2/word-wind/)) ★ 主力应用

基于 React 19 的单词卡片学习应用，每日背单词的核心工具。

**核心功能：**
- 🃏 单词卡片翻转（正面单词 / 背面音标释义例句）
- 🔊 有道词典在线 TTS 发音（美式/英式）
- 📝 生词本（localStorage 持久化，端口 5173）
- ✅ 选择题测验 + 填空题测验
- 🌓 主题切换（亮色/暗色）+ 5 种背景渐变
- 📱 多端适配（PC / 平板 / 手机）
- ☁️ Supabase 后端（词库数据）
- ⌨️ 键盘快捷键（←/A 上一个，→/D 下一个）

**技术栈：** React 19 + Vite 7 + TypeScript + Supabase + styled-components
**日常访问：** `http://localhost:5173/tasks2/word-wind/dist/`
**线上地址：** `https://word-wind.pages.dev`

### 4. 项目服务器 ([server.js](server.js))

根目录的 Node.js HTTP 服务器，端口 **5173**，一站式服务整个项目。页面会自动检测 `file://` 协议并显示警告。

一键启动：[start.ps1](start.ps1)（自动打开浏览器到 Word Wind）

---

## 修改源码后如何更新

### Word Wind

```bash
cd tasks2/word-wind
npm run build          # tsc 类型检查 + Vite 构建 → dist/
```

构建后 `dist/index.html` 中的资源路径已自动使用相对路径（`vite.config.ts` 配置了 `base: './'`），无需手动修改。

### 蚕食单词

```bash
cd tasks2/vocabulary
npm run build          # 输出到 docs/
```

### SAT 词汇阅读器

```bash
cd tasks1
node build_final.js    # app.js + chapters_all.html + merged_dict.json → SAT-Vocabulary-Reader.html
```

---

## 开发模式（调试源码时使用）

> ⚠️ 开发服务器和 `server.js` 都用 5173 端口，**不能同时运行**。先 Ctrl+C 停掉 server.js。

```bash
# Word Wind（端口 5173）
cd tasks2/word-wind
npm run dev            # 源码热更新，修改即时可见

# 蚕食单词（端口 2000）
cd tasks2/vocabulary
npm run dev
```

---

## 克隆与回滚

### 初始化子模块

```bash
git clone --recurse-submodules https://github.com/Ferrari-Serena/Ferrari-Serena.github.io.git
# 或克隆后：
git submodule update --init --recursive
```

### 回滚 SAT 阅读器

```bash
git checkout -- tasks1/SAT-Vocabulary-Reader.html tasks1/app.js
```

---

## 踩坑记录

| 坑 | 现象 | 原因 | 解决 |
|------|------|------|------|
| **端口隔离** | 生词本数据消失 | localStorage 按端口隔离，换了端口就读不到 | 服务器端口固定 5173，永不更改 |
| **file:// 白屏** | 双击 HTML 打不开 | 浏览器禁止 file:// 加载 ES 模块 | 必须通过 `node server.js` HTTP 访问 |
| **dist/ 版本不对** | 改完源码没变化 | 改了 src/ 但没 `npm run build` | 改源码后必须重新构建 |
| **Vite 绝对路径** | 子目录下 JS/CSS 404 | Vite 默认 `base: '/'`，构建产物用 `/assets/` 绝对路径 | `vite.config.ts` 设 `base: './'` |
| **PowerShell -replace** | JS 代码中 `$` 被吃掉 | PowerShell 的 `-replace` 把 `$` 当正则替换符 | 用 `Edit` 工具或普通文本编辑器 |
| **GitHub 连不上** | `git push` 报 connection reset | 国内网络直连 GitHub 被阻断 | 开代理 + `git config --global http.proxy` 配置 |
| **GitHub Pages 没变化** | push 了但网页不变 | GitHub Pages 需要 1-3 分钟构建 | 等几分钟刷新，或看 GitHub 仓库的 Actions/Deployments 状态 |
| **localhost vs GitHub Pages 数据不同** | 两边生词本内容不一样 | localStorage 按域名隔离，`localhost` 和 `github.io` 是两个域 | 这是正常现象，选一个作为主力，数据互不干扰 |
