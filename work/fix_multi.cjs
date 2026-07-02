const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/practice-page.tsx", "utf8");
txt = txt.replace(/q\.type === "multi_choice"/g, 'q.type === "multi_choice" as string');
txt = txt.replace(/currentQ\.type === "multi_choice"/g, 'currentQ.type === "multi_choice" as string');
fs.writeFileSync("components/mobile-app/practice-page.tsx", txt, "utf8");
console.log("Fixed");
