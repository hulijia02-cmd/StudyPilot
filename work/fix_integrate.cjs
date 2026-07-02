const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");

// 1. Add import for MaterialPage
txt = txt.replace(
  'import { PracticePage } from "@/components/mobile-app/practice-page";',
  'import { PracticePage } from "@/components/mobile-app/practice-page";\nimport { MaterialPage } from "@/components/mobile-app/material-page";'
);

// 2. Add material to title labels
txt = txt.replace(
  '      home: "??",',
  '      home: "??",\n      material: "??",'
);

// 3. Add material tab rendering (after home tab)
txt = txt.replace(
  '            {activeTab === "home" ? (<HomePage',
  '            {activeTab === "material" ? (<MaterialPage />) : null}\n            {activeTab === "home" ? (<HomePage'
);

fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", txt, "utf8");
// Verify
const lines = txt.split("\n");
const importLine = lines.findIndex(l => l.includes("MaterialPage"));
const labelLine = lines.findIndex(l => l.includes("material"));
const renderLine = lines.findIndex(l => l.includes("material\" ?"));
console.log("Import at line:", importLine + 1);
console.log("Label at line:", labelLine + 1, JSON.stringify(lines[labelLine]));
console.log("Render at line:", renderLine + 1, JSON.stringify(lines[renderLine].substring(0, 60)));
