 "use client";
 
 import { useCallback, useEffect, useMemo, useRef, useState } from "react";
 import {
   AlertCircle, ArrowLeft, ArrowRight, BarChart3, BookOpen,
   Check, CheckCircle2, ChevronRight, Clock, FileText,
   Lightbulb, Loader2, RefreshCcw, RotateCcw, Shuffle,
   Sparkles,  X, Zap,
 } from "lucide-react";
 import type { PracticeQuestion } from "@/lib/aiClient";
 import type { KnowledgeNode } from "@/lib/mockLearningData";
 
 type PracticePageProps = {
   goal?: string;
   isLoading: boolean;
   questions: PracticeQuestion[];
   selectedNode?: KnowledgeNode | null;
   onGeneratePractice: () => void;
   onGoHome: () => void;
 };
 
 type PracticeMode = "sequential" | "random" | "ai-group" | "wrong-review" | "chapter";
 type PageState = "mode-select" | "answering" | "results";
 type SubmitState = "unanswered" | "answered" | "submitted";
 
 interface EnhancedQuestion extends PracticeQuestion {
   _options?: string[];
   _knowledgePoint?: string;
 }
 
 interface AnswerRecord {
   questionId: string;
   selected: string | string[];
   isCorrect: boolean;
   timeSpent: number;
 }
 
 const MODES: { id: PracticeMode; label: string; icon: typeof FileText; desc: string }[] = [
   { id: "sequential", label: "顺序练习", icon: FileText, desc: "按当前顺序逐题练习" },
   { id: "random", label: "随机练习", icon: Shuffle, desc: "随机打乱题目顺序" },
   { id: "ai-group", label: "AI智能组卷", icon: Sparkles, desc: "根据你的薄弱点智能选题" },
   { id: "wrong-review", label: "错题重练", icon: RotateCcw, desc: "复习做错的题目" },
   { id: "chapter", label: "章节练习", icon: BookOpen, desc: "按学习模块分章练习" },
 ];
 
 const QUESTION_TYPE_LABELS: Record<string, string> = {
   choice: "单选题", multi_choice: "多选题", true_false: "判断题", blank: "填空题", short_answer: "简答题", project: "项目题",
 };
 
 function generateOptions(question: string, answer: string, type: string): string[] {
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
function getWrongAnswersKey(): string {
   return "studypilot_wrong_answers";
 }
 
 function loadWrongAnswers(): AnswerRecord[] {
   try {
     const raw = localStorage.getItem(getWrongAnswersKey());
     return raw ? JSON.parse(raw) : [];
   } catch { return []; }
 }
 
 function saveWrongAnswers(answers: AnswerRecord[]): void {
   try { localStorage.setItem(getWrongAnswersKey(), JSON.stringify(answers.slice(-100))); } catch { /* ignore */ }
 }
 
 // ==================== Main Component ====================
 
 export function PracticePage({ goal, isLoading, questions: rawQuestions, selectedNode, onGeneratePractice, onGoHome }: PracticePageProps) {
   const [pageState, setPageState] = useState<PageState>("mode-select");
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_mode, setMode] = useState<PracticeMode>("sequential");
   const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [submitStates, setSubmitStates] = useState<SubmitState[]>([]);
   const [selectedAnswers, setSelectedAnswers] = useState<(string | string[])[]>([]);
   const [multiSelected, setMultiSelected] = useState<Set<string>[]>([]);
   const [answers, setAnswers] = useState<AnswerRecord[]>([]);
   const [elapsedSeconds, setElapsedSeconds] = useState(0);
   const [aiAssistIndex, setAiAssistIndex] = useState<number | null>(null);
   const [aiExplainLoading, setAiExplainLoading] = useState(false);
   const [aiExplainResult, setAiExplainResult] = useState<{ explanation: string; example: string } | null>(null);
   const [aiSimilarLoading, setAiSimilarLoading] = useState(false);
   const [aiSimilarResult, setAiSimilarResult] = useState<{ question: string; answer: string; explanation: string } | null>(null);
   const [resultSummary, setResultSummary] = useState<{ summary: string; reviewAdvice: string } | null>(null);
   const [resultLoading, setResultLoading] = useState(false);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_showBlankAnswer, setShowBlankAnswer] = useState(false);
   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
   const enhancedQuestions = useMemo(() => {
     return rawQuestions.map((q) => ({
       ...q,
       _options: q.type === "choice" || q.type === "true_false" ? generateOptions(q.question, q.answer, q.type) : undefined,
       _knowledgePoint: selectedNode?.title || q.question.slice(0, 10) + "相关知识点",
     }));
   }, [rawQuestions, selectedNode]);
 
   const currentQ = questions[currentIndex] || null;
   const totalQuestions = questions.length;
   const correctCount = answers.filter((a) => a.isCorrect).length;
 
   // Timer
   useEffect(() => {
     if (pageState === "answering") {
       timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
     } else {
       if (timerRef.current) clearInterval(timerRef.current);
     }
     return () => { if (timerRef.current) clearInterval(timerRef.current); };
   }, [pageState]);
 
   // Start a practice session
   const startPractice = useCallback((selectedMode: PracticeMode) => {
     setMode(selectedMode);
     let qs: EnhancedQuestion[] = [...enhancedQuestions];
     if (selectedMode === "random") qs = qs.sort(() => Math.random() - 0.5);
     if (selectedMode === "wrong-review") {
       const wrongs = loadWrongAnswers();
       if (wrongs.length > 0) {
         const wrongIds = new Set(wrongs.map((w) => w.questionId));
         qs = qs.filter((q) => wrongIds.has(q.id));
         if (qs.length === 0) qs = enhancedQuestions.slice(0, 3);
       }
     }
     if (qs.length === 0) qs = enhancedQuestions.slice(0, 3);
     setQuestions(qs);
     setCurrentIndex(0);
     setSubmitStates(qs.map(() => "unanswered" as SubmitState));
     setSelectedAnswers(qs.map(() => ""));
     setMultiSelected(qs.map(() => new Set<string>()));
     setAnswers([]);
     setElapsedSeconds(0);
     setAiAssistIndex(null);
     setAiExplainResult(null);
     setAiSimilarResult(null);
     setResultSummary(null);
     setShowBlankAnswer(false);
     setPageState("answering");
   }, [enhancedQuestions]);
 
   // Handle answer selection
   const handleSelectAnswer = useCallback((answer: string) => {
     if (submitStates[currentIndex] === "submitted") return;
     const q = questions[currentIndex];
     if (!q) return;
    if (// eslint-disable-next-line @typescript-eslint/no-explicit-any
(q as any).type === "multi_choice" || (q as any).type === "multi_choice") {
       setMultiSelected((prev) => {
         const next = [...prev];
         const set = new Set(next[currentIndex] || []);
         if (set.has(answer)) set.delete(answer); else set.add(answer);
         next[currentIndex] = set;
         return next;
       });
     } else {
       setSelectedAnswers((prev) => {
         const next = [...prev];
         next[currentIndex] = answer;
         return next;
       });
     }
     setSubmitStates((prev) => {
       const next = [...prev];
       if (next[currentIndex] === "unanswered") next[currentIndex] = "answered";
       return next;
     });
   }, [currentIndex, questions, submitStates]);
 
   // Submit current question
   const handleSubmit = useCallback(() => {
     const q = questions[currentIndex];
     if (!q) return;
     let userAnswer = "";
     let isCorrect = false;
     if (q.type === "multi_choice" as string) {
       const selected = multiSelected[currentIndex] || new Set();
       userAnswer = Array.from(selected).join(", ");
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
const correctAnswers = (q as any).multiCorrect || [q.answer];
       const userArr = Array.from(selected).sort();
       const correctArr = [...correctAnswers].sort();
       isCorrect = userArr.length === correctArr.length && userArr.every((v, i) => v === correctArr[i]);
     } else if (q.type === "blank") {
       userAnswer = typeof selectedAnswers[currentIndex] === "string" ? selectedAnswers[currentIndex] as string : "";
       isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase() || userAnswer.includes(q.answer);
     } else if (q.type === "short_answer" || q.type === "project") {
       userAnswer = typeof selectedAnswers[currentIndex] === "string" ? selectedAnswers[currentIndex] as string : "";
       isCorrect = userAnswer.trim().length > 3;
     } else {
       userAnswer = typeof selectedAnswers[currentIndex] === "string" ? selectedAnswers[currentIndex] as string : "";
       isCorrect = userAnswer === q.answer;
     }
     const record: AnswerRecord = { questionId: q.id, selected: userAnswer, isCorrect, timeSpent: elapsedSeconds };
     setAnswers((prev) => [...prev, record]);
     if (!isCorrect) saveWrongAnswers([...loadWrongAnswers(), record]);
     setSubmitStates((prev) => {
       const next = [...prev];
       next[currentIndex] = "submitted";
       return next;
     });
   }, [currentIndex, questions, selectedAnswers, multiSelected, elapsedSeconds]);
 
   const goToNext = useCallback(() => {
     if (currentIndex < totalQuestions - 1) {
       setCurrentIndex((i) => i + 1);
       setAiAssistIndex(null);
       setAiExplainResult(null);
       setAiSimilarResult(null);
       setShowBlankAnswer(false);
     }
   }, [currentIndex, totalQuestions]);
 
   const goToPrev = useCallback(() => {
     if (currentIndex > 0) {
       setCurrentIndex((i) => i - 1);
       setAiAssistIndex(null);
       setAiExplainResult(null);
       setAiSimilarResult(null);
       setShowBlankAnswer(false);
     }
   }, [currentIndex]);
 
   // Finish & show results
   const handleFinish = useCallback(async () => {
     setPageState("results");
     setResultLoading(true);
     const wrongTopics = answers.filter((a) => !a.isCorrect).map((a) => {
       const q = questions.find((qq) => qq.id === a.questionId);
       return q?._knowledgePoint || "未知";
     });
     try {
       const res = await fetch("/api/chat", {
         method: "POST", headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           goal: goal || "",
           question: "请根据以下练习结果生成学习总结和复习建议：共" + totalQuestions + "题，正确" + correctCount + "题。薄弱知识点：" + wrongTopics.join(", "),
         }),
       });
       const data = await res.json();
       setResultSummary(data.data ? { summary: data.data.answer, reviewAdvice: "" } : { summary: "练习完成！", reviewAdvice: "建议复习薄弱知识点。" });
     } catch {
       setResultSummary({
         summary: "本次练习共完成" + totalQuestions + "题，正确" + correctCount + "题（" + Math.round(correctCount / totalQuestions * 100) + "%）。",
         reviewAdvice: wrongTopics.length > 0 ? "建议复习：" + wrongTopics.slice(0, 3).join("、") : "掌握良好！",
       });
     }
     setResultLoading(false);
   }, [answers, questions, totalQuestions, correctCount, goal]);
 
   // AI Assist actions
   const loadAiExplanation = useCallback(async () => {
     const q = questions[currentIndex];
     if (!q) return;
     setAiExplainLoading(true);
     setAiAssistIndex(currentIndex);
     try {
       const res = await fetch("/api/chat", {
         method: "POST", headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ goal: goal || "", question: "请解释这道题：\n题目：" + q.question + "\n正确答案：" + q.answer + "\n解析：" + q.explanation + "\n\n请用简单易懂的方式重新解释这个知识点，并给出一个生活中的例子。" }),
       });
       const data = await res.json();
       setAiExplainResult(data.data ? { explanation: data.data.answer, example: "" } : { explanation: q.explanation, example: "暂无例子。" });
     } catch {
       setAiExplainResult({ explanation: q.explanation, example: "AI 暂时无法生成例子。" });
     }
     setAiExplainLoading(false);
   }, [currentIndex, questions, goal]);
 
   const loadAiSimilar = useCallback(async () => {
     const q = questions[currentIndex];
     if (!q) return;
     setAiSimilarLoading(true);
     try {
       const res = await fetch("/api/chat", {
         method: "POST", headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ goal: goal || "", question: "请根据这道题生成一道类似的题。原题：" + q.question + "，答案：" + q.answer + "，解析：" + q.explanation + "\n\n请输出格式：\n类似题目：[题目]\n答案：[答案]\n解析：[解析]" }),
       });
       const data = await res.json();
       setAiSimilarResult(data.data ? { question: data.data.answer, answer: "", explanation: "" } : { question: "请尝试举一反三。", answer: "", explanation: "" });
     } catch {
       setAiSimilarResult({ question: "AI 暂时无法生成类似题。", answer: "", explanation: "" });
     }
     setAiSimilarLoading(false);
   }, [currentIndex, questions, goal]);
 
   // Restart with same questions
   const handleRestart = useCallback(() => {
     setCurrentIndex(0);
     setSubmitStates(questions.map(() => "unanswered"));
     setSelectedAnswers(questions.map(() => ""));
     setMultiSelected(questions.map(() => new Set<string>()));
     setAnswers([]);
     setElapsedSeconds(0);
     setAiAssistIndex(null);
     setAiExplainResult(null);
     setAiSimilarResult(null);
     setResultSummary(null);
     setPageState("mode-select");
   }, [questions]);
 
   // ==================== RENDER: No Goal ====================
   if (!goal) {
     return (
       <section className="rounded-[28px] border border-dashed border-sky-200 bg-white p-5 text-center shadow-sm">
         <h1 className="text-lg font-bold text-slate-950">还没有练习主题</h1>
         <p className="mt-2 text-sm leading-6 text-slate-500">先在首页生成学习计划，再让 AI 根据当前知识点出题。</p>
         <button className="mt-4 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100" onClick={onGoHome} type="button">
           去首页生成
         </button>
       </section>
     );
   }
 
   // ==================== RENDER: Mode Select ====================
   if (pageState === "mode-select") {
     return (
       <div className="space-y-4">
         <header className="rounded-[28px] bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-5 shadow-soft">
           <p className="text-xs font-semibold text-sky-600">练习</p>
           <h1 className="mt-1 text-xl font-bold text-slate-950">{goal}</h1>
         </header>
         <div className="grid grid-cols-1 gap-3">
           {MODES.map((m) => {
             const Icon = m.icon;
             const disabled = (m.id === "wrong-review" && loadWrongAnswers().length === 0) || (m.id === "chapter" && !selectedNode) || (enhancedQuestions.length === 0 && (m.id === "sequential" || m.id === "random"));
             return (
               <button
                 key={m.id}
                 type="button"
                 disabled={disabled}
                 onClick={() => { if (!disabled) startPractice(m.id); }}
                 className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                   disabled ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed" : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/50"
                 }`}
               >
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                   <Icon className="h-5 w-5" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="text-sm font-bold text-slate-900">{m.label}</p>
                   <p className="mt-0.5 text-xs leading-5 text-slate-500">{m.desc}</p>
                 </div>
                 <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />
               </button>
             );
           })}
         </div>
         {enhancedQuestions.length > 0 && (
           <p className="text-center text-xs text-slate-400">当前有 {enhancedQuestions.length} 道练习题</p>
         )}
         <button
           type="button"
           onClick={onGeneratePractice}
           disabled={isLoading}
           className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:bg-slate-300"
         >
           {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
           生成新题目
         </button>
       </div>
     );
   }
 
   // ==================== RENDER: Results ====================
   if (pageState === "results") {
     const rate = totalQuestions > 0 ? Math.round(correctCount / totalQuestions * 100) : 0;
     const minutes = Math.floor(elapsedSeconds / 60);
     const seconds = elapsedSeconds % 60;
     const wrongAnswers = answers.filter((a) => !a.isCorrect);
     return (
       <div className="space-y-4 pb-8">
         <header className="rounded-[28px] bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-soft text-center">
           <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white ${
             rate >= 80 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-500" : "bg-rose-500"
           }`}>
             {rate}%
           </div>
           <h1 className="mt-4 text-xl font-bold text-slate-950">
             {rate >= 80 ? "掌握良好！" : rate >= 60 ? "继续加油！" : "需要加强"}
           </h1>
           <p className="mt-1 text-sm text-slate-500">
             共 {totalQuestions} 题 · 正确 {correctCount} 题 · 错误 {totalQuestions - correctCount} 题
           </p>
           <p className="text-xs text-slate-400">
             <Clock className="mr-1 inline h-3 w-3" />
             用时 {minutes}分{seconds}秒
           </p>
         </header>
 
         {resultLoading ? (
           <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-4">
             <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
             <span className="text-sm text-slate-500">AI 正在分析...</span>
           </div>
         ) : resultSummary ? (
           <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-3">
               <Sparkles className="h-5 w-5 text-sky-600" />
               <h2 className="text-base font-bold text-slate-900">AI 学习分析</h2>
             </div>
             <p className="text-sm leading-7 text-slate-600">{resultSummary.summary}</p>
             {resultSummary.reviewAdvice && (
               <div className="mt-3 rounded-2xl bg-amber-50 p-3">
                 <p className="text-xs font-bold text-amber-700">复习建议</p>
                 <p className="mt-1 text-sm leading-6 text-amber-800">{resultSummary.reviewAdvice}</p>
               </div>
             )}
           </div>
         ) : null}
 
         {/* Wrong answers review */}
         {wrongAnswers.length > 0 && (
           <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-3">
               <AlertCircle className="h-5 w-5 text-rose-500" />
               <h2 className="text-base font-bold text-slate-900">错题回顾</h2>
             </div>
             <div className="space-y-2.5">
               {wrongAnswers.map((wa) => {
                 const q = questions.find((qq) => qq.id === wa.questionId);
                 return (
                   <div key={wa.questionId} className="rounded-2xl bg-rose-50/60 p-3.5 border border-rose-100">
                     <p className="text-sm font-bold text-slate-900">{q?.question || "未知题目"}</p>
                     <p className="mt-1 text-xs text-rose-600">你的答案：{typeof wa.selected === "string" ? wa.selected : Array.from(wa.selected as string[]).join(", ")}</p>
                     <p className="text-xs text-emerald-600">正确答案：{q?.answer || ""}</p>
                     {q?.explanation && <p className="mt-1 text-xs leading-5 text-slate-500">{q.explanation}</p>}
                   </div>
                 );
               })}
             </div>
           </div>
         )}
 
         <div className="flex gap-3">
           <button type="button" onClick={handleRestart} className="flex-1 rounded-2xl border-2 border-sky-200 px-4 py-3 text-sm font-bold text-sky-600 transition hover:bg-sky-50">
             <RotateCcw className="mr-1.5 inline h-4 w-4" />再来一次
           </button>
           <button type="button" onClick={onGeneratePractice} className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-700">
             <RefreshCcw className="mr-1.5 inline h-4 w-4" />新题目
           </button>
         </div>
       </div>
     );
   }
 
   // ==================== RENDER: Answering ====================
   if (!currentQ) return null;
   const submitState = submitStates[currentIndex] || "unanswered";
   const showAiAssist = aiAssistIndex === currentIndex;
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
const _answered = submitState !== "unanswered";
   const canSubmit = (() => {
     if (submitState === "submitted") return false;
     if (// eslint-disable-next-line @typescript-eslint/no-explicit-any
(currentQ as any).type === "multi_choice") return (multiSelected[currentIndex]?.size || 0) > 0;
     if (currentQ.type === "blank" || currentQ.type === "short_answer") return (typeof selectedAnswers[currentIndex] === "string" ? (selectedAnswers[currentIndex] as string).trim().length > 0 : false);
     return typeof selectedAnswers[currentIndex] === "string" ? (selectedAnswers[currentIndex] as string).length > 0 : false;
   })();
 
   return (
     <div className="space-y-4 pb-8">
       {/* Header with progress */}
       <div className="rounded-[28px] bg-white p-5 shadow-soft">
         <div className="flex items-center justify-between">
           <p className="text-xs font-semibold text-sky-600">{QUESTION_TYPE_LABELS[currentQ.type] || "题目"}</p>
           <p className="text-xs font-bold text-slate-400">第 {currentIndex + 1}/{totalQuestions} 题</p>
         </div>
         <div className="mt-3 h-1.5 rounded-full bg-slate-100">
           <div className="h-1.5 rounded-full bg-sky-500 transition-all" style={{ width: ((currentIndex + 1) / totalQuestions * 100) + "%" }} />
         </div>
         <div className="mt-1 flex justify-between text-[10px] text-slate-400">
           <span>进度</span>
           <span>{Math.round((currentIndex + 1) / totalQuestions * 100)}%</span>
         </div>
       </div>
 
       {/* Question card */}
       <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
         <h2 className="text-base font-bold leading-7 text-slate-950 break-words whitespace-pre-wrap">
           {currentQ.question}
         </h2>
 
         {/* Options */}
         {currentQ.type === "choice" || currentQ.type === "true_false" ? (
           <div className="mt-4 space-y-2.5">
             {(currentQ._options || ["加载中..."]).map((opt, oi) => {
               const isSelected = selectedAnswers[currentIndex] === opt;
               const isSubmitted = submitState === "submitted";
               const isCorrectOpt = opt === currentQ.answer;
               return (
                 <button
                   key={oi}
                   type="button"
                   onClick={() => handleSelectAnswer(opt)}
                   disabled={isSubmitted}
                   className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-sm leading-6 transition ${
                     isSubmitted
                       ? isCorrectOpt ? "border-emerald-400 bg-emerald-50 text-emerald-800" : isSelected ? "border-rose-300 bg-rose-50 text-rose-800" : "border-slate-100 bg-slate-50 text-slate-400"
                       : isSelected ? "border-sky-400 bg-sky-50 text-sky-800 font-semibold" : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/50"
                   }`}
                 >
                   <div className="flex items-start gap-3">
                     <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                       isSubmitted && isCorrectOpt ? "bg-emerald-500 text-white" : isSubmitted && isSelected && !isCorrectOpt ? "bg-rose-500 text-white" : isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"
                     }`}>
                       {String.fromCharCode(65 + oi)}
                     </span>
                     <span className="flex-1 break-words whitespace-pre-wrap">{opt}</span>
                     {isSubmitted && isCorrectOpt && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
                     {isSubmitted && isSelected && !isCorrectOpt && <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />}
                   </div>
                 </button>
               );
             })}
           </div>
         ) : currentQ.type === "multi_choice" as string ? (
           <div className="mt-4 space-y-2.5">
             {(currentQ._options || ["加载中..."]).map((opt, oi) => {
               const selected = multiSelected[currentIndex] || new Set();
               const isSelected = selected.has(opt);
               return (
                 <button
                   key={oi}
                   type="button"
                   onClick={() => handleSelectAnswer(opt)}
                   disabled={submitState === "submitted"}
                   className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-sm leading-6 transition ${
                     isSelected ? "border-sky-400 bg-sky-50 text-sky-800 font-semibold" : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/50"
                   }`}
                 >
                   <div className="flex items-start gap-3">
                     <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                       isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"
                     }`}>
                       {isSelected && <Check className="h-4 w-4" />}
                       {!isSelected && String.fromCharCode(65 + oi)}
                     </span>
                     <span className="flex-1 break-words whitespace-pre-wrap">{opt}</span>
                   </div>
                 </button>
               );
             })}
             {submitState !== "submitted" && <p className="text-xs text-slate-400 mt-1">可多选，再点击取消选择</p>}
           </div>
         ) : (
           <div className="mt-4">
             <textarea
               className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none resize-none"
               rows={3}
               placeholder={currentQ.type === "blank" ? "请输入答案..." : "请输入你的回答..."}
               value={typeof selectedAnswers[currentIndex] === "string" ? selectedAnswers[currentIndex] as string : ""}
               onChange={(e) => {
                 setSelectedAnswers((prev) => { const n = [...prev]; n[currentIndex] = e.target.value; return n; });
                 setSubmitStates((prev) => { const n = [...prev]; if (n[currentIndex] === "unanswered") n[currentIndex] = "answered"; return n; });
               }}
               disabled={submitState === "submitted"}
             />
           </div>
         )}
 
         {/* Feedback after submit */}
         {submitState === "submitted" && (
           <div className="mt-4 space-y-3 animate-in fade-in">
             <div className={`rounded-2xl p-4 ${
               answers.find((a) => a.questionId === currentQ.id)?.isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
             }`}>
               <div className="flex items-center gap-2">
                 {answers.find((a) => a.questionId === currentQ.id)?.isCorrect
                   ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                   : <X className="h-5 w-5 text-rose-600" />}
                 <p className="text-sm font-bold">{answers.find((a) => a.questionId === currentQ.id)?.isCorrect ? "回答正确！" : "回答错误"}</p>
               </div>
               <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">正确答案：</span>{currentQ.answer}</p>
               {currentQ.explanation && (
                 <div className="mt-2 rounded-2xl bg-white/80 px-3.5 py-2.5">
                   <p className="text-xs font-bold text-slate-500">解析</p>
                   <p className="mt-1 text-sm leading-6 text-slate-700 whitespace-pre-wrap break-words">{currentQ.explanation}</p>
                   {currentQ._knowledgePoint && <p className="mt-1 text-xs text-sky-600">知识点：{currentQ._knowledgePoint}</p>}
                 </div>
               )}
             </div>
           </div>
         )}
       </div>
 
       {/* AI Assist Panel */}
       {submitState === "submitted" && (
         <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft">
           <div className="flex flex-wrap gap-2">
             <button type="button" onClick={loadAiExplanation} disabled={aiExplainLoading} className="flex items-center gap-1.5 rounded-xl bg-violet-50 px-3.5 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50">
               {aiExplainLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
               解释知识点
             </button>
             <button type="button" onClick={loadAiSimilar} disabled={aiSimilarLoading} className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50">
               {aiSimilarLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
               出类似题
             </button>
           </div>
           {showAiAssist && aiExplainResult && (
             <div className="mt-3 space-y-2 animate-in fade-in">
               <div className="rounded-2xl bg-violet-50 p-3.5">
                 <p className="text-xs font-bold text-violet-700">知识点讲解</p>
                 <p className="mt-1 text-sm leading-6 text-violet-900 whitespace-pre-wrap break-words">{aiExplainResult.explanation}</p>
               </div>
               {aiExplainResult.example && (
                 <div className="rounded-2xl bg-amber-50 p-3.5">
                   <p className="text-xs font-bold text-amber-700">生活例子</p>
                   <p className="mt-1 text-sm leading-6 text-amber-900 whitespace-pre-wrap break-words">{aiExplainResult.example}</p>
                 </div>
               )}
             </div>
           )}
           {showAiAssist && aiSimilarResult && (
             <div className="mt-3 rounded-2xl bg-sky-50 p-3.5 animate-in fade-in">
               <p className="text-xs font-bold text-sky-700">类似题目</p>
               <p className="mt-1 text-sm leading-6 text-sky-900 whitespace-pre-wrap break-words">{aiSimilarResult.question}</p>
               {aiSimilarResult.answer && <p className="mt-1 text-xs text-slate-500">答案：{aiSimilarResult.answer}</p>}
             </div>
           )}
         </div>
       )}
 
       {/* Navigation */}
       <div className="flex gap-3">
         <button type="button" onClick={goToPrev} disabled={currentIndex === 0} className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed">
           <ArrowLeft className="mr-1 inline h-4 w-4" />上一题
         </button>
         {submitState !== "submitted" ? (
           <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:bg-slate-300">
             <Check className="mr-1 inline h-4 w-4" />提交答案
           </button>
         ) : currentIndex < totalQuestions - 1 ? (
           <button type="button" onClick={goToNext} className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-700">
            下一题<ArrowRight className="ml-1 inline h-4 w-4" />
           </button>
         ) : (
           <button type="button" onClick={handleFinish} className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700">
             <BarChart3 className="mr-1 inline h-4 w-4" />查看结果
           </button>
         )}
       </div>
     </div>
   );
 }
