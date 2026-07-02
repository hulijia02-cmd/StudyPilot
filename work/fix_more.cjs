const fs = require("fs");
const buf = fs.readFileSync("components/mobile-app/knowledge-tree-page.tsx");

function replaceBytes(b, findHex, replHex) {
  const fb = Buffer.from(findHex, "hex"); const rb = Buffer.from(replHex, "hex");
  const idx = b.indexOf(fb);
  if (idx >= 0) {
    console.log("Found at " + idx + " -> replacing " + findHex + " with " + replHex);
    return Buffer.concat([b.subarray(0, idx), rb, b.subarray(idx + fb.length)]);
  }
  console.log("NOT found: " + findHex);
  return b;
}

let b = buf;

// 1. Fix line 384: "??" - corrupted to "???" (efbfbdefbfbdc4bf)
b = replaceBytes(b, "efbfbdefbfbdc4bf", "e9a1b9e79bae");

// 2. Fix line 386: "???" - my WRONG fix used ? instead of ?
// Current: e5b7b2e68e8ce6858c (???) + 3f (?) - need to fix
b = replaceBytes(b, "e5b7b2e68e8ce6858c3f", "e5b7b2e68e8ce68fa122");

// 3. Also fix "???" if corrupted
b = replaceBytes(b, "e5be85e5a48de4b9a0efbfbd3f", "e5be85e5a48de4b9a022");

fs.writeFileSync("components/mobile-app/knowledge-tree-page.tsx", b);
const txt = b.toString("utf8");
console.log("Remaining U+FFFD: " + (txt.match(/\uFFFD/g) || []).length);
const unterminated = txt.match(/label=\"[^\"]{0,20}$/gm);
if (unterminated) { 
  console.log("Unterminated labels: " + unterminated.length);
  unterminated.forEach(function(m) { console.log("  -> " + m); });
} else console.log("No unterminated labels!");
