const fs = require("fs");

// 1. practice-page.tsx: Remove HelpCircle from import
let p = fs.readFileSync("components/mobile-app/practice-page.tsx", "utf8");
p = p.replace(", HelpCircle", "");
fs.writeFileSync("components/mobile-app/practice-page.tsx", p, "utf8");
console.log("1. Removed HelpCircle");

// 2. studypilot-mobile-app.tsx: Remove PracticeQuestion from import
let s = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");
s = s.replace("import type { KnowledgeExplanation, PracticeQuestion }", "import type { KnowledgeExplanation }");
// 3. Remove sanitizeError if unused, or add eslint-disable
s = s.replace("function sanitizeError(error: unknown): string {", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\nfunction sanitizeError(error: unknown): string {");
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", s, "utf8");
console.log("2-3. Fixed PracticeQuestion import and sanitizeError");
