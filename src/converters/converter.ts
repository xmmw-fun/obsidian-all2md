/**
 * 转换器基类
 * 提供通用工具方法，各格式转换器继承或实现 Converter 接口
 */

import type { Converter, SupportedFormat, ConvertResult, ConvertMeta } from '../types';

/**
 * 根据文件扩展名判断支持的格式
 */
export function detectFormat(fileName: string): SupportedFormat | null {
	const ext = fileName.toLowerCase().split('.').pop() || '';
	switch (ext) {
		case 'docx': return 'docx';
		case 'pptx': return 'pptx';
		case 'pdf':  return 'pdf';
		default:     return null;
	}
}

/**
 * 辅助：创建转换结果对象
 */
export function makeResult(
	markdown: string,
	attachments: Map<string, ArrayBuffer>,
	meta: ConvertMeta
): ConvertResult {
	return { markdown, attachments, meta };
}

/**
 * 辅助：ArrayBuffer → base64 字符串
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

// 重新导出 Converter 接口类型（方便其他文件 import）
export type { Converter, SupportedFormat, ConvertResult, ConvertMeta };
