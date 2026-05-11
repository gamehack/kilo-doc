# Kilo.ai 文档中文翻译 - 纯静态 HTML 网站实施计划

## 摘要

将 `https://kilo.ai/docs/` 的全部文档（约 85 个页面）翻译为中文，生成本地纯静态 HTML 网站，仿照原站视觉风格，可直接推送到 Cloudflare Pages 部署。

## 当前状态分析

- **原站技术栈**：Next.js + Tailwind CSS v4，SSG 静态生成
- **文档规模**：约 85 个页面，涵盖 10 个主要章节
- **原站视觉特征**：品牌黄 `#f8f674`、强调紫 `#7c3aed`、JetBrains Mono 品牌字体、双栏顶部导航 + 左侧边栏 + 右侧 TOC 三栏布局、支持亮色/暗色主题切换
- **目标**：纯 HTML/CSS/JS，无构建工具依赖

## 实施步骤

### 步骤 1：创建项目基础框架

**目标**：搭建目录结构、全局样式和交互逻辑

**操作**：
1. 在 `c:\Users\hanbo\tools\solo\kilo-doc\` 下创建完整目录结构
2. 编写 `css/style.css` — 手写 CSS 还原原站样式，包含：
   - CSS 自定义属性（亮色/暗色主题变量）
   - 基础重置与排版
   - 顶部导航栏（双栏：Logo+操作栏 + 章节导航）
   - 左侧边栏（260px，sticky 定位，章节分组）
   - 内容区域（Markdown 渲染样式：标题、段落、列表、代码块、表格、引用、提示框）
   - 右侧 TOC（240px，自动高亮当前标题）
   - 响应式设计（1280px/1024px/768px 断点）
   - 搜索弹窗样式
3. 编写 `js/main.js` — 包含：
   - 主题切换（localStorage 持久化 + 系统偏好检测）
   - 侧边栏管理（移动端抽屉、当前页高亮）
   - TOC 自动生成（IntersectionObserver 追踪）
   - 搜索功能（Ctrl+K 快捷键、模糊匹配）
   - 代码块复制按钮
4. 创建首页 `index.html`

**验证**：浏览器打开首页，检查布局、主题切换、响应式

### 步骤 2：创建参考页面模板

**目标**：手工创建一个完整的内容页作为模板基准

**操作**：
1. 选择 `getting-started/installing.html`（安装指南）作为参考
2. 手工编写完整 HTML，包含：
   - 完整的侧边栏导航（Getting Started 章节）
   - 翻译后的中文内容
   - 所有内容组件（标题、段落、列表、代码块、表格、提示框、标签页）
3. 验证亮色/暗色主题、TOC 生成、侧边栏高亮

**验证**：参考页面在两种主题下均正确显示

### 步骤 3：抓取原站全部页面内容

**目标**：获取所有 85 个页面的原始内容

**操作**：
1. 编写 Python 脚本（存放在临时目录 `c:\Users\hanbo\.trae-cn\work\6a01bd7c4c29e8806525f8e7\`）
2. 遍历所有已知 URL，使用 WebFetch/requests 获取页面内容
3. 提取主内容区域的 HTML
4. 保存为中间 JSON 文件

**URL 列表**（已从原站侧边栏完整提取）：
- Getting Started: 14 个页面
- Code with AI: 20 个页面
- Customize: 11 个页面
- Collaborate: 16 个页面
- Automate: 12 个页面
- Deploy & Secure: 4 个页面
- Gateway: 8 个页面
- KiloClaw: 6 个页面
- AI Providers: 17 个页面
- Contributing: 3 个页面

### 步骤 4：批量翻译内容

**目标**：将所有页面内容翻译为中文

**翻译规则**：
| 类别 | 策略 |
|------|------|
| 页面标题/正文 | 翻译为中文 |
| 专有名词 | 保留英文（Kilo Code, KiloClaw, MCP, BYOK, VS Code, Claude 等） |
| 代码块/命令 | 不翻译 |
| 文件路径 | 不翻译 |
| UI 元素文本 | 翻译 |
| 键盘快捷键 | 不翻译 |

### 步骤 5：批量生成 HTML 文件

**目标**：基于模板批量生成全部 85 个 HTML 页面

**操作**：
1. 基于参考页面模板，编写 Python HTML 生成脚本
2. 为每个章节定义侧边栏导航数据结构
3. 根据文件路径深度自动计算相对路径前缀（`../` 层数）
4. 批量生成所有 HTML 文件
5. 生成 `js/search-index.js` 搜索索引

**路径前缀规则**：
- 根目录页面：`css/style.css`
- 一级目录：`../css/style.css`
- 二级目录：`../../css/style.css`
- 三级目录：`../../../css/style.css`

### 步骤 6：质量校验

**目标**：确保所有页面正确可用

**检查项**：
- [ ] 所有 HTML 文件可正常打开
- [ ] 页面间内部链接正确
- [ ] CSS/JS 资源路径正确
- [ ] 侧边栏当前页高亮正确
- [ ] 搜索功能正常
- [ ] 亮色/暗色主题切换正常
- [ ] 响应式布局在三个断点下正常
- [ ] 代码块格式正确
- [ ] 抽查翻译质量

### 步骤 7：Cloudflare Pages 部署配置

**操作**：
1. 创建 `_redirects` 文件（如需要）
2. 创建 `_headers` 文件（缓存策略：CSS/JS 长期缓存，HTML 短期缓存）

## 项目目录结构

```
kilo-doc/
├── index.html                    # 首页
├── 404.html                      # 404 页面
├── css/
│   └── style.css                 # 全局样式
├── js/
│   ├── main.js                   # 交互逻辑
│   └── search-index.js           # 搜索索引
├── getting-started/              # 入门（14 页）
├── code-with-ai/                 # AI 编码（20 页）
│   ├── platforms/
│   ├── agents/
│   └── features/
├── customize/                    # 定制化（11 页）
│   └── context/
├── collaborate/                  # 协作（16 页）
│   ├── teams/
│   ├── enterprise/
│   └── adoption-dashboard/
├── automate/                     # 自动化（12 页）
│   ├── code-reviews/
│   ├── mcp/
│   └── extending/
├── deploy-secure/                # 部署与安全（4 页）
├── gateway/                      # AI Gateway（8 页）
├── kiloclaw/                     # KiloClaw（6 页）
├── ai-providers/                 # AI 提供商（17 页）
└── contributing/                 # 贡献（3 页）
```

## 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 主题切换 | `[data-theme]` 属性 + CSS 变量 | 零 JS 依赖切换，性能最优 |
| 字体 | Google Fonts CDN 引入 JetBrains Mono | 仅加载一个字体，正文用系统字体 |
| 代码高亮 | 基础 CSS class 手动着色 | 不引入第三方库，保持纯静态 |
| 图标 | 内联 SVG | 无外部依赖，支持主题色 |
| 图片 | 使用原站 CDN 链接 | 避免图片版权和存储问题 |
| 搜索 | 客户端 JS + 静态索引 | 无需后端，适合纯静态站点 |

## 假设与约束

- 原站内容在抓取时是稳定的（快照方式）
- 图片资源继续使用原站 CDN，不本地化
- 翻译由 AI 完成，质量需人工抽查
- 不包含原站的用户登录、Sign in 等交互功能
- 搜索为简单的标题/关键词匹配，非全文搜索
