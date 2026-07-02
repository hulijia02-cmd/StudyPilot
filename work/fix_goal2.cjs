const fs = require("fs");
let txt = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
// Replace _goal with goal: _goal in the destructuring (aliased rename)
txt = txt.replace(
  "  isLoading,\r\n  _goal,\r\n  onClose,\r\n}: {",
  "  isLoading,\r\n  goal: _goal,\r\n  onClose,\r\n}: {"
);
fs.writeFileSync("components/mindmap/mindmap-page.tsx", txt, "utf8");
const lines = txt.split("\n");
console.log("Line 481:", JSON.stringify(lines[480]));
