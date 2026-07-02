const fs = require("fs");
let txt = fs.readFileSync("components/mindmap/mindmap-page.tsx", "utf8");
// The file uses CRLF (\r\n)
txt = txt.replace(
  "  isLoading,\r\n  goal,\r\n  onClose,\r\n}: {",
  "  isLoading,\r\n  _goal,\r\n  onClose,\r\n}: {"
);
fs.writeFileSync("components/mindmap/mindmap-page.tsx", txt, "utf8");
const lines = txt.split("\n");
console.log("Line 481:", JSON.stringify(lines[480]));
