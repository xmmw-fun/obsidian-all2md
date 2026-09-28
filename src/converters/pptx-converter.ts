/**
 * PPTX 转换器
 * 技术路径：JSZip 解包 → 解析 slide XML → 提取文本/图片/表格 → Markdown
 * 
 * PPTX 本质是 ZIP 包，内部是 Open XML 格式。
 * - 文本：在 ppt/slides/slideN.xml 的 <a:p>（段落）> <a:r>（文本串）> <a:t>（文字）中
 * - 图片：在 ppt/media/ 目录，通过 slide 的 rels 文件映射 rId → 路径（异步提取）
 * - 表格：在 <a:tbl> 节点，按行/列解析为 MD 表格
 */

import JSZip from 'jszip';
import type { Converter, SupportedFormat, ConvertResult, ConvertOptions } from '../types';
import { makeResult } from './converter';

export class PptxConverter implements Converter {
	readonly name = 'PPTX Converter';
	readonly format: SupportedFormat = 'pptx';

	async convert(fileData: ArrayBuffer, fileName: string, options: ConvertOptions): Promise<ConvertResult> {
		const startTime = Date.now();
		const zip = await JSZip.loadAsync(fileData);
		const attachments = new Map<string, ArrayBuffer>();

		// 获取幻灯片文件列表
		const slideFiles = Object.keys(zip.files)
			.filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
			.sort((a, b) => {
				const na = parseInt(a.match(/slide(\d+)/i)?.[1] || '0');
				const nb = parseInt(b.match(/slide(\d+)/i)?.[1] || '0');
				return na - nb;
			});

		const slideCount = slideFiles.length;

		// ── 第一遍：收集所有幻灯片信息 ──
		interface SlideInfo {
			num: number;
			xml: string;
			/** rId → ppt/media/ 路径 */
			relsMap: Map<string, string>;
		}
		const slides: SlideInfo[] = [];

		for (let i = 0; i < slideFiles.length; i++) {
			const slidePath = slideFiles[i];
			const slideXml = await zip.files[slidePath].async('text');
			const slideNum = i + 1;

			let relsMap = new Map<string, string>();
			if (options.extractImages) {
				const relsPath = slidePath.replace(/\.xml$/i, '.xml.rels')
					.replace(/^ppt\/slides\//, 'ppt/slides/_rels/');
				const relsFile = zip.files[relsPath];
				if (relsFile) {
					const relsXml = await relsFile.async('text');
					relsMap = parseRels(relsXml);
				}
			}

			slides.push({ num: slideNum, xml: slideXml, relsMap });
		}

		// ── 第二遍：异步提取所有图片 ──
		// imageRefs: [slideNum, 全局计数器, 图片引用路径]
		const imageRefs: Array<{ slideNum: number; refPath: string }> = [];
		let globalImageCount = 0;

		if (options.extractImages) {
			for (const slide of slides) {
				const blipRegex = /<a:blip[^>]*?r:embed="(rId\d+)"[^>]*?\/>/gi;
				let blipMatch: RegExpExecArray | null;
				while ((blipMatch = blipRegex.exec(slide.xml)) !== null) {
					const rId = blipMatch[1];
					const mediaPath = slide.relsMap.get(rId);
					if (mediaPath && zip.files[mediaPath]) {
						globalImageCount++;
						const ext = mediaPath.split('.').pop() || 'png';
						// 附件命名与转出的 md 文件名匹配：A.md → A_image_1.png（全局序号跨页连续）
						const imgName = `${options.attachmentNamePrefix}_image_${globalImageCount}.${ext}`;

						// 从 zip 中提取图片数据
						const imgData = await zip.files[mediaPath].async('arraybuffer');
						attachments.set(imgName, imgData);

						imageRefs.push({
							slideNum: slide.num,
							refPath: `${options.attachmentFolder}/${imgName}`,
						});
					}
				}
			}
		}

		// ── 第三遍：生成 Markdown ──
		let imageRefIndex = 0;
		let tableCount = 0;
		let markdown = '';

		for (const slide of slides) {
			let slideMd = `\n## Slide ${slide.num}\n\n`;

			// 为当前幻灯片插入图片引用
			while (imageRefIndex < imageRefs.length && imageRefs[imageRefIndex].slideNum === slide.num) {
				const ref = imageRefs[imageRefIndex];
				if (options.extractImages) {
					slideMd += `![Slide ${slide.num} Image](${ref.refPath})\n\n`;
				} else {
					slideMd += `[Image]\n\n`;
				}
				imageRefIndex++;
			}

			// 提取表格
			const tableRegex = /<a:tbl>([\s\S]*?)<\/a:tbl>/g;
			let tblMatch: RegExpExecArray | null;
			while ((tblMatch = tableRegex.exec(slide.xml)) !== null) {
				tableCount++;
				slideMd += parseTable(tblMatch[1]) + '\n\n';
			}

			// 提取文本段落
			const paraRegex = /<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g;
			let paraMatch: RegExpExecArray | null;
			while ((paraMatch = paraRegex.exec(slide.xml)) !== null) {
				const paraText = extractParagraphText(paraMatch[1]);
				if (paraText.trim()) {
					slideMd += paraText + '\n\n';
				}
			}

			markdown += slideMd;
		}

		const durationMs = Date.now() - startTime;

		return makeResult(markdown, attachments, {
			sourceFileName: fileName,
			format: 'pptx',
			durationMs,
			pageCount: slideCount,
			imageCount: globalImageCount,
			tableCount,
		});
	}
}

/** 解析 .rels 文件，提取 rId → ZIP 内部路径映射（筛选图片类型） */
function parseRels(relsXml: string): Map<string, string> {
	const map = new Map<string, string>();
	const relRegex = /<Relationship\s[^>]*?Id="(rId\d+)"[^>]*?Type="[^"]*image[^"]*"[^>]*?Target="([^"]+)"/gi;
	let match: RegExpExecArray | null;
	while ((match = relRegex.exec(relsXml)) !== null) {
		// ⚠️ rels 文件的 Target 是相对于其所在目录 ppt/slides/ 的路径
		// （如 ../media/image1.png → 实际为 ppt/slides/../media/image1.png）
		// 必须用 ppt/slides/ 作基准拼接，否则 ../ 会把 ppt 误吞掉
		// （2026-08-08 实测：ppt/../media/ → 错误结果 media/，ZIP 真实 key 是 ppt/media/）
		map.set(match[1], normalizeZipPath(`ppt/slides/${match[2]}`));
	}
	return map;
}

/** 将含 ../ 的相对路径规范化为 ZIP 内部路径（如 ppt/../media/img.png → ppt/media/img.png） */
function normalizeZipPath(raw: string): string {
	const parts = raw.split('/');
	const result: string[] = [];
	for (const part of parts) {
		if (part === '..') {
			result.pop();
		} else if (part !== '.' && part !== '') {
			result.push(part);
		}
	}
	return result.join('/');
}

/** 从段落 XML 中提取文本（聚合所有 <a:t>） */
function extractParagraphText(paraXml: string): string {
	const tRegex = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g;
	const texts: string[] = [];
	let tMatch: RegExpExecArray | null;
	while ((tMatch = tRegex.exec(paraXml)) !== null) {
		texts.push(tMatch[1]);
	}
	return texts.join('');
}

/** 解析 PPTX 表格 <a:tbl> → Markdown 表格 */
function parseTable(tblXml: string): string {
	const rows: string[][] = [];
	const rowRegex = /<a:tr(?:\s[^>]*)?>([\s\S]*?)<\/a:tr>/g;
	let rowMatch: RegExpExecArray | null;
	while ((rowMatch = rowRegex.exec(tblXml)) !== null) {
		const cells: string[] = [];
		const cellRegex = /<a:tc(?:\s[^>]*)?>([\s\S]*?)<\/a:tc>/g;
		let cellMatch: RegExpExecArray | null;
		const rowContent = rowMatch[1];
		while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
			let cellText = '';
			const tRegex = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g;
			let tMatch: RegExpExecArray | null;
			const cellContent = cellMatch[1];
			while ((tMatch = tRegex.exec(cellContent)) !== null) {
				cellText += tMatch[1];
			}
			cells.push(cellText.trim());
		}
		if (cells.length > 0) {
			rows.push(cells);
		}
	}

	if (rows.length === 0) return '';

	const colCount = Math.max(...rows.map(r => r.length));
	for (const row of rows) {
		while (row.length < colCount) row.push('');
	}

	const mdRows: string[] = [];
	mdRows.push('| ' + rows[0].map(c => escapeTableCell(c)).join(' | ') + ' |');
	mdRows.push('| ' + rows[0].map(() => '---').join(' | ') + ' |');
	for (let i = 1; i < rows.length; i++) {
		mdRows.push('| ' + rows[i].map(c => escapeTableCell(c)).join(' | ') + ' |');
	}

	return mdRows.join('\n');
}

function escapeTableCell(text: string): string {
	return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
