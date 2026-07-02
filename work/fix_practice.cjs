const fs = require("fs");
const txt = fs.readFileSync("components/mobile-app/practice-page.tsx", "utf8");
const directive = '"use client";';
const firstIdx = txt.indexOf(directive);
const secondIdx = txt.indexOf(directive, firstIdx + 1);
console.log("First at: " + firstIdx + ", Second at: " + secondIdx);
if (secondIdx > 0) {
  // Find the line containing the second directive
  const beforeSecond = txt.substring(0, secondIdx);
  const lineStart = beforeSecond.lastIndexOf("\n") + 1;
  const newContent = txt.substring(lineStart);
  fs.writeFileSync("components/mobile-app/practice-page.tsx", newContent, "utf8");
  console.log("Trimmed. New length: " + newContent.length);
}
