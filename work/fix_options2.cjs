const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/practice-page.tsx", "utf8");

// Find the generateOptions function and replace it
const funcStart = txt.indexOf("function generateOptions(");
const funcEnd = txt.indexOf("function getWrongAnswersKey");
if (funcStart >= 0 && funcEnd > funcStart) {
  console.log("Found at", funcStart, "to", funcEnd);
  const before = txt.substring(0, funcStart);
  const after = txt.substring(funcEnd);
  const newFunc = `function generateOptions(question: string, answer: string, type: string): string[] {
   if (type === "true_false") return ["??", "??"];
   if (answer) {
     const opts = new Set<string>();
     opts.add(answer);
     for (const fb of ["????", "????", "????", "????"]) {
       if (opts.size >= 4) break;
       if (fb !== answer) opts.add(fb);
     }
     return Array.from(opts).sort(() => Math.random() - 0.5);
   }
   return ["????", "????", "????", "????"].sort(() => Math.random() - 0.5);
 }
`;
  txt = before + newFunc + after;
  fs.writeFileSync("components/mobile-app/practice-page.tsx", txt, "utf8");
  console.log("generateOptions replaced");
} else {
  console.log("Function not found");
}
