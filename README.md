<!-- ═══════════════════════════════════════════════════════════
     发版维护提醒（维护者可见，网页上不显示）
     每次发布新版本时，必须同步完成以下动作：
     1. manifest.json 的 version 递增（SemVer，如 1.0.1）
     2. versions.json 追加一行："新版本号": "minAppVersion"
     3. GitHub 打同名 tag 并重新上传 main.js / manifest.json / styles.css
     详细流程见项目库 tools/Obsidian 社区插件上架流程.md 第三节
     ═══════════════════════════════════════════════════════════ -->

# All2MD

将各种格式文件（Word / PPT / PDF）一键转换为 Markdown，支持图片和表格提取。

All2MD converts Word, PowerPoint and PDF files to Markdown directly inside Obsidian, with image and table extraction.

## 功能特性

- **三种格式**：`.docx`（Word）、`.pptx`（PowerPoint）、`.pdf`（PDF）
- **图片提取**：文档中的图片自动提取为附件并插入引用；也可关闭提取换取更快转换（图片位置显示 `[Image]` 占位符）
- **表格转换**：Word / PPT 中的表格转为标准 Markdown 表格
- **PDF 分段**：按页组织（`## Page N`），自动段落检测，中文正常
- **两种入口**：右键文件菜单、命令面板（`Ctrl+P` → Convert file to Markdown）
- **输出灵活**：插入当前光标处，或生成新的 `.md` 文件（可自定义目录与命名模板）
- **附件命名清晰**：附件名与产出的 Markdown 文件名匹配（如 `A.md` → `A_image_1.png`）
- **纯本地运行**：零外部依赖，不发起任何网络请求，不上传任何数据
- **桌面端**：支持 Windows / macOS / Linux 桌面版 Obsidian

## 使用方法

### 方式一：右键转换（推荐）

在文件列表中右键点击任意 `.docx` / `.pptx` / `.pdf` 文件 → **转换为 Markdown**。

### 方式二：命令面板

`Ctrl+P`（macOS 为 `Cmd+P`）打开命令面板，输入 "Convert file to Markdown"，在弹出的文件选择器中选取文件。

### 输出结果

转换成功后会生成如下结构：

- 新 `.md` 文件头部自动附带元信息（来源文件、格式、转换时间、页数/表格数）
- 图片等附件按设置保存到附件目录，Markdown 中以相对路径引用

## 设置

在 **设置 → 第三方插件 → All2MD** 中配置：

| 设置项 | 说明 |
|--------|------|
| 输出方式 | 插入到当前光标处 / 生成新的 .md 文件 |
| Markdown 保存位置 | 源文件所在目录 / 指定目录（与附件位置相互独立） |
| 文件命名模板 | 默认 `{name}.md`，`{name}` 替换为源文件名 |
| 附件存储模式 | 全局附件目录 / 新 md 同目录下的「附件」文件夹 |
| 提取源文件中的图片 | 开启后提取图片；关闭后用 `[Image]` 占位符替代 |

## 手动安装

1. 从 [Releases](../../releases) 下载 `main.js`、`manifest.json`、`styles.css`
2. 放入你的库目录 `你的库/.obsidian/plugins/alltomd/`
3. 重启 Obsidian，在 **设置 → 第三方插件** 中启用 All2MD

## 路线图

- [ ] 更多格式：xlsx / html / csv / epub
- [ ] 批量转换
- [ ] 自定义输出模板
- [ ] PDF 图片提取（当前 PDF 仅文本）
- [ ] OCR 增强

## 隐私说明

本插件完全在本地运行：**不发起任何网络请求，不收集任何数据，无遥测**。

## 许可证

[MIT](LICENSE)
