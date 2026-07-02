const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");

// Add postAI function at the end of file
const postAIFn = [
  "",
  "async function postAI<T>(url: string, body: Record<string, unknown>) {",
  '  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });',
  "  const rawText = await response.text();",
  '  let result: AIResponse<T> & { error?: string; detail?: string };',
  "  try { result = JSON.parse(rawText) as AIResponse<T> & { error?: string; detail?: string }; }",
  '  catch { throw new Error(rawText.slice(0, 160) || "\u63a5\u53e3\u6ca1\u6709\u8fd4\u56de JSON \u6570\u636e"); }',
  '  if (!response.ok) throw new Error(result.detail || result.error || "\u63a5\u53e3\u8bf7\u6c42\u5931\u8d25");',
  '  if (result.fallback || result.actualProvider === "mock") throw new Error(result.fallbackReason ? "AI \u5df2\u964d\u7ea7\uff1a" + result.fallbackReason : "AI \u5df2\u964d\u7ea7\u4e3a\u672c\u5730\u5185\u5bb9");',
  '  if (!result.data) throw new Error("AI \u6ca1\u6709\u8fd4\u56de\u6709\u6548\u5185\u5bb9");',
  "  return result;",
  "}",
  "",
].join("\r\n");

txt += postAIFn;
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", txt, "utf8");
console.log("postAI restored");
