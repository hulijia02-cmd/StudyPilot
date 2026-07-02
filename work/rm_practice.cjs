const fs = require("fs");
let txt = fs.readFileSync("components/mobile-app/studypilot-mobile-app.tsx", "utf8");

// 1. Remove PracticePage import
txt = txt.replace('import { PracticePage } from "@/components/mobile-app/practice-page";\n', "");

// 2. Remove PracticeQuestion from type import
txt = txt.replace("import type { KnowledgeExplanation, PracticeQuestion }", "import type { KnowledgeExplanation }");

// 3. Remove practiceQuestions state
txt = txt.replace("  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);\n", "");

// 4. Remove isPracticeLoading state
txt = txt.replace("  const [isPracticeLoading, setIsPracticeLoading] = useState(false);\n", "");

// 5. Remove practiceQuestions from loadMobileState
txt = txt.replace("    if (saved.practiceQuestions?.length) setPracticeQuestions(saved.practiceQuestions as PracticeQuestion[]);\n", "");

// 6. Remove practiceQuestions from scheduleSave deps
txt = txt.replace("    practiceQuestions,\n", "");

// 7. Remove practiceQuestions from useMemo deps array
txt = txt.replace("    goalInput, activeTab, program, messages, practiceQuestions,\n", "    goalInput, activeTab, program, messages,\n");

// 8. Remove "practice" from title labels
txt = txt.replace("      practice: \"\\u7ec3\\u4e60\",\n", "");

// 9. Remove setPracticeQuestions([]) from handleStartLearning
txt = txt.replace("    setPracticeQuestions([]);\n", "");

// 10. Change handleQuickAction for "?????" - just send to chat instead
// Change the quick action handler to ask AI teacher to generate questions in chat
txt = txt.replace(
  "    if (label === \"\\u751f\\u6210\\u7ec3\\u4e60\\u9898\") {\n      await generatePracticeQuestions();\n      setActiveTab(\"practice\");\n      return;\n    }",
  '    if (label === "\\\\u751f\\\\u6210\\\\u7ec3\\\\u4e60\\\\u9898") { await askTeacher("?????????????????????"); return; }'
);

// 11. Remove generatePracticeQuestions function
const genFnStart = txt.indexOf("  async function generatePracticeQuestions()");
const genFnEnd = txt.indexOf("  }", txt.indexOf("  }", genFnStart) + 1) + 2;
if (genFnStart > 0) {
  const genFn = txt.substring(genFnStart, genFnEnd);
  txt = txt.replace(genFn + "\n", "");
}

// 12. Remove practice page rendering
txt = txt.replace("            {activeTab === \"practice\" ? (<PracticePage goal={program?.goal} isLoading={isPracticeLoading} onGeneratePractice={generatePracticeQuestions} onGoHome={() => setActiveTab(\"home\")} questions={practiceQuestions} selectedNode={selectedNode} />) : null}\n", "");

// 13. Remove isPracticeLoading from handleQuickAction guard
txt = txt.replace("    if (!program || isTeacherLoading || isPracticeLoading) {", "    if (!program || isTeacherLoading) {");

fs.writeFileSync("components/mobile-app/studypilot-mobile-app.tsx", txt, "utf8");
console.log("Practice tab removed");
