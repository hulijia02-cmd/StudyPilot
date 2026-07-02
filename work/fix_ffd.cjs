const fs = require("fs");
const buf = fs.readFileSync("components/mobile-app/knowledge-tree-page.tsx");
function replaceBytes(b, findHex, replHex) {
  const fb = Buffer.from(findHex, "hex"); const rb = Buffer.from(replHex, "hex");
  const idx = b.indexOf(fb);
  if (idx >= 0) {
    console.log("Found " + findHex + " at " + idx);
    return Buffer.concat([b.subarray(0, idx), rb, b.subarray(idx + fb.length)]);
  }
  console.log("NOT found: " + findHex);
  return b;
}
let b = buf;
b = replaceBytes(b, "e69893e99499efbfbd3f", "e69893e99499e782b922");
b = replaceBytes(b, "e5b7b2e68e8cefbfbd", "e5b7b2e68e8ce6858c");
b = replaceBytes(b, "e79fa5e8af86e782b9efbfbd", "e79fa5e8af86e782b9");
b = replaceBytes(b, "e9a1b9e79baeefbfbd", "e9a1b9e79bae");
fs.writeFileSync("components/mobile-app/knowledge-tree-page.tsx", b);
const txt = b.toString("utf8");
console.log("Remaining U+FFFD: " + (txt.match(/\uFFFD/g) || []).length);
const unterminated = txt.match(/label=\"[^\"]{0,20}$/gm);
if (unterminated) console.log("Unterminated labels: " + unterminated.length);
else console.log("No unterminated labels!");
