/**
 * pdfjs-dist/legacy/build/pdf.worker.mjs 无官方类型声明
 * （pdfjs-dist 仅对 build/pdf.mjs 提供 pdf.d.mts）。
 * worker 模块在此项目中只用到 WorkerMessageHandler（作为 any 访问），
 * 故声明为 any 模块即可。
 */
declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs';
