const fs = require("fs");

function removeFallbackRejection(txt) {
  // Remove the if (result.fallback) { .. } block
  return txt.replace(/    if \(result\.fallback\) \{\n[\s\S]*?\n    \}/, "");
}

// Fix generate-plan route
let gp = fs.readFileSync("app/api/generate-plan/route.ts", "utf8");
const gpOld = gp;
gp = removeFallbackRejection(gp);
if (gp !== gpOld) {
  fs.writeFileSync("app/api/generate-plan/route.ts", gp, "utf8");
  console.log("Fixed generate-plan route");
} else {
  console.log("generate-plan: pattern not found");
}

// Fix mindmap route
let mmRt = fs.readFileSync("app/api/mindmap/route.ts", "utf8");
const mmOld = mmRt;
mmRt = removeFallbackRejection(mmRt);
if (mmRt !== mmOld) {
  fs.writeFileSync("app/api/mindmap/route.ts", mmRt, "utf8");
  console.log("Fixed mindmap route");
} else {
  console.log("mindmap: pattern not found");
}

// Fix chat route
let chat = fs.readFileSync("app/api/chat/route.ts", "utf8");
const chatOld = chat;
chat = removeFallbackRejection(chat);
if (chat !== chatOld) {
  fs.writeFileSync("app/api/chat/route.ts", chat, "utf8");
  console.log("Fixed chat route");
} else {
  console.log("chat: pattern not found");
}

// Fix ai/knowledge route
let ak = fs.readFileSync("app/api/ai/knowledge/route.ts", "utf8");
const akOld = ak;
ak = removeFallbackRejection(ak);
if (ak !== akOld) {
  fs.writeFileSync("app/api/ai/knowledge/route.ts", ak, "utf8");
  console.log("Fixed ai/knowledge route");
} else {
  console.log("ai/knowledge: pattern not found");
}
