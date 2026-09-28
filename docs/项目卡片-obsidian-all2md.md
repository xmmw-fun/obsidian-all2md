# 016 · all2md 插件 · 项目卡片

---

## 基本信息

| 字段 | 内容 |
|------|------|
| 项目编号 | 016 |
| 项目名称 | all2md |
| 项目类型 | Obsidian 插件 |
| 创建日期 | 2026-08-07 |
| 当前版本 | v1.0.0（三格式实测通过，可用版已保存） |
| 负责人 | 阿麦 |
| 项目目录 | `scr/016-obsidian-all2md/` |
| 插件 ID | `all2md` |
| minAppVersion | 1.1.0 |
| 描述 | 将各种格式文件转为 Markdown——右键文件选择转换，即可在 Obsidian 内使用。M1 优先打通 Word/PPT/PDF，后续逐步覆盖更多格式。零外部依赖，纯前端（浏览器沙箱）运行。 |

---

## 当前状态

- **状态**：🟢 M1 完成并实测通过（v1.0.0 可用版已保存），进入「首发版评估 + 社区上架」阶段
- **阶段**：M1 完成（docx/pptx/pdf 三格式转换 + 命令面板/右键菜单/设置面板）→ 四 bug 修复（2026-08-13）→ **三格式实测全部通过 + T12 附件命名通过（2026-08-24 阿麦实测）→ v1.0.0 可用版双保险保存（git `089713a` + zip）** → **首发版评估与社区上架讨论启动（2026-09-28）**
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
- [ ] **首发版评估 + 社区上架准备**（2026-09-28 阿麦发起）：① 评估 v1.0.0 是否够用作首发版 ✅ 结论：功能够，工程补齐后可发；② 梳理 Obsidian 社区插件上架流程 ✅ 已沉淀至 [[../../tools/Obsidian 社区插件上架流程|tools/Obsidian 社区插件上架流程.md]]（含发版同步提醒与自检表）；③ 按通用自检表补齐差距 ✅ 已完成（2026-09-28，整改前备份 `G:\Q备份\016-all2md-v1.0.0-上架整改前备份-20260928.zip`）：README.md（含发版维护提醒隐藏注释）、LICENSE（MIT）、versions.json、manifest 终检（fundingUrl 空串删除、description 补句号、isDesktopOnly 改 true 桌面端优先）、两处 console.log 降 console.warn、设置面板 h2/h3 改 setHeading、重新构建并自动部署；④ GitHub 公开仓库 ✅ 已建成（xmmw-fun/obsidian-all2md），v1.0.0 Release ✅ 已发布（tag=1.0.0，三件套齐全）；⑤ **剩余最后一步：community.obsidian.md 提交（需阿麦浏览器操作：登录 Obsidian 账号→绑定 GitHub→Add plugin→填 id/name/author/description/repo→Publish）**

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
| 2026-09-28 | AI | 上架差距整改（阿麦口头批准，整改前备份 `G:\Q备份\016-all2md-v1.0.0-上架整改前备份-20260928.zip`）：新增 README.md（含发版维护提醒隐藏注释）/ LICENSE（MIT）/ versions.json；manifest 终检（删 fundingUrl 空串、description 补句号、isDesktopOnly 改 true）；两处 console.log 降 console.warn；设置面板 h2/h3 改 setHeading；重新构建 5.1MB 并自动部署至 `.obsidian/plugins/all2md/`；流程文件补「发版必改提醒」。同日署名改为 **XMMW**（阿麦拍板：以后所有插件/软件署名统一 XMMW，已写 project_memory 署名约定）；**GitHub 公开仓库已建成**（github.com/xmmw-fun/obsidian-all2md，gh CLI 设备授权登录 + .gitignore 排除测试文件/开发垃圾），**v1.0.0 Release 已发布**（tag=1.0.0，三件套 main.js/manifest.json/styles.css 齐全，authorUrl 已填主页）。剩余最后一步：community.obsidian.md 提交（阿麦浏览器操作，流程见 tools 上架文档） |

---

## 备注

- **命名**：all2md = "all to markdown"，语义直白、好记
- **定位**：纯前端插件（不依赖外部二进制），适配 Obsidian 沙箱环境（桌面端 + 移动端）
- **竞品**：Pandoc Plugin（需外部 pandoc 安装）、Importer Plugin（官方、格式有限）、各类单格式转换插件
- **路线**：M1 优先打通 docx/pptx/pdf 三格式 → M2 扩展 xlsx/html/csv/epub 等 → M3 批量/模板/OCR 等增强。终极目标是「常见文件格式全部可转 MD」
- **优先级**：docx（最常见需求）> pdf（次常见）> pptx（第三常见）
