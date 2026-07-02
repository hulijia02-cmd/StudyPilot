const fs = require("fs");

// Fix 1: mindmap/page.tsx - <a> to <Link>
let txt = fs.readFileSync("app/mindmap/page.tsx", "utf8");
if (txt.includes("import Link")) {
  console.log("Already has Link import");
} else {
  txt = txt.replace('import type { Metadata } from "next";', 'import Link from "next/link";\nimport type { Metadata } from "next";');
}
txt = txt.replace('<a\n          href="/"', '<Link\n          href="/"');
txt = txt.replace('</a>', '</Link>');
txt = txt.replace('</a>', '</Link>'); // second time in case
fs.writeFileSync("app/mindmap/page.tsx", txt, "utf8");
console.log("Fix 1 done: <a> -> <Link>");

// Fix 2: mindmap-page.tsx - fix any[] type and unused goal
txt = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
txt = txt.replace("useState<any[]>([]);", "useState<Array<{id: string; type: string; typeLabel: string; question: string; answer: string; explanation: string; showAnswer: boolean}>>([]);");
txt = txt.replace("  goal,\n", "  _goal,\n");
fs.writeFileSync("components/mindmap/mindmap-page.tsx", txt, "utf8");
console.log("Fix 2 done: any[] -> typed array, goal -> _goal");
