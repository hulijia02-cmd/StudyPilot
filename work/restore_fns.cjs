const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");

// Find where to insert the missing function - before "return roots.slice(0, 8)"
const rootsIdx = txt.indexOf("return roots.slice(0, 8)");
if (rootsIdx < 0) { console.log("Cannot find insertion point"); process.exit(1); }

// The PMT function body to insert
const pmtBody = `function parseMindmapToKnowledgeTree(markdown: string, goal: string): KnowledgeNode[] {
  const lines = markdown.split(/\\r?\\n/).map((l) => l.trim()).filter(Boolean);
  const roots: KnowledgeNode[] = [];
  let currentRoot: KnowledgeNode | null = null;
  let currentChild: KnowledgeNode | null = null;
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\\s+(.+)$/);
    const bullet = line.match(/^[-*]\\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = cleanNodeTitle(heading[2]);
      if (level === 1) continue;
      if (level <= 2) {
        currentRoot = createKnowledgeNode(title, goal, roots.length, "root");
        roots.push(currentRoot);
        currentChild = null;
      } else {
        if (!currentRoot) {
          currentRoot = createKnowledgeNode(goal, goal, roots.length, "root");
          roots.push(currentRoot);
        }
        currentChild = createKnowledgeNode(title, goal, currentRoot.children.length, "child");
        currentRoot.children.push(currentChild);
      }
      continue;
    }
    if (bullet) {
      const title = cleanNodeTitle(bullet[1]);
      if (!currentRoot) {
        currentRoot = createKnowledgeNode(goal, goal, roots.length, "root");
        roots.push(currentRoot);
      }
      if (!currentChild) {
        currentChild = createKnowledgeNode(title, goal, currentRoot.children.length, "child");
        currentRoot.children.push(currentChild);
      } else {
        currentChild.children.push(createKnowledgeNode(title, goal, currentChild.children.length, "leaf"));
      }
    }
  }
`;

txt = txt.substring(0, rootsIdx) + pmtBody + "\r\n" + txt.substring(rootsIdx);
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", txt, "utf8");
console.log("Restored PMT function");
