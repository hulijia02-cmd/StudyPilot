const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");

// Find the orphan: "      continue;" and remove everything from there to "return roots.slice"
const orphanStart = txt.indexOf("      continue;");
const rootsStart = txt.indexOf("return roots.slice(0, 8)");
if (orphanStart < 0 || rootsStart < 0 || rootsStart <= orphanStart) {
  console.log("Cannot find orphan boundaries");
  process.exit(1);
}

// Go backwards from orphanStart to find the blank line before it
const blankBefore = txt.lastIndexOf("\r\n\r\n", orphanStart);
const cutStart = blankBefore > orphanStart - 50 ? blankBefore + 2 : orphanStart;

// Build the HQA completion block - the part that was removed
const hqaBlock = '    }\r\n' +
  '    setMessages((current) => [...current, { id: "quick-" + Date.now(), role: "user", content: label }]);\r\n' +
  '    if (label === "\\u751f\\u6210\\u7ec3\\u4e60\\u9898") {\r\n' +
  '      await askTeacher("\\u8bf7\\u5e2e\\u6211\\u51fa\\u51e0\\u9053\\u7ec3\\u4e60\\u9898\\uff0c\\u6211\\u4f1a\\u76f4\\u63a5\\u5728\\u5bf9\\u8bdd\\u6846\\u56de\\u7b54\\u3002");\r\n' +
  '      return;\r\n' +
  '    }\r\n' +
  '    if (label === "\\u751f\\u6210\\u601d\\u7ef4\\u5bfc\\u56fe") {\r\n' +
  '      setIsTeacherLoading(true);\r\n' +
  '      try {\r\n' +
  '        const result = await postAI<MindmapResponse>("/api/mindmap", { goal: program.goal });\r\n' +
  '        setProgram((current) => current ? { ...current, tree: parseMindmapToKnowledgeTree(result.data.markdown, current.goal) } : current);\r\n' +
  '        setMessages((current) => [...current, { id: "ai-mindmap-" + Date.now(), role: "ai", content: result.data.markdown }]);\r\n' +
  '        setAiStatus("AI: " + (result.actualProvider ?? "deepseek") + " / " + (result.actualModel ?? "deepseek-chat"));\r\n' +
  '      } catch (requestError) {\r\n' +
  '        const message = requestError instanceof Error ? requestError.message : "\\u601d\\u7ef4\\u5bfc\\u56fe\\u751f\\u6210\\u5931\\u8d25";\r\n' +
  '        setMessages((current) => [...current, { id: "ai-mindmap-error-" + Date.now(), role: "ai", content: message + "\\u3002\\u8bf7\\u7a0d\\u540e\\u91cd\\u8bd5\\u3002" }]);\r\n' +
  '        setAiStatus("AI: \\u601d\\u7ef4\\u5bfc\\u56fe\\u751f\\u6210\\u5931\\u8d25");\r\n' +
  '      } finally { setIsTeacherLoading(false); }\r\n' +
  '      return;\r\n' +
  '    }\r\n' +
  '    await askTeacher(label);\r\n' +
  '  }\r\n';

txt = txt.substring(0, cutStart) + hqaBlock + txt.substring(rootsStart);
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", txt, "utf8");
console.log("HQA fixed. New length:", txt.length);
