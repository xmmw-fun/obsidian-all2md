# 016 · all2md 插件 · 项目卡片

---

## 基本信息

| 字段 | 内容 |
|------|------|
| 项目编号 | 016 |
| 项目名称 | all2md |
| 项目类型 | Obsidian 插件 |
| 创建日期 | 2026-08-07 |
| 当前版本 | v1.0.6（修复 v1.0.5 的 Word 转换回归，待阿麦实测后重新 Publish） |
| 负责人 | 阿麦 |
| 项目目录 | `scr/016-obsidian-all2md/` |
| 插件 ID | `alltomd`（v1.0.3 起；原 `all2md` 因官方规范"仅小写字母+连字符"被拒） |
| 显示名 | `AllToMD`（v1.0.4 起，与 ID 统一；原 `All2MD`） |
| minAppVersion | 1.4.0（v1.0.5 起，因用到 vault.createFolder；原 1.1.0 被审查判 minAppVersion 低于实际所用 API） |
| 描述 | 将各种格式文件转为 Markdown——右键文件选择转换，即可在 Obsidian 内使用。M1 优先打通 Word/PPT/PDF，后续逐步覆盖更多格式。零外部依赖，纯前端（浏览器沙箱）运行。 |

---

## 当前状态

- **状态**：🟢 v1.0.6 阿麦实测三格式通过（2026-09-28 21:55），已重新 Publish，**社区二审审核中**，结果明天后天回填；实测通过版已备份 `G:\Q备份\016-alltomd-v1.0.6-实测通过-备份-20260928.zip`
- **阶段**：M1 完成（docx/pptx/pdf 三格式转换 + 命令面板/右键菜单/设置面板）→ 四 bug 修复（2026-08-13）→ **三格式实测全部通过 + T12 附件命名通过（2026-08-24 阿麦实测）→ v1.0.0 可用版双保险保存（git `089713a` + zip）** → 首发评估与上架（2026-09-28：v1.0.0 提交 → 命名整改 v1.0.3/1.0.4 → 首轮审核未通过 → v1.0.5 审查整改）
- **最后更新**：2026-09-28
- **最后更新者**：AI（阿麦发起）

---

## 进度概览

all2md 是全新的 Obsidian 社区插件项目，解决「各种格式文件 → Obsidian Markdown」的转换痛点。右键文件，一键转 MD。M1 以 docx/pptx/pdf 为突破口，后续持续扩展更多格式。

**已完成**：
- 策划案与 MVP 定义（2026-08-07）
- PoC 技术验证（2026-08-08）：docx→md / pptx→md / pdf→md 三条链路全部通过
- M1 MVP 开发（2026-08-08）：12 项 P0 全部实现（docx/pptx/pdf 转换核心 + 命令面板/右键菜单/设置面板）
- 四 bug 修复（2026-08-13）：DOCX buffer 不兼容 / PPTX 图片基准路径 / PDF worker 路径 / 设置面板拆分
- **三格式实测全部通过（2026-08-24 阿麦实测）**：docx/pptx/pdf 转换 + 图片提取 + 表格 ✅
- **T12 附件命名通过（2026-08-24）**：附件名 = MD 基名_image_N（如 A.md → A_image_1.jpg）
- **v1.0.0 可用版双保险保存（2026-08-24）**：git 提交 `089713a` + `G:\Q备份\016-all2md-v1.0.0-20260824.zip`
- **插件已安装至 work 库（2026-08-24）**：`E:\Obsidian\vault998-outup-work\.obsidian\plugins\all2md\`

**进行中**：
- 无（M1 已收口）

**待启动**：
- M2 扩展（xlsx/html/csv 等格式）

---

## 待办清单

### 🔴 高优先级（当前）
- [ ] **v1.0.5 审查整改后重新 Publish**（2026-09-28 晚 阿麦发起）：首轮审核未通过（2 Error + 一批 Warning），v1.0.5 已整改并发布 GitHub Release ✅（详见更新日志）；**待阿麦：① 重载 Obsidian 实测 docx/pptx/pdf 三格式（重点确认 PDF 转换——pdfjs 换现代构建后未实测）② 回 community.obsidian.md 重新 Publish ③ 新审核结果发 AI 归档**。审查规则已沉淀至 [[../../tools/Obsidian 社区插件上架流程|tools/Obsidian 社区插件上架流程.md]]「审查规则档案」节
- [x] 首发版评估 + 社区上架准备（2026-09-28）：评估 ✅、流程沉淀 ✅、差距整改 ✅、GitHub 仓库与 v1.0.0 Release ✅、community.obsidian.md 提交 ✅（阿麦 20:47 操作，只粘贴仓库 URL 即可，字段自动识别）

### 🟡 中优先级（M2 扩展）
- [ ] **M2 扩展规划**（xlsx/html/csv 等格式，明确范围后立项）
- [ ] xlsx 表格转换支持
- [ ] 图片提取与嵌入
- [ ] 批量转换
- [ ] 自定义输出模板
- [ ] 更多格式扩展（html/csv/txt 等）

### 🟢 低优先级（M3+）
- [ ] OCR 增强、模板系统等

### ✅ 已完成
- [x] 项目立项（2026-08-07）
- [x] 策划案与 MVP 范围定稿（2026-08-07）
- [x] 技术选型 PoC：三条链路验证通过（2026-08-08）
- [x] M1 MVP 开发：docx 转换核心（2026-08-08）
- [x] M1 MVP 开发：pptx 转换核心（2026-08-08）
- [x] M1 MVP 开发：pdf 转换核心（2026-08-08）
- [x] 命令面板 + 右键菜单 + 设置面板（2026-08-08）
- [x] 四 bug 修复（DOCX buffer / PPTX 基准路径 / PDF worker / 设置拆分，2026-08-13）
- [x] 三格式实测全部通过（docx/pptx/pdf + 图片 + 表格，2026-08-24 阿麦实测）
- [x] T12 附件命名调整并实测通过（附件名 = MD 基名_image_N，2026-08-24）
- [x] v1.0.0 可用版双保险保存 + 部署到 work 库（2026-08-24）

---

## 关键文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 策划案与 MVP 定义 | `scr/016-obsidian-all2md/docs/规划-all2md-01-策划案与MVP定义.md` | M1 目标、技术路线、需求矩阵、风险与对策 |
| 社区上架通用流程 | `tools/Obsidian 社区插件上架流程.md` | 2026-09-28 沉淀，适用于本库所有插件上架；含自检表 |

---

## 更新日志

| 日期 | 更新者 | 改动摘要 |
|------|--------|---------|
| 2026-08-07 | AI | 项目立项：创建项目卡片、策划案、目录结构；全局待办登记 |
| 2026-08-08 | AI | PoC 三条链路验证通过；M1 开发完成 12 项 P0；main.js 部署 |
| 2026-08-13 | AI | 四 bug 修复（DOCX buffer/PPTX 图片路径/PDF worker/设置拆分）；部署待实测 |
| 2026-08-17 | AI | 卡片状态滚动更新（M1 完成待实测）；全局待办 W34 同步 |
| 2026-08-24 | AI | 三格式实测全部通过（阿麦实测）；v1.0.0 可用版双保险保存（git `089713a` + `G:\Q备份` zip）；T12 附件命名调整（附件名=MD基名_image_N）并实测通过；插件安装至 work 库（vault998-outup-work）；全局看板同步 |
| 2026-09-28 | AI（阿麦发起） | 首发版评估 + 上架整改完成（README 发版提醒 / LICENSE(MIT) / versions.json / manifest 终检 / console.log 降 warn / setHeading，整改前备份 `G:\Q备份\016-all2md-v1.0.0-上架整改前备份-20260928.zip`）；GitHub 公开仓库 xmmw-fun/obsidian-all2md 建成，v1.0.0 Release 发布（tag=1.0.0）；上架流程沉淀至 `tools/Obsidian 社区插件上架流程.md`；剩 community.obsidian.md 提交（需阿麦浏览器操作）；总看板 016 行回写 |
| 2026-09-28 | AI | 状态滚动：M1 实测闭环，进入「首发版评估 + 社区上架」阶段（阿麦发起）；修正 minAppVersion 为 1.1.0（与 manifest.json 一致）；全局待办 016 待实测条目对账归档；研发项目看板同步刷新 |
| 2026-09-28 | AI | 上架差距整改（阿麦口头批准，整改前备份 `G:\Q备份\016-all2md-v1.0.0-上架整改前备份-20260928.zip`）：新增 README.md（含发版维护提醒隐藏注释）/ LICENSE（MIT）/ versions.json；manifest 终检（删 fundingUrl 空串、description 补句号、isDesktopOnly 改 true）；两处 console.log 降 console.warn；设置面板 h2/h3 改 setHeading；重新构建 5.1MB 并自动部署至 `.obsidian/plugins/all2md/`；流程文件补「发版必改提醒」。同日署名改为 **XMMW**（阿麦拍板：以后所有插件/软件署名统一 XMMW，已写 project_memory 署名约定）；**GitHub 公开仓库已建成**（github.com/xmmw-fun/obsidian-all2md，gh CLI 设备授权登录 + .gitignore 排除测试文件/开发垃圾），**v1.0.0 Release 已发布**（tag=1.0.0，三件套 main.js/manifest.json/styles.css 齐全，authorUrl 已填主页）。剩余最后一步：community.obsidian.md 提交（阿麦浏览器操作，流程见 tools 上架文档）。同日 v1.0.1 已发布（阿麦实测反馈：修复插入光标模式右键转换误判"无打开笔记"——右键后焦点在文件列表导致 getActiveViewOfType 返回 null，现回退取任一打开的 Markdown 视图；移除未实测的拖拽入口及 README 对应描述）。v1.0.2 经阿麦实测**修复确认**（20:18；病因：v1.0.1 兜底逻辑取"最后一个打开的笔记"，若该笔记处于阅读模式则插入抛错；v1.0.2 改为逐个挑选 editor 存在的笔记，实时预览/源码/阅读模式组合均覆盖）。v1.0.3（20:40）：社区目录提交时 manifest ID `all2md` 被拒——官方规范 ID 只能含小写字母和连字符（不允许数字），改 `alltomd` 后重新发布，部署目录同步改名（设置数据保留）。v1.0.4（20:50）：三个名字统一——显示名 `All2MD`→`AllToMD`、仓库 `obsidian-all2md`→`obsidian-alltomd`（gh repo rename，旧地址自动跳转）；起名规范沉淀至上架流程文档第〇节，以后立项起名即规避 |
| 2026-09-28 | AI | v1.0.6（21:44）：修复 v1.0.5 引入的 Word 转换回归（阿麦实测：两种方式都失败，PDF/PPTX 正常）。病因：为消 `require("fs")` 把 mammoth 内部 `./unzip` 重定向到浏览器版实现，但浏览器版 openZip 只认 `{ arrayBuffer }`、源码仍传 `{ buffer }` → "Could not find file in options"。修复：docx-converter 改传 `{ arrayBuffer: fileData }`，先用 poc 脚本对真实 docx（《讨债鬼》正文.docx，含 4 张图片）离线验证转换+图片提取通过后，才构建发版。**教训：重定向依赖实现后必须端到端实测再发版**。源码备份 `G:\Q备份\016-alltomd-v1.0.6-审查整改后备份-20260928.zip`；git 历史分叉已理清（force-with-lease 安全强推，本地远端一致） |
| 2026-09-28 | AI | v1.0.5（21:10）：按社区首轮审核报告完成整改并发布 Release（tag=1.0.5）。**Error 级修复**：① `minAppVersion` 1.1.0→1.4.0（代码用到 vault.createFolder，低于实际 API 版本被驳回）；② 产物中 `createElement("script")` 清零——pdfjs 从 legacy 构建换现代构建（legacy 的 DynamicLoader 含 script 注入）+ esbuild alias 把 `immediate`/`setimmediate`（jszip 依赖链，特性检测含 script 元素）替换为 src/shims/ 下的 Promise 微任务实现 + jszip 入口从 dist 预打包改指 lib/（dist 内联了完整特性检测）。**Warning 级修复**：manifest 删 unknown `files` 字段、description 改双语且以 ASCII 句号结尾；README 补英文 Installation & Usage 段；esbuild `mainFields:["browser",...]` + 插件重定向 mammoth 内部 `./files` `./unzip` 到 browser 版，产物 `require("fs")` 清零；globalThis 改 window；文件选择器改 activeDocument.createEl；Promise 不 await 的加 void；onload 改非 async；catch 全部去 any 化；删未用导入 TFolder/SUPPORTED_EXTENSIONS；package.json 删 builtin-modules、加 overrides 修 @xmldom/xmldom 漏洞（0.8.15）；产物开启 minify，main.js 5.1MB→2.6MB（<5MB Sync 上限）。**未修（Recommendation 级，不阻塞）**：bluebird/underscore 的 new Function（动态执行建议）、settings.ts getSettingDefinitions 新 API 建议、artifact attestations。审查规则全部沉淀至上架流程文档「审查规则档案」节 |

---

## 备注

- **命名**：all2md = "all to markdown"，语义直白、好记
- **定位**：纯前端插件（不依赖外部二进制），适配 Obsidian 沙箱环境（桌面端 + 移动端）
- **竞品**：Pandoc Plugin（需外部 pandoc 安装）、Importer Plugin（官方、格式有限）、各类单格式转换插件
- **路线**：M1 优先打通 docx/pptx/pdf 三格式 → M2 扩展 xlsx/html/csv/epub 等 → M3 批量/模板/OCR 等增强。终极目标是「常见文件格式全部可转 MD」
- **优先级**：docx（最常见需求）> pdf（次常见）> pptx（第三常见）
