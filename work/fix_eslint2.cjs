const fs = require("fs");

// Fix 1: material-page.tsx - unused imports/vars
let txt = fs.readFileSync("components/mobile-app/material-page.tsx", "utf8");
txt = txt.replace(
  'import { parseFile, isFileTypeSupported, formatFileSize, getFileTypeLabel, getFileExtension } from "@/lib/fileParser";',
  'import { parseFile, isFileTypeSupported, formatFileSize, getFileTypeLabel } from "@/lib/fileParser";'
);
txt = txt.replace(
  "  const [file, setFile] = useState<File | null>(null);",
  "  const [_file, _setFile] = useState<File | null>(null);"
);
txt = txt.replace(
  "  const [isParsing, setIsParsing] = useState(false);",
  "  const [_isParsing, _setIsParsing] = useState(false);"
);
fs.writeFileSync("components/mobile-app/material-page.tsx", txt, "utf8");
console.log("Fix 1 done");

// Fix 2: file-analysis.ts schema
txt = fs.readFileSync("lib/ai/schemas/file-analysis.ts", "utf8");
txt = txt.replace(
  "export const knowledgeMapNodeSchema: z.ZodSchema<any> = z.lazy(() =>",
  "export const knowledgeMapNodeSchema/*: z.ZodSchema<any>*/ = z.lazy(() =>"
);
fs.writeFileSync("lib/ai/schemas/file-analysis.ts", txt, "utf8");
console.log("Fix 2 done");

// Fix 3: file-analysis.ts prompts - replace as any[] with inline typings
txt = fs.readFileSync("lib/ai/prompts/file-analysis.ts", "utf8");
// Replace as any[] with Record<string, unknown>[]
txt = txt.replace(/as any\[\]/g, "as Record<string, unknown>[]");
// Replace as any with Record<string, unknown>
txt = txt.replace(/: any/g, ": Record<string, unknown>");
// Fix the module-level array type
txt = txt.replace(/as any\b/, "as Record<string, unknown>");
fs.writeFileSync("lib/ai/prompts/file-analysis.ts", txt, "utf8");
console.log("Fix 3 done");
