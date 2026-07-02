const fs = require("fs");
let txt = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
// Both remove the goal prop from caller and remove _goal from component
// Remove goal={goal} prop from the ExplanationPanel call
txt = txt.replace("            goal={goal}\r\n", "");
// Add _goal back to ExplanationPanel props with proper syntax
// Find ExplanationPanel destructuring and add goal: string back to the type
txt = txt.replace(
  "  isLoading,\n  onClose,\n}: {\n  node: KnowledgeNode;\n  explanation: KnowledgeExplanation | null;\n  isLoading: boolean;\n  onClose: () => void;\n})",
  "  isLoading,\n  goal: _goal,\n  onClose,\n}: {\n  node: KnowledgeNode;\n  explanation: KnowledgeExplanation | null;\n  isLoading: boolean;\n  goal: string;\n  onClose: () => void;\n})"
);
fs.writeFileSync("components/mindmap/mindmap-page.tsx", txt, "utf8");
console.log("Fixed - added goal back, removed from caller");
