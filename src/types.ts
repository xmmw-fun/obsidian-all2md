/**
 * All2MD 类型定义
 * 所有数据类型、接口和常量集中管理
 */

/** 支持的转换格式 */
export type SupportedFormat = 'docx' | 'pptx' | 'pdf';

/** 支持的格式扩展名列表 */
export const SUPPORTED_EXTENSIONS: Record<SupportedFormat, string[]> = {
	docx: ['docx'],
	pptx: ['pptx'],
	pdf: ['pdf'],
};

/** 所有支持的文件扩展名（扁平化，用于文件选择器过滤） */
export const ALL_SUPPORTED_EXTENSIONS: string[] = Object.values(SUPPORTED_EXTENSIONS).flat();

/** 转换结果 */
export interface ConvertResult {
	/** Markdown 文本内容 */
	markdown: string;
	/** 提取的附件（图片等），key = 文件名, value = ArrayBuffer */
	attachments: Map<string, ArrayBuffer>;
	/** 元信息 */
	meta: ConvertMeta;
}

/** 转换元信息 */
export interface ConvertMeta {
	/** 源文件名 */
	sourceFileName: string;
	/** 源文件格式 */
	format: SupportedFormat;
	/** 转换耗时（毫秒） */
	durationMs: number;
	/** 页数/幻灯片数（pdf/pptx 适用） */
	pageCount?: number;
	/** 提取的图片数量 */
	imageCount?: number;
	/** 提取的表格数量 */
	tableCount?: number;
}

/** 输出方式 */
export type OutputMode = 'insert-cursor' | 'create-file';

/**
 * 新文件路径策略（.md 输出位置）
 * - source-sibling：源文件所在目录
 * - custom：自定义目录（见 mdOutputFolder）
 * ⚠️ 2026-08-13 拆分：旧的 'default' 与附件目录混为一谈，已废弃，
 * 迁移时自动转为 'custom' + mdOutputFolder = 原 attachmentFolder
 */
export type FilePathStrategy = 'source-sibling' | 'custom';

/** 附件路径模式 */
export type AttachmentPathMode = 'global' | 'relative';

/** 插件设置 */
export interface All2MDSettings {
	/** 输出方式 */
	outputMode: OutputMode;
	/** 生成新文件时的路径策略（.md 输出位置） */
	filePathStrategy: FilePathStrategy;
	/** .md 输出目录（相对于 vault 根，filePathStrategy=custom 时生效；空 = vault 根目录） */
	mdOutputFolder: string;
	/** 附件路径模式：global = 全局附件目录, relative = 输出 md 同目录下的 /附件 */
	attachmentPathMode: AttachmentPathMode;
	/** 全局附件目录（相对于 vault 根，attachmentPathMode=global 时生效） */
	attachmentFolder: string;
	/** 新文件命名模板，{name} = 源文件名（不含扩展名） */
	fileNamingTemplate: string;
	/** 是否提取源文件中的图片 */
	extractImages: boolean;
}

/** 默认设置 */
export const DEFAULT_SETTINGS: All2MDSettings = {
	outputMode: 'insert-cursor',
	filePathStrategy: 'custom',
	mdOutputFolder: '',
	attachmentPathMode: 'global',
	attachmentFolder: 'assets/all2md',
	fileNamingTemplate: '{name}.md',
	extractImages: true,
};

/** 转换器接口 */
export interface Converter {
	/** 转换器名称 */
	readonly name: string;
	/** 支持的文件格式 */
	readonly format: SupportedFormat;
	/**
	 * 执行转换
	 * @param fileData 文件二进制数据
	 * @param fileName 文件名（含扩展名）
	 * @param options 转换选项
	 */
	convert(fileData: ArrayBuffer, fileName: string, options: ConvertOptions): Promise<ConvertResult>;
}

/** 转换选项 */
export interface ConvertOptions {
	/** 是否提取图片 */
	extractImages: boolean;
	/** vault 附件目录（相对于 vault 根），用于生成附件引用路径 */
	attachmentFolder: string;
	/**
	 * 附件命名前缀（= 最终 MD 文件基名，如 A.md → A_image_1.png）
	 * 2026-08-24 调整：附件名与转出的 md 文件名相匹配
	 */
	attachmentNamePrefix: string;
}
