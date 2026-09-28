/**
 * All2MD 插件入口
 * 
 * 核心流程：
 * 1. 用户触发（命令面板 Ctrl+P 或右键菜单）
 * 2. 弹出文件选择器或接收当前文件路径
 * 3. 检测格式 → 选择对应 Converter
 * 4. 转换 → 保存附件 → 输出 Markdown
 */

import { Plugin, Notice, TFile, MarkdownView, normalizePath, activeDocument } from 'obsidian';
import { All2MDSettingsTab } from './settings';
import { detectFormat } from './converters/converter';
import { DocxConverter } from './converters/docx-converter';
import { PptxConverter } from './converters/pptx-converter';
import { PdfConverter } from './converters/pdf-converter';
import type { All2MDSettings, Converter, ConvertResult, SupportedFormat } from './types';
import { DEFAULT_SETTINGS } from './types';

export default class All2MDPlugin extends Plugin {
	settings!: All2MDSettings;
	private converters: Map<SupportedFormat, Converter> = new Map();

	onload(): void {
		// 加载设置（不阻塞 onload，注册完入口后由 Promise 自行完成）
		void this.loadSettings();

		// 注册转换器
		this.converters.set('docx', new DocxConverter());
		this.converters.set('pptx', new PptxConverter());

		// PDF 转换器：worker 已内联进 main.js（globalThis.pdfjsWorker 注册见 pdf-converter.ts），
		// 无需注入插件目录或部署 worker 文件
		this.converters.set('pdf', new PdfConverter());

		// 注册设置面板
		this.addSettingTab(new All2MDSettingsTab(this.app, this));

		// 注册命令面板入口
		this.addCommand({
			id: 'convert-file-to-md',
			name: 'Convert file to Markdown',
			callback: () => this.pickAndConvert(),
		});

		// 注册文件菜单右键入口（Obsidian 1.1.0+）
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (!(file instanceof TFile)) return;
				const format = detectFormat(file.name);
				if (!format) return;

				menu.addItem((item) => {
					item
						.setTitle('转换为 Markdown')
						.setIcon('file-text')
						.onClick(() => void this.convertFile(file));
				});
			})
		);
	}

	async onunload(): Promise<void> {
		this.converters.clear();
	}

	// ── 设置读写 ──

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// ⚠️ 2026-08-13 设置拆分迁移：
		// 旧版 filePathStrategy='default' 表示"输出到附件目录"，与附件目录混为一谈。
		// 拆分后改为 filePathStrategy='custom' + 独立 mdOutputFolder 字段。
		// 迁移保留旧行为（.md 仍输出到原 attachmentFolder），只是字段语义独立。
		const legacyStrategy = (this.settings as unknown as { filePathStrategy?: string }).filePathStrategy;
		if (legacyStrategy === 'default') {
			this.settings.filePathStrategy = 'custom';
			this.settings.mdOutputFolder = this.settings.attachmentFolder;
			await this.saveSettings(); // 迁移结果落盘
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	// ── 交互入口：弹出文件选择器 ──

	/**
	 * 通过 HTML 文件选择器让用户选择文件
	 * 支持 docx / pptx / pdf
	 */
	private pickAndConvert(): void {
		const input = activeDocument.createEl('input');
		input.type = 'file';
		input.accept = '.docx,.pptx,.pdf';
		input.multiple = false;

		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			void this.convertFromBlob(file);
		};

		input.click();
	}

	// ── 右键菜单入口：接收 vault 内文件 ──

	private async convertFile(file: TFile): Promise<void> {
		const format = detectFormat(file.name);
		if (!format) {
			new Notice(`不支持的文件格式：${file.extension}`, 4000);
			return;
		}

		const notice = new Notice('正在转换...', 0);
		try {
			const fileData = await this.app.vault.readBinary(file);
			const converter = this.converters.get(format)!;

			// 根据附件路径模式决定附件引用路径和保存路径
			const { refPath, savePath } = this.resolveAttachmentPaths(file);

			const result = await converter.convert(fileData, file.name, {
				extractImages: this.settings.extractImages,
				attachmentFolder: refPath,
				attachmentNamePrefix: this.resolveAttachmentPrefix(file.name),
			});

			// 保存附件（图片等）
			try {
				await this.saveAttachments(result, savePath);
			} catch (err) {
				throw new Error(`保存附件失败：${err instanceof Error ? err.message : String(err)}`);
			}

			// 按设置输出
			try {
				await this.outputMarkdown(result, file);
			} catch (err) {
				throw new Error(`输出 Markdown 失败：${err instanceof Error ? err.message : String(err)}`);
			}
			notice.hide();
			new Notice(`转换完成！格式：${format.toUpperCase()}，耗时 ${result.meta.durationMs}ms`, 5000);
		} catch (err) {
			notice.hide();
			const msg = err instanceof Error ? err.message : String(err);
			console.error('[All2MD] 转换失败:', msg);
			new Notice(`转换失败：${msg}`, 8000);
		}
	}

	// ── 浏览器文件入口：接收用户选定文件（通过 <input>） ──

	private async convertFromBlob(file: File): Promise<void> {
		const format = detectFormat(file.name);
		if (!format) {
			new Notice(`不支持的文件格式：${file.name.split('.').pop()}`, 4000);
			return;
		}

		const notice = new Notice('正在转换...', 0);
		try {
			const fileData = await file.arrayBuffer();
			const converter = this.converters.get(format)!;

			// blob 来源无 sourceFile，始终使用全局附件路径
			const { refPath, savePath } = this.resolveAttachmentPaths(null);

			const result = await converter.convert(fileData, file.name, {
				extractImages: this.settings.extractImages,
				attachmentFolder: refPath,
				attachmentNamePrefix: this.resolveAttachmentPrefix(file.name),
			});

			await this.saveAttachments(result, savePath);

			// 对 blob 来源，输出到编辑器
			await this.outputMarkdown(result, null);
			notice.hide();
			new Notice(`转换完成！格式：${format.toUpperCase()}，耗时 ${result.meta.durationMs}ms`, 5000);
		} catch (err) {
			notice.hide();
			const msg = err instanceof Error ? err.message : String(err);
			console.error('[All2MD] 转换失败:', msg);
			new Notice(`转换失败：${msg}`, 8000);
		}
	}

	// ── 附件保存 ──

	/**
	 * 计算附件命名前缀（= 最终 MD 文件基名）
	 * 2026-08-24 调整：附件名与转出的 md 文件名相匹配（A.md → A_image_1.png）
	 * - create-file 模式：按命名模板计算，与 createMdFile 的命名保持一致
	 * - insert-cursor 模式：无新文件名 → 用当前笔记名（无笔记则源文件名兜底）
	 */
	private resolveAttachmentPrefix(fileName: string): string {
		const srcName = fileName.replace(/\.\w+$/, '');
		let prefix: string;
		if (this.settings.outputMode === 'create-file') {
			prefix = this.settings.fileNamingTemplate.replace(/\{name\}/g, srcName).replace(/\.md$/i, '');
		} else {
			const active = this.app.workspace.getActiveFile();
			prefix = active ? active.basename : srcName;
		}
		// 清理非法文件名字符（模板可能含路径分隔符/冒号等），保证附件名合法
		return prefix.replace(/[\\/:*?"<>|]/g, '_').trim() || 'attachment';
	}

	/**
	 * 将转换中提取的附件（图片等）写入 vault 指定目录
	 * @param result 转换结果
	 * @param savePath vault 相对路径，附件保存到此目录
	 */
	private async saveAttachments(result: ConvertResult, savePath: string): Promise<void> {
		if (result.attachments.size === 0) return;

		const folderPath = normalizePath(savePath);
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}

		for (const [name, data] of result.attachments) {
			const filePath = normalizePath(`${folderPath}/${name}`);
			if (this.app.vault.getAbstractFileByPath(filePath)) continue;
			await this.app.vault.createBinary(filePath, data);
		}
	}

	/**
	 * 根据附件路径模式，解析附件的引用路径和保存路径
	 * @param sourceFile vault 内的源文件（blob 来源为 null）
	 * @returns refPath（markdown 中用的引用前缀）、savePath（vault 内实际保存目录）
	 */
	private resolveAttachmentPaths(sourceFile: TFile | null): { refPath: string; savePath: string } {
		if (this.settings.attachmentPathMode === 'relative' && sourceFile) {
			// 附件保存在输出 .md 同目录的「附件」下
			// md 输出位置与附件存储位置为两个独立维度，此处与 createMdFile 的 targetDir 保持一致
			const mdDir = this.settings.filePathStrategy === 'source-sibling'
				? (sourceFile.parent?.path || '')
				: (this.settings.mdOutputFolder || '');
			const subDir = mdDir ? `${mdDir}/附件` : '附件';
			return { refPath: '附件', savePath: subDir };
		}
		// 全局模式 或 无 sourceFile
		return {
			refPath: this.settings.attachmentFolder,
			savePath: this.settings.attachmentFolder,
		};
	}

	// ── 输出 Markdown ──

	/**
	 * 根据设置将 Markdown 内容输出
	 * @param result 转换结果
	 * @param sourceFile vault 内的源文件（如果是 vault 内文件则有值，否则为 null）
	 */
	private async outputMarkdown(result: ConvertResult, sourceFile: TFile | null): Promise<void> {
		const mdContent = this.buildHeader(result) + result.markdown;

		if (this.settings.outputMode === 'create-file') {
			// 模式 B：生成新 .md 文件
			await this.createMdFile(mdContent, result, sourceFile);
		} else {
			// 模式 A：插入当前光标处
			await this.insertAtCursor(mdContent);
		}
	}

	/**
	 * 模式 A：插入当前编辑器光标处
	 *
	 * 2026-09-28 修复①：右键文件菜单时焦点在文件列表，getActiveViewOfType 返回 null
	 * 误判"未打开笔记"。现增加回退：活动视图不是 MarkdownView 时，
	 * 取任意一个已打开的 Markdown 视图（通常最后一个 = 最近使用的）。
	 * 2026-09-28 修复②：笔记处于阅读模式（预览态）时没有编辑器对象，
	 * 插入会抛 TypeError。候选视图只认 editor 存在的（源码/实时预览模式）。
	 */
	private async insertAtCursor(mdContent: string): Promise<void> {
		const candidates: MarkdownView[] = [];
		const active = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (active) candidates.push(active);
		for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
			if (leaf.view instanceof MarkdownView && !candidates.includes(leaf.view)) {
				candidates.push(leaf.view);
			}
		}
		const view = candidates.find(v => v.editor);
		if (!view) {
			new Notice('没有可编辑的笔记（阅读模式无法插入光标处）。请打开一个笔记并切换到编辑模式，或改用"生成新文件"输出方式。', 8000);
			return;
		}

		const editor = view.editor;
		const cursor = editor.getCursor();
		editor.replaceRange(mdContent, cursor);
		// 将光标移到插入内容的末尾
		const lines = mdContent.split('\n');
		const lastLineLen = lines[lines.length - 1].length;
		const newPos = {
			line: cursor.line + lines.length - 1,
			ch: lastLineLen,
		};
		editor.setCursor(newPos);
	}

	/**
	 * 模式 B：生成新的 .md 文件保存到 vault
	 */
	private async createMdFile(
		mdContent: string,
		result: ConvertResult,
		sourceFile: TFile | null
	): Promise<void> {
		const srcName = result.meta.sourceFileName.replace(/\.\w+$/, '');
		let fileName = this.settings.fileNamingTemplate.replace(/\{name\}/g, srcName);
		// 确保以 .md 结尾
		if (!fileName.endsWith('.md')) {
			fileName += '.md';
		}

		let targetDir: string;
		if (this.settings.filePathStrategy === 'source-sibling' && sourceFile) {
			// 源文件同目录
			targetDir = sourceFile.parent?.path || '';
		} else {
			// 自定义输出目录（空 = vault 根目录）——与附件目录完全独立
			targetDir = this.settings.mdOutputFolder || '';
		}

		const filePath = normalizePath(targetDir ? `${targetDir}/${fileName}` : fileName);

		// 处理同名文件冲突：加序号
		let finalPath = filePath;
		let counter = 1;
		while (this.app.vault.getAbstractFileByPath(finalPath)) {
			const baseName = fileName.replace(/\.md$/, '');
			finalPath = normalizePath(targetDir ? `${targetDir}/${baseName}_${counter}.md` : `${baseName}_${counter}.md`);
			counter++;
		}

		await this.app.vault.create(finalPath, mdContent);

		// 打开新创建的文件
		const newFile = this.app.vault.getAbstractFileByPath(finalPath);
		if (newFile instanceof TFile) {
			await this.app.workspace.getLeaf().openFile(newFile);
		}
	}

	/**
	 * 构建转换结果的 Markdown 头部信息
	 */
	private buildHeader(result: ConvertResult): string {
		const m = result.meta;
		let header = '';
		header += `---\n`;
		header += `source: ${m.sourceFileName}\n`;
		header += `format: ${m.format}\n`;
		header += `converted: ${new Date().toISOString()}\n`;
		if (m.pageCount) header += `pages: ${m.pageCount}\n`;
		if (m.tableCount) header += `tables: ${m.tableCount}\n`;
		header += `---\n\n`;
		return header;
	}
}
