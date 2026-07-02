const fs = require("fs");

// === 1. Fix knowledge tree colors - same color family ===
let mm = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
mm = mm.replace(
  'const depthColors = [\r\n  "border-sky-400 bg-sky-50 text-sky-800",\r\n  "border-emerald-400 bg-emerald-50 text-emerald-800",\r\n  "border-amber-400 bg-amber-50 text-amber-800",\r\n  "border-violet-400 bg-violet-50 text-violet-800",\r\n  "border-rose-400 bg-rose-50 text-rose-800",\r\n  "border-cyan-400 bg-cyan-50 text-cyan-800",\r\n  "border-indigo-400 bg-indigo-50 text-indigo-800",\r\n];',
  'const depthColors = [\r\n  "border-sky-500 bg-sky-100 text-sky-900",\r\n  "border-sky-400 bg-sky-50 text-sky-800",\r\n  "border-sky-300 bg-white text-sky-700",\r\n  "border-sky-200 bg-sky-50/80 text-sky-600",\r\n  "border-sky-200 bg-sky-50/60 text-sky-500",\r\n  "border-sky-200 bg-sky-50/40 text-sky-500",\r\n  "border-sky-200 bg-sky-50/40 text-sky-500",\r\n];'
);
fs.writeFileSync("components/mindmap/mindmap-page.tsx", mm, "utf8");
console.log("1. Knowledge tree colors fixed");

// === 2. Fix API routes - remove fallback rejection ===
const routes = [
  { file: "app/api/generate-plan/route.ts", pattern: '    if (result.fallback) {\r\n      return NextResponse.json(\r\n        {\r\n          error: "DeepSeek \\u8c03\\u7528\\u5931\\u8d25\\uff0c\\u5df2\\u963b\\u6b62\\u663e\\u793a\\u672c\\u5730 mock \\u5185\\u5bb9\\u3002",\r\n          fallbackReason: result.fallbackReason,\r\n          actualProvider: result.provider,\r\n          actualModel: result.model,\r\n        },\r\n        { status: 502 },\r\n      );\r\n    }\r\n' }
];
for (const r of routes) {
  let txt = fs.readFileSync(r.file, "utf8");
  if (txt.includes(r.pattern)) {
    txt = txt.replace(r.pattern, "");
    fs.writeFileSync(r.file, txt, "utf8");
    console.log("2. Fixed " + r.file);
  } else {
    console.log("2. Pattern not found in " + r.file);
  }
}

// === 3. Fix mindmap route ===
let mindmapRt = fs.readFileSync("app/api/mindmap/route.ts", "utf8");
const mmPattern = '  if (result.fallback) {\r\n    return NextResponse.json(\r\n      {\r\n        error: "AI provider fallback is disabled for StudyPilot pages.",\r\n        fallbackReason: result.fallbackReason,\r\n        actualProvider: result.provider,\r\n        actualModel: result.model,\r\n      },\r\n      { status: 502 },\r\n    );\r\n  }\r\n';
if (mindmapRt.includes(mmPattern)) {
  mindmapRt = mindmapRt.replace(mmPattern, "");
  fs.writeFileSync("app/api/mindmap/route.ts", mindmapRt, "utf8");
  console.log("3. Fixed mindmap route");
}

// === 4. Fix postAI with timeout and remove mock rejection ===
let app = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");
// Find postAI function and replace it
const postAiStart = app.indexOf("async function postAI<T>");
const postAiEnd = app.indexOf("}", app.indexOf("  return result;", postAiStart)) + 2;
if (postAiStart > 0) {
  const newPostAI = 
`async function postAI<T>(url: string, body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
  const rawText = await response.text();
  let result: AIResponse<T> & { error?: string; detail?: string };
  try {
    result = JSON.parse(rawText) as AIResponse<T> & { error?: string; detail?: string };
  } catch {
    throw new Error(rawText.slice(0, 160) || "\\u63a5\\u53e3\\u6ca1\\u6709\\u8fd4\\u56de JSON \\u6570\\u636e");
  }
  if (!response.ok && !result.data) throw new Error(result.detail || result.error || "\\u63a5\\u53e3\\u8bf7\\u6c42\\u5931\\u8d25");
  if (!result.data) throw new Error("AI \\u6ca1\\u6709\\u8fd4\\u56de\\u6709\\u6548\\u5185\\u5bb9");
  return result;
}`;
  app = app.substring(0, postAiStart) + newPostAI + app.substring(postAiEnd);
  fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", app, "utf8");
  console.log("4. postAI fixed with timeout and mock support");
}
