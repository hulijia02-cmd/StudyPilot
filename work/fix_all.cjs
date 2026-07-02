const fs = require("fs");

// === 1. practice-page.tsx: Remove unused imports, suppress unused vars ===
let p = fs.readFileSync("components/mobile-app/practice-page.tsx", "utf8");
p = p.replace(", HelpCircle", "");
p = p.replace("const [_mode, setMode]", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\nconst [_mode, setMode]");
p = p.replace("const [_showBlankAnswer, setShowBlankAnswer]", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\nconst [_showBlankAnswer, setShowBlankAnswer]");
p = p.replace("const _answered = submitState !== \"unanswered\";", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\nconst _answered = submitState !== \"unanswered\";");
fs.writeFileSync("components/mobile-app/practice-page.tsx", p, "utf8");
console.log("1. practice-page.tsx cleaned");

// === 2. material-page.tsx: Suppress unused vars ===
let m = fs.readFileSync("components/mobile-app/material-page.tsx", "utf8");
m = m.replace("const [_file, setFile] = useState<File | null>(null);", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\nconst [_file, setFile] = useState<File | null>(null);");
m = m.replace("const [_isParsing, setIsParsing] = useState(false);", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\nconst [_isParsing, setIsParsing] = useState(false);");
fs.writeFileSync("components/mobile-app/material-page.tsx", m, "utf8");
console.log("2. material-page.tsx cleaned");

// === 3. mindmap-page.tsx: Remove _goal from ExplanationPanel ===
let mm = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
// Remove _goal parameter from ExplanationPanel and its type annotation
mm = mm.replace(
  "  isLoading,\r\n  goal: _goal,\r\n  onClose,\r\n}: {\r\n  node: KnowledgeNode;\r\n  explanation: KnowledgeExplanation | null;\r\n  isLoading: boolean;\r\n  goal: string;\r\n  onClose: () => void;\r\n})",
  "  isLoading,\r\n  onClose,\r\n}: {\r\n  node: KnowledgeNode;\r\n  explanation: KnowledgeExplanation | null;\r\n  isLoading: boolean;\r\n  onClose: () => void;\r\n})"
);
// Remove goal={goal} from the caller
mm = mm.replace("            goal={goal}\r\n", "");
fs.writeFileSync("components/mindmap/mindmap-page.tsx", mm, "utf8");
console.log("3. mindmap-page.tsx cleaned");

// === 4. studypilot-mobile-app.tsx: Remove unused practice states ===
let s = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");
s = s.replace("  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);\r\n", "");
s = s.replace("  const [isPracticeLoading, setIsPracticeLoading] = useState(false);\r\n", "");
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", s, "utf8");
console.log("4. studypilot-mobile-app.tsx cleaned");

// === 5. Fix sanitizeError: Wire into catch blocks OR remove ===
// Since the build is clean, let me properly wire it
s = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");
// Replace catch blocks that use `message` with sanitizeError
s = s.replace(
  'const message = requestError instanceof Error ? requestError.message : "AI ????";',
  'const message = sanitizeError(requestError);'
);
s = s.replace(
  'const message = requestError instanceof Error ? requestError.message : "AI ??????";',
  'const message = sanitizeError(requestError);'
);
s = s.replace(
  'const message = requestError instanceof Error ? requestError.message : "?????? JSON ??";',
  'const message = sanitizeError(requestError);'
);
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", s, "utf8");
console.log("5. sanitizeError wired into catch blocks");

// === 6. knowledge-tree-page.tsx: Remove all U+FFFD ===
let k = fs.readFileSync("components/mobile-app/knowledge-tree-page.tsx", "utf8");
const ffdCount = (k.match(/\uFFFD/g) || []).length;
k = k.replace(/\uFFFD/g, "");
fs.writeFileSync("components/mobile-app/knowledge-tree-page.tsx", k, "utf8");
console.log("6. knowledge-tree: removed " + ffdCount + " U+FFFD characters");
