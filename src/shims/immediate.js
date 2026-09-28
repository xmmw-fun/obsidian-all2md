// 替代 npm 包 `immediate`（jszip → lie 的依赖）。
// 原包包含 `document.createElement("script")` 特性检测代码，
// 会被 Obsidian 社区插件审查的静态扫描判为「运行时创建 script 元素」。
// 本 shim 用 Promise 微任务提供等价的「尽快异步执行」语义。
module.exports = function immediate(task) {
	Promise.resolve().then(task);
};
