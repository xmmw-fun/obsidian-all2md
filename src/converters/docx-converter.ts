/**
 * DOCX 转换器
 * 技术路径：mammoth.js 解析 docx → HTML → turndown → Markdown
 * 
 * mammoth 原生支持提取图片和表格，输出 HTML 格式。
 * 再用 turndown 将 HTML 统一转为 Markdown，确保格式一致性。
 */

import mammoth from 'mammoth';
import TurndownService from 'turndown';
import type { Converter, SupportedFormat, ConvertResult, ConvertOptions } from '../types';
import { makeResult } from './converter';

export class DocxConverter implements Converter {
	readonly name = 'DOCX Converter';
	readonly format: SupportedFormat = 'docx';

	async convert(fileData: ArrayBuffer, fileName: string, options: ConvertOptions): Promise<ConvertResult> {
		const startTime = Date.now();
		const attachments = new Map<string, ArrayBuffer>();
		let imageCount = 0;
		let tableCount = 0;

		// mammoth 的 Options 类型不支持作为 namespace 使用，用 Record 绕过
		const mammothOptions: Record<string, unknown> = {};

		// 图片处理策略
		if (options.extractImages) {
			mammothOptions.convertImage = mammoth.images.imgElement((image: { contentType?: string; read: () => Promise<Buffer> }) => {
				return image.read().then((buffer: Buffer) => {
					imageCount++;
					const ext = mimeToExt(image.contentType || 'image/png');
					// 附件命名与转出的 md 文件名匹配：A.md → A_image_1.png
					const imgName = `${options.attachmentNamePrefix}_image_${imageCount}.${ext}`;
					// Node Buffer 的 buffer 属性是 ArrayBuffer，slice 确保正确的字节范围
					attachments.set(imgName, buffer.buffer.slice(
						buffer.byteOffset, buffer.byteOffset + buffer.byteLength
					) as ArrayBuffer);
					const refPath = `${options.attachmentFolder}/${imgName}`;
					return { src: refPath };
				}).catch(() => {
					return { src: '', alt: '[Image]' };
				});
			});
		} else {
			// 不提取图片 → 让 mammoth 忽略图片（返回空 src）
			mammothOptions.convertImage = mammoth.images.imgElement(() => {
				return Promise.resolve({ src: '' });
			});
		}

		// mammoth 转换：ArrayBuffer → HTML
		// ⚠️ 输入格式取决于打包进来的 unzip 实现：
		// Node 版（lib/unzip.js）只认 { buffer } / { path }；浏览器版（browser/unzip.js）只认 { arrayBuffer }
		// （2026-08-08 实测 lib 版传 { arrayBuffer } 报 "Could not find file in options"；
		//   2026-09-28 上架整改改走 browser 版后，传 { buffer } 同样报该错，改传 { arrayBuffer }）
		const result = await mammoth.convertToHtml(
			{ arrayBuffer: fileData },
			mammothOptions as any
		);

		if (result.messages && result.messages.length > 0) {
			// mammoth 的 warning 不影响结果，仅记录
			console.warn('[All2MD] mammoth warnings:', result.messages);
		}

		const html = result.value;

		// 统计表格数量（在 HTML 中简单计数 <table> 标签）
		tableCount = (html.match(/<table[^>]*>/gi) || []).length;

		// turndown：HTML → Markdown
		const turndownService = new TurndownService({
			headingStyle: 'atx',
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
		});

		// 自定义图片处理规则：关闭图片提取时用占位符
		turndownService.addRule('image', {
			filter: 'img',
			replacement: (_content, node) => {
				const img = node as HTMLImageElement;
				const src = img.getAttribute('src') || '';
				const alt = img.getAttribute('alt') || '';
				if (!src && !alt) {
					return '[Image]';
				}
				if (!src) {
					return `[Image: ${alt}]`;
				}
				return `![${alt}](${src})`;
			},
		});

		const markdown = turndownService.turndown(html);

		const durationMs = Date.now() - startTime;

		return makeResult(markdown, attachments, {
			sourceFileName: fileName,
			format: 'docx',
			durationMs,
			imageCount,
			tableCount,
		});
	}
}

/** MIME 类型 → 文件扩展名 */
function mimeToExt(mime: string): string {
	const map: Record<string, string> = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/gif': 'gif',
		'image/bmp': 'bmp',
		'image/webp': 'webp',
		'image/svg+xml': 'svg',
		'image/tiff': 'tiff',
	};
	return map[mime] || 'png';
}
