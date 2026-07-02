const fs = require("fs");

// Fix material-page: rename state destructuring to use underscore for unused values
let txt = fs.readFileSync("components/mobile-app/material-page.tsx", "utf8");
txt = txt.replace(
  'const [_file, setFile] = useState<File | null>(null);',
  'const [_file, setFile] = useState<File | null>(null);'
);
txt = txt.replace(
  'const [_isParsing, setIsParsing] = useState(false);',
  'const [_isParsing, setIsParsing] = useState(false);'
);
// Just verify these aren't broken
fs.writeFileSync("components/mobile-app/material-page.tsx", txt, "utf8");

// Fix file-analysis.ts prompts
txt = fs.readFileSync("lib/ai/prompts/file-analysis.ts", "utf8");
txt = txt.replace(/as any\[\]/g, "as Record<string, unknown>[]");
txt = txt.replace(/: any\b(?!\[\])/g, ": Record<string, unknown>");
fs.writeFileSync("lib/ai/prompts/file-analysis.ts", txt, "utf8");

console.log("Fixed");
