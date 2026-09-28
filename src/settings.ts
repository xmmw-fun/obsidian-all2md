import { App, PluginSettingTab, Setting } from 'obsidian';
import type All2MDPlugin from './main';
import type { All2MDSettings } from './types';

/**
 * All2MD 设置面板
 * 提供输出方式、路径策略、附件目录、图片提取开关等配置项
 */
export class All2MDSettingsTab extends PluginSettingTab {
	private plugin: All2MDPlugin;

	constructor(app: App, plugin: All2MDPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ── 输出方式 ──
		new Setting(containerEl).setName('输出方式').setHeading();

		new Setting(containerEl)
			.setName('输出方式')
			.setDesc('选择转换结果的处理方式')
			.addDropdown(dropdown => {
				dropdown
					.addOption('insert-cursor', '插入到当前光标处')
					.addOption('create-file', '生成新的 .md 文件')
					.setValue(this.plugin.settings.outputMode)
					.onChange(async (value) => {
						this.plugin.settings.outputMode = value as All2MDSettings['outputMode'];
						await this.plugin.saveSettings();
						// 刷新面板以显示/隐藏相关选项
						this.display();
					});
			});

		// ── 新文件路径（仅在「生成新文件」模式下显示）──
		if (this.plugin.settings.outputMode === 'create-file') {
			new Setting(containerEl).setName('新文件').setHeading();

			new Setting(containerEl)
				.setName('Markdown 保存位置')
				.setDesc('选择新生成的 .md 文件保存到哪里（与附件存储位置相互独立，互不影响）')
				.addDropdown(dropdown => {
					dropdown
						.addOption('source-sibling', '源文件所在目录')
						.addOption('custom', '指定目录')
						.setValue(this.plugin.settings.filePathStrategy)
						.onChange(async (value) => {
							this.plugin.settings.filePathStrategy = value as All2MDSettings['filePathStrategy'];
							await this.plugin.saveSettings();
							// 刷新面板以显示/隐藏「输出目录」输入框
							this.display();
						});
				});

			// 指定输出目录（仅在「指定目录」模式下显示；空 = vault 根目录）
			if (this.plugin.settings.filePathStrategy === 'custom') {
				new Setting(containerEl)
					.setName('Markdown 输出目录')
					.setDesc('新 .md 文件保存到此目录（相对于 vault 根，留空 = vault 根目录）')
					.addText(text => {
						text
							.setPlaceholder('留空 = vault 根目录')
							.setValue(this.plugin.settings.mdOutputFolder)
							.onChange(async (value) => {
								this.plugin.settings.mdOutputFolder = value.trim();
								await this.plugin.saveSettings();
							});
					});
			}

			new Setting(containerEl)
				.setName('文件命名模板')
				.setDesc('{name} 会被替换为源文件名（不含扩展名）。例如：{name}.md')
				.addText(text => {
					text
						.setPlaceholder('{name}.md')
						.setValue(this.plugin.settings.fileNamingTemplate)
						.onChange(async (value) => {
							this.plugin.settings.fileNamingTemplate = value || '{name}.md';
							await this.plugin.saveSettings();
						});
				});
		}

		// ── 附件设置 ──
		new Setting(containerEl).setName('附件').setHeading();

		new Setting(containerEl)
			.setName('附件存储模式')
			.setDesc('与上方的「Markdown 保存位置」相互独立。global：所有附件保存到下方指定的全局附件目录。relative：附件保存在新生成的 .md 同目录下的「附件」文件夹中。')
			.addDropdown(dropdown => {
				dropdown
					.addOption('global', '全局附件目录')
					.addOption('relative', '新 md 同目录下的 /附件')
					.setValue(this.plugin.settings.attachmentPathMode)
					.onChange(async (value) => {
						this.plugin.settings.attachmentPathMode = value as All2MDSettings['attachmentPathMode'];
						await this.plugin.saveSettings();
						this.display();
					});
			});

		// 全局附件目录（仅在 global 模式下显示）
		if (this.plugin.settings.attachmentPathMode === 'global') {
			new Setting(containerEl)
				.setName('附件目录')
				.setDesc('提取的图片等资源将保存到此目录（相对于 vault 根）')
				.addText(text => {
					text
						.setPlaceholder('assets/all2md')
						.setValue(this.plugin.settings.attachmentFolder)
						.onChange(async (value) => {
							this.plugin.settings.attachmentFolder = value || 'assets/all2md';
							await this.plugin.saveSettings();
						});
				});
		}

		// ── 图片提取开关 ──
		new Setting(containerEl).setName('图片提取').setHeading();

		new Setting(containerEl)
			.setName('提取源文件中的图片')
			.setDesc('开启后会自动提取文档中的图片到附件目录。关闭后图片位置会用 [Image] 占位符替代，转换速度更快。')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.extractImages)
					.onChange(async (value) => {
						this.plugin.settings.extractImages = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
