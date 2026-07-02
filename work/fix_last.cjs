const fs = require("fs");
let txt = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
// Remove _goal entirely from the destructuring and type
txt = txt.replace(
  "  isLoading,\r\n  goal: _goal,\r\n  onClose,\r\n}: {\r\n  node: KnowledgeNode;\r\n  explanation: KnowledgeExplanation | null;\r\n  isLoading: boolean;\r\n  goal: string;\r\n  onClose: () => void;\r\n})",
  "  isLoading,\r\n  onClose,\r\n}: {\r\n  node: KnowledgeNode;\r\n  explanation: KnowledgeExplanation | null;\r\n  isLoading: boolean;\r\n  onClose: () => void;\r\n})"
);
fs.writeFileSync("components/mindmap/mindmap-page.tsx", txt, "utf8");
console.log("Done");
