const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");
// The labels section uses literal \uXXXX sequences. We need to insert the line:
//       material: "\u8d44\u6599",
// In JavaScript, this string literal has: backslash, u, 8, d, 4, 4, backslash, u, 6, 5, 9, 9
// We write it by escaping backslashes in the source code: "\\u8d44\\u6599"
const searchStr = '      home: "' + String.fromCharCode(92) + 'u9996' + String.fromCharCode(92) + 'u9875",';
const insertStr = '      material: "' + String.fromCharCode(92) + 'u8d44' + String.fromCharCode(92) + 'u6599",';
txt = txt.replace(searchStr, searchStr + '\n' + insertStr);
fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", txt, "utf8");
console.log("Done");
