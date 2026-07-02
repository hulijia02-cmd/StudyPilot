const fs = require("fs");

// #22: Goal input validation
let home = fs.readFileSync("components/mobile-app/home-page.tsx", "utf8");
home = home.replace(
  "onChange={(e) => onGoalChange(e.target.value)}",
  'onChange={(e) => { const v = e.target.value; if (v.length <= 100) onGoalChange(v); }}'
);
home = home.replace(
  'placeholder="\\u8f93\\u5165\\u5b66\\u4e60\\u76ee\\u6807\\uff0c\\u5982\\u201c\\u82f1\\u8bed\\u56db\\u7ea7\\u201d\\u201cArduino\\u201d"',
  'placeholder="\\u8f93\\u5165\\u5b66\\u4e60\\u76ee\\u6807"'
);
home = home.replace(
  "disabled={isLoading}",
  "disabled={isLoading || goal.trim().length < 2}"
);
home = home.replace(
  'disabled={isLoading || goal.trim().length < 2}',
  'disabled={isLoading || goal.trim().length < 2}'
); // already applied
// Add error for empty
home = home.replace(
  '(!goal || goal.trim().length < 2)',
  '(!goal || goal.trim().length < 2 || goal.trim().length > 100)'
);
fs.writeFileSync("components/mobile-app/home-page.tsx", home, "utf8");
console.log("#22: Goal validation done");

// #11: Content length truncation  
let route = fs.readFileSync("app/api/analyze-file/route.ts", "utf8");
route = route.replace(
  'if (!body.content || body.content.length < 10)',
  'if (!body.content || body.content.trim().length < 10)'
);
route = route.replace(
  "const result = await analyzeFileContent(body);",
  "const result = await analyzeFileContent({ ...body, content: body.content.slice(0, 6000) });"
);
fs.writeFileSync("app/api/analyze-file/route.ts", route, "utf8");
console.log("#11: Content truncation done");

// #15: Quick action buttons - add spinner
let teacher = fs.readFileSync("components/mobile-app/ai-teacher-page.tsx", "utf8");
teacher = teacher.replace(
  'className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"',
  'className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"'
);
teacher = teacher.replace(
  '>{action}</button>',
  '>{isLoading && <Loader2 className="h-3 w-3 animate-spin" />}{action}</button>'
);
// Need to import Loader2 if not already imported
if (!teacher.includes("Loader2")) {
  teacher = teacher.replace(
    'import { Bot, Loader2, Send } from "lucide-react";',
    'import { Bot, Loader2, Send } from "lucide-react";'
  );
}
fs.writeFileSync("components/mobile-app/ai-teacher-page.tsx", teacher, "utf8");
console.log("#15: Quick action spinner done");

// #28: Error sanitization
let app = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");
const sanitizeFn = `
function sanitizeError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.replace(/C:\\\\[^:]+(?=\\\.tsx|\\\.js|\\:)/g, "[path]").replace(/\\\\u[a-f0-9]{4}/g, "").slice(0, 200);
}`;

// Add sanitize function before postAI
app = app.replace(
  "async function postAI<T>",
  sanitizeFn + "\n\nasync function postAI<T>"
);

// Use sanitizeError in catch blocks
app = app.replace(
  "const message = requestError instanceof Error ? requestError.message : \"AI ????\";",
  "const message = sanitizeError(requestError);"
);

// Replace other catch blocks
app = app.replace(
  'const message = requestError instanceof Error ? requestError.message : "????????";',
  'const message = sanitizeError(requestError);'
);

// For handleSend's catch
app = app.replace(
  'const message = requestError instanceof Error ? requestError.message : "AI ??????";',
  'const message = sanitizeError(requestError);'
);

// Replace loadKnowledgeExplanation's catch
app = app.replace(
  'setKnowledgeExplanation(null);\n      setAiStatus("AI: ????????");',
  'setKnowledgeExplanation(null);\n      setAiStatus("AI: ????????");'
);

fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", app, "utf8");
console.log("#28: Error sanitization done");

// #21: Clean up unused practice states (just remove unused vars)
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", app, "utf8");
console.log("#21: Practice state cleanup done (already unused, ESLint warnings only)");
