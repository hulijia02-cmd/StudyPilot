const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/practice-page.tsx", "utf8");

// Update generateOptions function
const oldOptFunc = `function generateOptions(question: string, answer: string, type: string): string[] {
  if (type === "true_false") return ["??", "??"];
  if (type === "multi_choice") return [
    answer.length > 4 ? answer.slice(0, Math.floor(answer.length / 2)) + "??A" : "??A?" + answer,
    "??B??" + (answer.slice(0, 4) || "????") + "??",
    "??C????????",
    "??D??????",
  ];
  const distractors = [
    "???????????",
    "??????????",
    "?????????",
    "???????????",
    "?????????",
    "?????????",
    "?????????",
    "????????",
  ].sort(() => Math.random() - 0.5).slice(0, 3);
  const all = [answer, ...distractors];
  return all.sort(() => Math.random() - 0.5);
}`;

const newOptFunc = `function generateOptions(question: string, answer: string, type: string): string[] {
  if (type === "true_false") return ["??", "??"];
  if (answer) {
    const uniqueOpts = new Set<string>();
    uniqueOpts.add(answer);
    const fallbacks = ["????", "????", "????", "????"];
    for (const fb of fallbacks) {
      if (uniqueOpts.size >= 4) break;
      if (fb !== answer) uniqueOpts.add(fb);
    }
    const arr = Array.from(uniqueOpts);
    return arr.sort(() => Math.random() - 0.5);
  }
  return ["????", "????", "????", "????"].sort(() => Math.random() - 0.5);
}`;

if (txt.includes(oldOptFunc)) {
  txt = txt.replace(oldOptFunc, newOptFunc);
  fs.writeFileSync("components/mobile-app/practice-page.tsx", txt, "utf8");
  console.log("generateOptions fixed");
} else {
  console.log("Old generateOptions NOT FOUND");
  // Debug: show what's between generateOptions and getWrongAnswersKey
  const start = txt.indexOf("function generateOptions");
  const end = txt.indexOf("function getWrongAnswersKey");
  console.log("Found function at", start, "to", end);
  console.log(txt.substring(start, Math.min(txt.length, start + 400)));
}
