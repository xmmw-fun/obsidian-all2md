/**
 * PDF 转换器
 * 技术路径：pdf.js 提取文本 → 按段落分节 → Markdown
 * 
 * 当前 MVP 实现：
 * - 使用 disableWorker 模式（不依赖 Worker 文件，兼容 Obsidian 沙箱）
 * - 提取文本并按坐标自动分段
 * - 图片提取暂未实现（Worker 模式限制，计划在后续迭代中解决）
 * 
 * 已知限制：
 * - 多栏布局可能导致文字交错
 * - 图片提取需要 Worker 模式或额外解码库
 * - 扫描版 PDF 需要 OCR（M3 计划）
 */

// ⚠️ 必须用 legacy build：pdfjs-dist v6 默认入口 build/pdf.mjs 在 import 阶段
// 就需要浏览器 DOMMatrix API，Node.js/Electron 环境没有 → 一加载就崩。
// legacy 构建不依赖 DOM API，可在 Node/Electron 中直接运行（2026-08-08 实测验证）
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import type { Converter, SupportedFormat, ConvertResult, ConvertOptions } from '../types';
import { makeResult } from './converter';

// ⚠️ pdf.js v6 Worker 加载真相（2026-08-24 源码分析确认）：
// - Electron renderer 中 isNodeJS 判定为 false → 走浏览器路径
//   `new Worker(file://...pdf.worker.mjs, {type:'module'})`，而 Chromium 禁止从
//   file:// 页面加载 file:// 的 module worker → 必然失败；回退 fake worker 的
//   `import(workerSrc)` 在 Obsidian 沙箱中同样不可靠（这就是 08-13 的 file URL
//   方案在 Obsidian 内仍然失败的原因，Node 环境测试通过不代表 Electron 通过）。
// - 官方主线程注入点：pdf.mjs 中 `PDFWorker.#mainThreadWorkerMessageHandler` 直接读
//   `globalThis.pdfjsWorker?.WorkerMessageHandler`。一旦注册，`#initialize` 与
//   `_setupFakeWorkerGlobal` 都跳过 new Worker / import(workerSrc)，改在主线程解析。
// - 因此这里把 pdf.worker.mjs 打包进 main.js 并注册到 globalThis，不再依赖任何
//   worker 文件，也无需配置 workerSrc（pdf.worker.mjs 部署步骤已从 esbuild 移除）。
(globalThis as any).pdfjsWorker = { WorkerMessageHandler: (pdfjsWorker as any).WorkerMessageHandler };

export class PdfConverter implements Converter {
	readonly name = 'PDF Converter';
	readonly format: SupportedFormat = 'pdf';

	async convert(fileData: ArrayBuffer, fileName: string, options: ConvertOptions): Promise<ConvertResult> {
		const startTime = Date.now();

		// 加载 PDF（pdf.js v6 不支持 disableWorker，worker 通过 workerSrc 指向本地文件）
		const loadingTask = pdfjsLib.getDocument({
			data: new Uint8Array(fileData),
		} as any);
		const pdf = await loadingTask.promise;

		const pageCount = pdf.numPages;
		const parts: string[] = [];

		// 逐页提取文本
		for (let i = 1; i <= pageCount; i++) {
			const page = await pdf.getPage(i);
			const textContent = await page.getTextContent();
			const paragraphs = buildParagraphs(textContent);

			if (paragraphs.length > 0) {
				parts.push(`## Page ${i}\n`);
				for (const para of paragraphs) {
					parts.push(para);
					parts.push('\n');
				}
			}
		}

		const markdown = parts.join('\n');
		const attachments = new Map<string, ArrayBuffer>();
		const durationMs = Date.now() - startTime;

		// 注：图片提取在 disableWorker 模式下不可用
		// 后续 M2/M3 通过加载 Worker bundle 或 canvas 渲染解决
		if (options.extractImages) {
			console.warn('[All2MD] PDF 图片提取暂不可用（需 Worker 模式），已跳过');
		}

		return makeResult(markdown, attachments, {
			sourceFileName: fileName,
			format: 'pdf',
			durationMs,
			pageCount,
			imageCount: 0,
			tableCount: 0,
		});
	}
}

/**
 * 根据文本坐标将 pdf.js 文本项聚合为段落
 * 
 * 原理：pdf.js 的 textItem 包含 transform 数组，
 * transform[5] = Y 坐标（页面从上到下排列），
 * transform[4] = X 坐标（左到右）。
 * 
 * 算法：
 * 1. 按 Y 坐标分组为「行」（同一行的文字 Y 坐标相近）
 * 2. 行内按 X 坐标排序，拼接同行文字
 * 3. 根据行间距判断是否换段（间距 > 平均行高的 2.2 倍 → 新段落）
 */
function buildParagraphs(textContent: { items: any[] }): string[] {
	const items = textContent.items;
	if (!items || items.length === 0) return [];

	// 提取带有位置信息的文本项
	const positionedItems: PositionedItem[] = [];
	for (const item of items) {
		const str = item.str;
		if (!str) continue;
		// transform 是 [scaleX, skewX, skewY, scaleY, translateX, translateY]
		const transform = item.transform;
		if (!transform || transform.length < 6) continue;
		positionedItems.push({
			text: str,
			x: transform[4],
			y: transform[5],
			height: item.height || Math.abs(transform[3]) || 12,
		});
	}

	if (positionedItems.length === 0) return [];

	// 计算平均行高（用于容差和段距判断）
	const heights = positionedItems.map(it => it.height);
	const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

	// 第 1 步：按 Y 坐标分组为行（容差 = avgHeight * 0.5）
	const lineTolerance = avgHeight * 0.5;
	const lines = groupIntoLines(positionedItems, lineTolerance);

	// 第 2 步：每行内按 X 排序，拼接文字
	const lineTexts = lines.map(line => {
		line.sort((a, b) => a.x - b.x);
		return line.map(it => it.text).join(' ');
	});

	// 第 3 步：按间距分组为段落（间距 > avgHeight * 2.2 → 新段落）
	const paraGapThreshold = avgHeight * 2.2;
	const gaps = [0]; // 第一行前无间距
	for (let i = 1; i < lines.length; i++) {
		const prevLine = lines[i - 1];
		const currLine = lines[i];
		if (prevLine.length > 0 && currLine.length > 0) {
			// 上一行的最大 Y 与当前行的最小 Y 之间的距离
			const prevMaxY = Math.max(...prevLine.map(it => it.y));
			const currMinY = Math.min(...currLine.map(it => it.y));
			gaps.push(Math.abs(prevMaxY - currMinY));
		} else {
			gaps.push(0);
		}
	}

	const paragraphs: string[] = [];
	let currentPara = '';

	for (let i = 0; i < lineTexts.length; i++) {
		if (gaps[i] > paraGapThreshold && currentPara.trim()) {
			// 大间距 → 结束当前段落，开始新段落
			paragraphs.push(currentPara.trim());
			currentPara = lineTexts[i];
		} else {
			if (currentPara) {
				currentPara += ' ' + lineTexts[i];
			} else {
				currentPara = lineTexts[i];
			}
		}
	}

	if (currentPara.trim()) {
		paragraphs.push(currentPara.trim());
	}

	return paragraphs;
}

/** 带位置的文本项 */
interface PositionedItem {
	text: string;
	x: number;
	y: number;
	height: number;
}

/**
 * 按 Y 坐标将文本项分组为行
 * 相同行的文字 Y 坐标差在 tolerance 范围内
 */
function groupIntoLines(items: PositionedItem[], tolerance: number): PositionedItem[][] {
	if (items.length === 0) return [];

	// 按 Y 降序排列（pdf.js 坐标系 Y 向上，但文本提取时 Y 值越大的越靠上）
	const sorted = [...items].sort((a, b) => b.y - a.y);

	const lines: PositionedItem[][] = [[sorted[0]]];

	for (let i = 1; i < sorted.length; i++) {
		const current = sorted[i];
		const currentLine = lines[lines.length - 1];
		// 计算当前行所有项目的平均 Y
		const avgY = currentLine.reduce((sum, it) => sum + it.y, 0) / currentLine.length;

		if (Math.abs(current.y - avgY) <= tolerance) {
			// 同一行
			currentLine.push(current);
		} else {
			// 新行
			lines.push([current]);
		}
	}

	return lines;
}
