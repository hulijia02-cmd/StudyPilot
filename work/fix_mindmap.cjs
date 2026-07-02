const fs = require("fs");
let mm = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");

// Remove goal from the component's destructuring AND type annotation
// Lines 480-488 lack \r at end, so use \n only
// Pattern: from "  isLoading,\n" through "})"
const oldSig = '  isLoading,\n  goal: _goal,\n  onClose,\n}: {\n  node: KnowledgeNode;\n  explanation: KnowledgeExplanation | null;\n  isLoading: boolean;\n  goal: string;\n  onClose: () => void;\n})';
const newSig = '  isLoading,\n  onClose,\n}: {\n  node: KnowledgeNode;\n  explanation: KnowledgeExplanation | null;\n  isLoading: boolean;\n  onClose: () => void;\n})';

if (mm.includes(oldSig)) {
  mm = mm.replace(oldSig, newSig);
  console.log("Removed goal from ExplanationPanel type/props");
} else {
  console.log("Pattern not found - checking what exists");
  const start = mm.indexOf("  isLoading,\n  goal:");
  if (start > 0) {
    console.log("Found near:", JSON.stringify(mm.substring(start, start + 120)));
  }
}

// Also add goal={goal} back to the CALLER (if it was removed)
// The caller should have goal={goal} between isLoading={expLoading} and onClose={closeExplanation}
const callerOld = '            isLoading={expLoading}\r\n            onClose={closeExplanation}';
const callerNew = '            isLoading={expLoading}\r\n            goal={goal}\r\n            onClose={closeExplanation}';

if (mm.includes(callerOld)) {
  mm = mm.replace(callerOld, callerNew);
  console.log("Added goal={goal} back to caller");
}

fs.writeFileSync("components/mindmap/mindmap-page.tsx", mm, "utf8");
