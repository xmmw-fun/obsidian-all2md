# 规划 · all2md · 01 · 策划案与 MVP 定义

---

## 元信息

| 字段 | 内容 |
|------|------|
| 项目 | 016 · all2md |
| 迭代 | 01 · 策划案与 MVP 定义（需求调研 + 技术选型 + 范围划定） |
| 状态 | 🟡 策划中 |
| 起草日期 | 2026-08-07 |
| 起草者 | AI（阿麦发起） |
| 关联文档 | [[项目卡片-obsidian-all2md]] |

---

## 一、目标

设计并实现一个 Obsidian 插件，能将各种格式的外部文件转换为 Markdown 格式，直接在 Obsidian vault 内使用。

**一句话**：右键文件，一键转 MD。M1 优先打通 Word/PPT/PDF，后续逐步覆盖更多格式。

---

## 二、市场调研

### 2.1 用户场景

| 场景 | 描述 | 频次 |
|------|------|------|
| 同事发 Word 文档 | 需要把内容转成 MD 纳入笔记体系 | 高频 |
| 会议 PPT 归档 | PPT 讲义内容需要可检索、可链接 | 中频 |
| 论文/报告 PDF | PDF 资料需要摘录、批注、关联 | 中高频 |
| 合同/协议 | Word/PDF 合同核心条款需要 Markdown 化 | 低频但高价值 |

### 2.2 竞品全景（Obsidian 生态）

调研时间：2026-08-07。以下覆盖 Obsidian 社区插件市场已知的同类/近类竞品。

#### A 类：「多格式转 MD」插件（最直接竞品）

| 插件 | 技术底层 | 支持格式 | 需要额外安装 | 用户体验 |
|------|----------|----------|:---:|------|
| **Markitdown File Converter**（Ethan Troy, ⭐85） | 桥接微软 Markitdown Python 库 | PDF / PPTX / DOCX / XLSX / 图片OCR / 音频转录 / HTML / CSV / JSON / XML / ZIP / YouTube | ⚠️ Python 3.8+ | 功能丰富（批量/文件夹递归/拖拽/YouTube），但**首次使用需装 Python + pip 包**，对非技术用户是硬门槛 |
| **MarkItDown Importer**（Elek, 1.0.5） | 同上（微软 Markitdown Python 库） | 文档/图片OCR/音频转录/网页/压缩包/YouTube/Bilibili | ⚠️ Python 3.10+ + `.venv` | 格式覆盖极致（含 Bilibili 字幕），交互友好（拖拽/命令面板/上传图标），但**本质问题一样：必须装 Python** |
| **MarkItDown Flow** | 同上（微软 Markitdown） | 类似上述 | ⚠️ Python | 同类第三个 Markitdown 变体，格局相同 |
| **Pandoc Plugin**（Oliver Balfour） | 桥接本地 Pandoc 二进制 | 20+ 格式双向（MD↔其他） | ⚠️ 必须手动安装 Pandoc | 功能最强但**门槛最高**：需下载安装 pandoc、配 PATH、终端验证；大量用户卡在「Pandoc is not installed」报错上 |

> **共同痛点**：所有这类插件都依赖**外部运行时**（Python 或 Pandoc），用户必须离开 Obsidian 去装东西。对不懂命令行的用户 = 一票否决。

#### B 类：「单格式转 MD」插件（间接竞品）

| 插件 | 定位 | 技术 | 局限 |
|------|------|------|------|
| **Docxer**（Developer-Mike, ⭐137） | 预览并转换 .docx → MD | mammoth + turndown，纯 JS | **仅 DOCX**，无法覆盖 PPTX/PDF |
| **Marker PDF to MD**（L3-N0X） | AI 增强 PDF→MD（含 OCR） | Marker API（自托管或付费）+ MistralAI OCR | **仅 PDF**，且需自建 API 服务或付费；非技术用户用不了 |
| **PDF to Markdown** | 社区多个 PDF 转换插件 | 多种方案 | **仅 PDF**，质量参差 |

#### C 类：非插件竞品（替代方案）

| 方案 | 典型工具 | 流程 | 核心劣势 |
|------|----------|------|----------|
| **在线网页转换** | GetMarkdown.com / Markitdown.online / file2markdown.com | 网页上传/本地处理 → 下载 MD → 手动拖回 vault | 离开 Obsidian 工作流，多步操作，隐私顾虑 |
| **命令行工具** | Pandoc CLI / pptx2md / word2md | 终端操作 → 输出 MD → 手动放入 vault | 需要命令行能力，完全不在 Obsidian 内 |
| **Obsidian Importer**（官方） | 官方导入工具 | 迁移其他笔记应用数据 → Obsidian | 定位是「搬家工具」（从 Notion/Evernote 迁入），非日常「文件→MD 转换」场景；不直接支持 .docx/.pptx 单文件转换 |

### 2.3 竞品详细对比

#### Markitdown 系（File Converter / Importer / Flow）

| 维度 | 评价 |
|------|------|
| **优势** | 格式覆盖极其广泛（文档+图片OCR+音频转写+视频字幕+网页），微软官方 Python 库背书，功能迭代快 |
| **劣势** | **硬伤：必须装 Python**。安装流程涉及：装 Python → 配 PATH → 创建 venv → pip install markitdown[all] → 等待下载。Obsidian 大量用户（学生/文科/职场）卡在这一步。且 Python 库质量因格式而异（中文 PDF 效果尤其不稳定） |
| **适合谁** | 已装 Python 的开发者/技术用户，需要极宽格式覆盖 |

#### Docxer

| 维度 | 评价 |
|------|------|
| **优势** | **纯 JS 实现**（mammoth + turndown），零外部依赖，安装即用；可预览 docx 后再决定是否转换 |
| **劣势** | **只做 docx**，PDF 和 PPTX 完全不管，用户仍要找其他方案补位 |
| **适合谁** | 只要转换 Word 文档的轻度用户 |

#### Pandoc Plugin

| 维度 | 评价 |
|------|------|
| **优势** | 格式转换之王：20+ 格式双向互通，功能天花板最高 |
| **劣势** | **入门门槛最高**：需装 Pandoc 可执行文件（~200MB），配系统 PATH，Windows/Mac/Linux 各有安装步骤。Obsidian 论坛/CSDN 有大量「Pandoc is not installed」求助帖。此外它偏**导出**（MD→Word/PDF），导入（文件→MD）不是主场景 |
| **适合谁** | 开发者/学术用户，已装 Pandoc 或愿意花时间配置 |

#### 在线工具（GetMarkdown 等）

| 维度 | 评价 |
|------|------|
| **优势** | 零安装，浏览器打开即用，支持格式较广 |
| **劣势** | 完全在 Obsidian 之外：打开网页 → 上传/拖入文件 → 等待转换 → 复制或下载 MD → 粘贴回 vault。流程断裂，不适合频繁使用。部分工具虽声称「不上传」，但用户无法验证 |
| **适合谁** | 偶发的临时转换需求 |

### 2.4 差异化定位（我们 vs 竞品）

| 对比维度 | Markitdown 系 | Docxer | Pandoc Plugin | 在线工具 | **all2md（我们）** |
|----------|:---:|:---:|:---:|:---:|:---:|
| 零外部依赖（不装 Python/Pandoc） | ❌ 需 Python | ✅ | ❌ 需 Pandoc | ✅ | ✅ |
| DOCX 转换 | ✅ | ✅ | ✅ | ✅ | ✅ |
| PPTX 转换 | ✅ | ❌ | ✅ | ✅ | ✅ |
| PDF 转换 | ✅ | ❌ | ✅ | ✅ | ✅ |
| 在 Obsidian 内完成 | ✅ | ✅ | ✅ | ❌ | ✅ |
| 右键即转 | ✅ | ✅ | 命令面板 | ❌ | ✅ |
| 移动端可用 | ❌ | 部分 | ❌ | ✅ | ✅（M3） |
| 格式可扩展路线图 | ✅ | ❌ | ✅ | — | ✅ |
| 安装复杂度 | 高（Python+pip） | 低（1 点击） | 高（Pandoc+PATH） | 无 | **低（1 点击）** |

**核心差异化一句话**：all2md 是 **Obsidian 生态中唯一一个：零外部依赖 + 同时覆盖 DOCX/PPTX/PDF 三格式 + 安装即用** 的格式转换插件。

| 对手 | 它们做不到的事 |
|------|---------------|
| Docxer | 不会做 PPTX 和 PDF |
| Markitdown 系 | 不可能去掉 Python 依赖（底层是 Python 库） |
| Pandoc Plugin | 不可能省掉 Pandoc 安装步骤 |
| 在线工具 | 不可能嵌入 Obsidian 工作流 |

### 2.5 目标用户

- Obsidian 知识工作者（学生/研究者/职场人）
- 需要频繁消化外部文档的用户
- **不想装、不会装 Pandoc 或 Python 的用户**（核心增量人群）
- 希望「安装一个插件，搞定常见文件格式」的一站式用户

---

## 三、技术方案

### 3.1 总体架构

```
用户操作（右键菜单 / 命令面板）
       ↓
   main.ts（插件入口）
       ↓
   converters/（格式转换器，可扩展）
   ├── docx-converter.ts   → mammoth.js → HTML（含图/表） → Markdown
   ├── pptx-converter.ts   → JSZip 解包 → 提取文本+图+表 → Markdown
   ├── pdf-converter.ts    → pdf.js → 提取文本+图+表 → Markdown
   └── ...（后续格式按需扩展）
       ↓
   output（按设置：插入当前笔记光标处 或 创建新 .md 文件）
```

### 3.2 各格式转换方案

#### docx → md

| 方案 | 思路 | 优劣 |
|------|------|------|
| **mammoth.js** ✅ | 浏览器端解析 docx 输出 HTML，再转 Markdown | 成熟、纯 JS、无外部依赖、保留基本格式（标题/粗斜体/列表/表格/图片） |
| docx4js | 直接解析 OOXML 构建 AST | 更灵活但更底层，工作量大 |
| pandoc wasm | 编译 pandoc 到 WASM | 包体积大（~20MB+），移动端不友好 |

**推荐**：mammoth.js（npm 包 `mammoth`，MIT 协议，周下载 ~300k）。mammoth 原生支持提取图片（转 base64 或保存附件）和表格（转 HTML table），再经 turndown 统一转为 MD。

#### pptx → md

| 方案 | 思路 | 优劣 |
|------|------|------|
| **JSZip + 手动解析** ✅ | pptx 本质是 zip，解包取 `ppt/slides/slide*.xml`，提取 `<a:t>` 文本；图片从 `ppt/media/` 中提取；表格从 `<a:tbl>` 节点解析 | 不依赖第三方 pptx 库、可控性强 |
| pptx2json | 第三方库 | 依赖维护风险 |
| pptx-parser | 社区库 | 不够流行，可能有坑 |

**推荐**：JSZip（npm 包 `jszip`，MIT/GPLv3 双协议）手动解析 slide XML，按页输出 `## Slide N` + 文本段落。图片从 zip 内 `ppt/media/` 目录提取并保存到 vault 附件目录，表格从 `<a:tbl>` 解析为 MD 表格。

#### pdf → md

| 方案 | 思路 | 优劣 |
|------|------|------|
| **pdf.js** ✅ | Mozilla 出品，浏览器沙箱解析 PDF、提取文本 | 行业标准、纯 JS、可获取文本位置/字体/页面信息 |
| pdf-parse | Node.js 封装 | 依赖 Node fs 模块，Obsidian 沙箱不可用 |
| WASM OCR | Tesseract.js | 仅扫描版 PDF 需要，按需引入 |

**推荐**：pdf.js（npm 包 `pdfjs-dist`，Apache 2.0 协议），在 Obsidian 沙箱中可用（使用 `GlobalWorkerOptions.workerSrc` 指向本地 worker bundle）。支持分页提取文本 + 嵌入图片（通过 `page.getViewport` + canvas 渲染页面截图，或以 `page.objs` 提取内嵌图片流）。表格提取通过分析文本坐标布局推断行列结构。

### 3.3 依赖清单（预估）

| 包名 | 用途 | 大小 | 协议 |
|------|------|------|------|
| `mammoth` | docx→HTML | ~300KB | MIT |
| `jszip` | pptx 解包 | ~100KB | MIT |
| `pdfjs-dist` | pdf 文本提取 | ~3MB（含 worker） | Apache 2.0 |
| `turndown`（可选） | HTML→Markdown | ~20KB | MIT |

总计：约 3.5MB（构建后 tree-shaking 可优化）

---

## 四、MVP 范围（M1 · P0 核心需求）

### M1 MVP（P0 · 第一阶段核心需求）

| 编号    | 需求               | 说明                                            | 优先级原因       |
| ----- | ---------------- | --------------------------------------------- | ----------- |
| P0-01 | **docx → md 转换** | 将 .docx 文件转为 Markdown，保留文本/图片/表格             | docx 是最高频需求 |
| P0-02 | **pptx → md 转换** | 将 .pptx 转为 Markdown，按幻灯片分节，提取文本+图片+表格        | pptx 第三高频   |
| P0-03 | **pdf → md 转换**  | 将 .pdf 转为 Markdown（文本+内嵌图片+表格，扫描版暂不要求 OCR） | pdf 次高频     |
| P0-04 | **命令面板入口**       | `Ctrl+P` → "All2MD: Convert file to Markdown" | 基础交互入口      |
| P0-05 | **文件选择器**        | 弹出文件选择对话框，仅显示支持格式                             | 用户选文件       |
| P0-06 | **输出方式：插入当前笔记**  | 转换结果插入光标位置（默认方式）                              | 最自然的使用方式    |
| P0-07 | **输出方式：生成新 .md 文件** | 转换结果保存为独立 .md 文件，路径可配                      | 第二常用方式      |
| P0-08 | **设置面板**         | 输出方式二选一（插入光标 / 生成新文件）+ 新文件路径（默认路径 / 源文件所在路径）+ 附件目录（图片/表格资源存储位置）+ 文件命名规则 + **图片提取开关**（是否提取源文件中图片，默认开启） | 基础可配置性      |
| P0-09 | **右键菜单**         | 文件资源管理器右键 → "转换为 Markdown"                    | 快捷操作        |
| P0-10 | **错误处理**         | 文件格式不支持 / 文件损坏 / 转换失败 → 友好 Notice 提示          | 用户体验底线      |
| P0-11 | **进度提示**         | 大文件转换时显示进度条或 loading 状态                       | 基础体验        |
| P0-12 | **图片提取开关**      | 设置面板中提供开关：是否提取源文件中的图片。关闭时仅提取文本+表格，图片用占位符 `[Image]` 替代。默认开启 | 用户自主权、性能优化 |

### 4.2 Non-Goals（M1 不做）

| 不做的事 | 原因 |
|----------|------|
| 扫描版 PDF OCR | 需要 Tesseract.js（巨大），留 M3 |
| xlsx/Excel 转换 | 表格转 MD 复杂，优先三件套（M2 做） |
| 批量转换 | 优先单文件体验 |
| 表格格式完美保留 | docx 表格→MD 表格尽力而为 |
| 移动端适配 | M1 只保证桌面端 |
| 自定义输出模板 | 后续迭代 |
| 拖拽触发转换 | 主交互为右键菜单，拖拽后续评估 |

---

## 五、M1 输出产物

1. **插件源码**（`src/`）：`main.ts` + `converters/` + `settings.ts` + `styles.css`
2. **构建产物**：`main.js` + `manifest.json` + `styles.css`
3. **文档**：`README.md`（用户指南）
4. **测试用例**：3 格式各至少 1 个测试文件，手工验证流程

---

## 六、后续迭代规划（M2-M4）

### M2 · 扩展格式
- xlsx/csv → md（表格转 MD 表格）
- html/epub/rtf → md
- 图片高级优化（图片内联 vs 附件引用策略、超大图自动压缩）

### M3 · 体验增强
- 批量转换（选多个文件或整个文件夹）
- 自定义输出模板（转换后的 MD 结构模板）
- 移动端适配
- 扫描版 PDF OCR（Tesseract.js WASM）

### M4 · 生态
- 更多格式扩展（持续覆盖常见文件格式）
- 社区市场发布

---

## 七、验收（DoD · M1）

- docx / pptx / pdf 三格式均可成功转换为 Markdown
- **图片和表格一并提取**，图片保存到 vault 附件目录，表格转为 MD 表格
- 命令面板 `All2MD: Convert file to Markdown` 可调起文件选择器
- 文件资源管理器右键菜单可触发转换
- 设置面板可配：**输出方式**（插入光标 / 生成新文件二选一）+ **新文件路径**（默认路径 / 源文件所在路径）+ 附件目录 + 文件命名规则 + **图片提取开关**（默认开启，关闭后图片用 `[Image]` 占位符）
- **插入光标模式**：转换结果正确插入当前笔记光标处
- **生成新文件模式**：新建 .md 文件保存到指定路径，文件名按规则生成
- 错误文件 → 友好 Notice 提示（不崩溃、不白屏）
- `npm run build` 通过、`tsc --noEmit` 通过

---

## 八、风险与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| **pdf.js 在 Obsidian 沙箱中加载 worker 失败** | 中 | 高——pdf 整条链路不可用 | PoC 第一优先级验证；worker bundle 以内联 base64 或 data URI 方式加载；fallback：降级为纯文本提取（不依赖 worker） |
| **mammoth 图片处理不达预期** | 低 | 中——图片丢失或乱码 | M1 图片用占位符 `[Image]` 替代，不嵌入 |
| **pptx 内部 XML 格式差异大** | 中 | 中——部分 pptx 解析失败 | 先 PoC 覆盖常见场景（WPS/Office 365/Google Slides 导出版本） |
| **大型 PDF（>50MB）转换超时/内存爆炸** | 低 | 中——大文件不可用 | 加文件大小检查（>50MB 提示建议用桌面工具）；分页渐进式提取 |
| **mammoth 输出 HTML 质量影响 MD 质量** | 中 | 低——需要额外清洗 | 用 turndown 统一 HTML→MD 转换，加正则后处理清洗 |

---

## 九、下一步（PoC 验证）

建议在正式开发前，先用独立脚本（不挂 Obsidian）验证三条转换链路：

1. `mammoth` 能否在浏览器沙箱环境解析 docx 并输出可用 HTML
2. `jszip` + 手动 XML 解析能否从 pptx 中提取出可读文本
3. `pdfjs-dist` 在无 Node.js 环境下能否正常加载 worker + 提取文本

PoC 通过后再启动 M1 正式开发。
