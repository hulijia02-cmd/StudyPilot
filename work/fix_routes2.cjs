const fs = require("fs");

function removeFallbackBlock(txt) {
  const idx = txt.indexOf("if (result.fallback)");
  if (idx < 0) return txt;
  const braceIdx = txt.indexOf("{", idx);
  if (braceIdx < 0) return txt;
  let depth = 1;
  let i = braceIdx + 1;
  while (i < txt.length && depth > 0) {
    if (txt[i] === "{") depth++;
    if (txt[i] === "}") depth--;
    i++;
  }
  // Remove the newline before if and everything up to the matching }
  const lineStart = txt.lastIndexOf("\n", idx);
  const cutStart = lineStart >= 0 ? lineStart : 0;
  return txt.substring(0, cutStart) + txt.substring(i);
}

["app/api/mindmap/route.ts", "app/api/chat/route.ts", "app/api/ai/knowledge/route.ts"].forEach(f => {
  const old = fs.readFileSync(f, "utf8");
  const fixed = removeFallbackBlock(old);
  if (fixed !== old) {
    fs.writeFileSync(f, fixed, "utf8");
    console.log(f + ": fixed");
  } else {
    console.log(f + ": NOT FOUND");
  }
});
