 "use client";
 
 import { useCallback, useRef, useState } from "react";
 import {
   AlertCircle,
   BookOpen,
   Brain,
   CheckCircle2,
   ChevronDown,
   ChevronRight,
   Clock,
   FileText,
   GraduationCap,
   Lightbulb,
   Loader2,
   RefreshCw,
   Target,
   Upload,
   X,
 } from "lucide-react";
 import type { FileAnalysisResult } from "@/types/learning";
 import { parseFile, isFileTypeSupported, formatFileSize, getFileTypeLabel } from "@/lib/fileParser";
 
 const PURPOSES = ["考试复习", "课程作业", "软件实操", "项目制作", "考研考证", "兴趣入门"] as const;
 const LEVELS = ["零基础", "学过一点", "已经会基础", "想快速复习"] as const;
 const TIMES = ["1天", "3天", "7天", "30天"] as const;
 
 type AppState = "upload" | "questionnaire" | "analyzing" | "result";
 
 export function MaterialPage() {
   const [appState, setAppState] = useState<AppState>("upload");
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_file, setFile] = useState<File | null>(null);
   const [fileContent, setFileContent] = useState("");
   const [fileName, setFileName] = useState("");
   const [fileSize, setFileSize] = useState(0);
   const [parseError, setParseError] = useState("");
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
const [_isParsing, setIsParsing] = useState(false);
   const [purpose, setPurpose] = useState("");
   const [level, setLevel] = useState("");
   const [timeLimit, setTimeLimit] = useState("");
   const [result, setResult] = useState<FileAnalysisResult | null>(null);
   const [analyzeError, setAnalyzeError] = useState("");
   const [aiInfo, setAiInfo] = useState("");
   const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
   const [expandedKeyPoints, setExpandedKeyPoints] = useState<Set<string>>(new Set());
   const fileInputRef = useRef<HTMLInputElement>(null);
   const dropRef = useRef<HTMLDivElement>(null);
 
   const handleFileSelect = useCallback(async (selectedFile: File) => {
     setParseError("");
     setAnalyzeError("");
     if (!isFileTypeSupported(selectedFile.name)) {
       setParseError("不支持的文件格式。目前支持：TXT、Markdown、PDF。");
       return;
     }
     setFile(selectedFile);
     setFileName(selectedFile.name);
     setFileSize(selectedFile.size);
     setIsParsing(true);
     const result = await parseFile(selectedFile);
     setIsParsing(false);
     if (result.success) {
       setFileContent(result.content);
       setAppState("questionnaire");
     } else {
       setParseError(result.error || "文件解析失败");
       setFile(null);
     }
   }, []);
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     const droppedFile = e.dataTransfer.files[0];
     if (droppedFile) handleFileSelect(droppedFile);
   }, [handleFileSelect]);
 
   const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFile = e.target.files?.[0];
     if (selectedFile) handleFileSelect(selectedFile);
   }, [handleFileSelect]);
 
   const handleAnalyze = useCallback(async () => {
     if (!purpose || !level || !timeLimit || !fileContent) return;
     setAnalyzeError("");
     setAppState("analyzing");
     try {
       const res = await fetch("/api/analyze-file", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ content: fileContent.slice(0, 8000), fileName, purpose, level, timeLimit }),
       });
       const data = await res.json();
       if (!res.ok) {
         throw new Error(data.error || "分析失败");
       }
       setResult(data.data as FileAnalysisResult);
       setAiInfo("AI: " + (data.actualProvider || "mock") + " / " + (data.actualModel || "dynamic"));
       setAppState("result");
     } catch (err) {
       setAnalyzeError(err instanceof Error ? err.message : "分析请求失败");
       setAppState("questionnaire");
     }
   }, [purpose, level, timeLimit, fileContent, fileName]);
 
   const handleReset = useCallback(() => {
     setFile(null);
     setFileContent("");
     setFileName("");
     setFileSize(0);
     setParseError("");
     setPurpose("");
     setLevel("");
     setTimeLimit("");
     setResult(null);
     setAnalyzeError("");
     setAiInfo("");
     setExpandedModules(new Set());
     setAppState("upload");
   }, []);
 
   const toggleModule = useCallback((title: string) => {
     setExpandedModules(prev => {
       const next = new Set(prev);
       if (next.has(title)) next.delete(title); else next.add(title);
       return next;
     });
   }, []);
 
   const toggleKeyPoint = useCallback((title: string) => {
     setExpandedKeyPoints(prev => {
       const next = new Set(prev);
       if (next.has(title)) next.delete(title); else next.add(title);
       return next;
     });
   }, []);
 
   // ==================== Upload State ====================
   if (appState === "upload") {
     return (
       <div className="space-y-4">
         <div className="rounded-[28px] bg-gradient-to-br from-sky-50 to-indigo-50 p-5 shadow-soft">
           <h1 className="text-xl font-bold text-slate-950">上传学习资料</h1>
           <p className="mt-1 text-sm leading-6 text-slate-500">上传你的学习资料，AI 将自动分析内容、提取重点、生成知识地图。</p>
         </div>
 
         <div
           ref={dropRef}
           onDrop={handleDrop}
           onDragOver={(e) => e.preventDefault()}
           onClick={() => fileInputRef.current?.click()}
           className="cursor-pointer rounded-[28px] border-2 border-dashed border-sky-200 bg-white p-8 text-center shadow-sm transition hover:border-sky-400 hover:bg-sky-50/50"
         >
           <input
             ref={fileInputRef}
             type="file"
             accept=".txt,.md,.markdown,.pdf"
             className="hidden"
             onChange={handleInputChange}
           />
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
             <Upload className="h-7 w-7 text-sky-600" />
           </div>
           <p className="mt-4 text-sm font-bold text-slate-700">点击选择文件，或拖拽文件到此处</p>
           <p className="mt-2 text-xs text-slate-400">支持 TXT、Markdown、PDF 格式（最大 10MB）</p>
         </div>
 
         {parseError && (
           <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">
             <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
             {parseError}
           </div>
         )}
 
         <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
           <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">支持的功能</h2>
           <ul className="mt-3 space-y-2.5">
             {[
               "AI 分析文件内容，提取核心知识点",
               "生成三级知识结构（模块→子节点→知识点）",
               "根据学习目标判断重点、难点、可跳过内容",
               "生成推荐学习路径和练习题",
               "点击知识点查看 AI 讲解和案例",
             ].map((item) => (
               <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                 <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                 {item}
               </li>
             ))}
           </ul>
         </div>
       </div>
     );
   }
 
   // ==================== Questionnaire State ====================
   if (appState === "questionnaire") {
     return (
       <div className="space-y-4">
         <div className="rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-soft">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2.5">
               <FileText className="h-5 w-5 text-sky-600" />
               <div>
                 <p className="text-sm font-bold text-slate-900">{fileName}</p>
                 <p className="text-xs text-slate-400">{formatFileSize(fileSize)} · {getFileTypeLabel(fileName)}</p>
               </div>
             </div>
             <button onClick={handleReset} type="button" className="rounded-lg p-1.5 hover:bg-slate-100 transition">
               <X className="h-4 w-4 text-slate-400" />
             </button>
           </div>
           <div className="mt-3 max-h-24 overflow-y-auto rounded-2xl bg-slate-50 p-3">
             <p className="text-xs leading-5 text-slate-500 line-clamp-3">{fileContent.slice(0, 300)}</p>
           </div>
         </div>
 
         <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
           <h2 className="text-base font-bold text-slate-900">你的学习目标是什么？</h2>
           <div className="mt-3 grid grid-cols-2 gap-2">
             {PURPOSES.map((p) => (
               <button
                 key={p}
                 type="button"
                 onClick={() => setPurpose(p)}
                 className={`rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                   purpose === p
                     ? "bg-sky-600 text-white shadow-md"
                     : "bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                 }`}
               >{p}</button>
             ))}
           </div>
         </div>
 
         {purpose && (
           <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft animate-in fade-in slide-in-from-bottom-2">
             <h2 className="text-base font-bold text-slate-900">你的基础如何？</h2>
             <div className="mt-3 grid grid-cols-2 gap-2">
               {LEVELS.map((l) => (
                 <button
                   key={l}
                   type="button"
                   onClick={() => setLevel(l)}
                   className={`rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                     level === l
                       ? "bg-sky-600 text-white shadow-md"
                       : "bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                   }`}
                 >{l}</button>
               ))}
             </div>
           </div>
         )}
 
         {level && (
           <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft animate-in fade-in slide-in-from-bottom-2">
             <h2 className="text-base font-bold text-slate-900">你有多少时间？</h2>
             <div className="mt-3 grid grid-cols-4 gap-2">
               {TIMES.map((t) => (
                 <button
                   key={t}
                   type="button"
                   onClick={() => setTimeLimit(t)}
                   className={`rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                     timeLimit === t
                       ? "bg-sky-600 text-white shadow-md"
                       : "bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                   }`}
                 >{t}</button>
               ))}
             </div>
           </div>
         )}
 
         {timeLimit && (
           <button
             type="button"
             onClick={handleAnalyze}
             className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-200 transition hover:from-sky-600 hover:to-indigo-600"
           >
             <Brain className="mr-2 inline-block h-5 w-5" />
             开始 AI 分析
           </button>
         )}
 
         {analyzeError && (
           <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">
             <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
             {analyzeError}
           </div>
         )}
       </div>
     );
   }
 
   // ==================== Analyzing State ====================
   if (appState === "analyzing") {
     return (
       <div className="flex flex-col items-center justify-center py-20">
         <div className="relative">
           <div className="h-20 w-20 rounded-full border-4 border-sky-100">
             <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
             </div>
           </div>
         </div>
         <h2 className="mt-6 text-lg font-bold text-slate-900">AI 正在分析文件</h2>
         <p className="mt-2 text-sm text-slate-500 text-center max-w-64">
           正在提取知识点、判断重点难点、生成知识地图和练习题...
         </p>
         <div className="mt-6 w-48 space-y-2">
           <div className="h-1.5 rounded-full bg-sky-100">
             <div className="h-1.5 w-2/3 rounded-full bg-sky-500 animate-pulse" />
           </div>
         </div>
         <p className="mt-3 text-xs text-slate-400">{fileName}</p>
       </div>
     );
   }
 
   // ==================== Result State ====================
   if (appState === "result" && result) {
     return (
       <div className="space-y-4 pb-8">
         {aiInfo && <p className="text-right text-[10px] font-semibold text-slate-400">{aiInfo}</p>}
 
         {/* Header */}
         <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-soft">
           <div className="flex items-start justify-between gap-3">
             <div>
               <p className="text-xs font-semibold text-emerald-600">AI 分析完成</p>
               <h1 className="mt-1 text-lg font-bold text-slate-950">{result.fileTitle}</h1>
               <p className="mt-1 text-xs text-slate-400">
                 目标：{result.learningProfile.purpose} · 水平：{result.learningProfile.level} · 时间：{result.learningProfile.timeLimit}
               </p>
             </div>
             <button onClick={handleReset} type="button" className="rounded-lg p-2 hover:bg-white/60 transition">
               <Upload className="h-4 w-4 text-slate-400" />
             </button>
           </div>
           <p className="mt-3 text-sm leading-7 text-slate-600">{result.summary}</p>
         </div>
 
         {/* Key Points */}
         {result.keyPoints.length > 0 && (
           <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-3">
               <Target className="h-5 w-5 text-amber-600" />
               <h2 className="text-base font-bold text-slate-900">AI 为什么认为这些内容重要</h2>
             </div>
             <div className="space-y-3">
               {result.keyPoints.sort((a, b) => b.priority - a.priority).map((kp) => (
                 <div key={kp.title} className="rounded-2xl border border-amber-200/60 bg-white p-4">
                   <button
                     type="button"
                     onClick={() => toggleKeyPoint(kp.title)}
                     className="flex w-full items-start justify-between gap-2 text-left"
                   >
                     <div className="flex items-start gap-2.5">
                       <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                         kp.priority >= 4 ? "bg-rose-500" : kp.priority >= 3 ? "bg-amber-500" : "bg-sky-500"
                       }`}>{kp.priority}</span>
                       <div>
                         <p className="text-sm font-bold text-slate-900">{kp.title}</p>
                         {expandedKeyPoints.has(kp.title) && (
                           <div className="mt-2 space-y-1.5 animate-in fade-in">
                             <p className="text-sm leading-6 text-slate-600">{kp.reason}</p>
                             <p className="text-xs text-slate-400">关联目标：{kp.relatedGoal}</p>
                           </div>
                         )}
                       </div>
                     </div>
                     {expandedKeyPoints.has(kp.title) ? <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />}
                   </button>
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Knowledge Map */}
         <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
           <div className="flex items-center gap-2 mb-4">
             <BookOpen className="h-5 w-5 text-sky-600" />
             <h2 className="text-base font-bold text-slate-900">知识地图</h2>
             <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-600">
               {countAllNodes(result.knowledgeMap)} 个节点
             </span>
           </div>
           <div className="space-y-3">
             {result.knowledgeMap.map((module) => (
               <div key={module.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 overflow-hidden">
                 <button
                   type="button"
                   onClick={() => toggleModule(module.title)}
                   className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-slate-100/50"
                 >
                   <div className="flex items-center gap-2.5 min-w-0">
                     <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                       module.priority >= 4 ? "bg-rose-500" : module.priority >= 3 ? "bg-amber-500" : "bg-sky-400"
                     }`} />
                     <div className="min-w-0">
                       <p className="text-sm font-bold text-slate-900 truncate">{module.title}</p>
                       <p className="text-xs text-slate-400 truncate mt-0.5">{module.summary}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 shrink-0">
                     <NodeTags type={module.type} canSkip={module.canSkip} difficulty={module.difficulty} />
                     {expandedModules.has(module.title) ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                   </div>
                 </button>
                 {expandedModules.has(module.title) && module.children.length > 0 && (
                   <div className="border-t border-slate-100 px-4 py-3 space-y-2 animate-in fade-in">
                     {module.children.map((child) => (
                       <ChildNode key={child.title} node={child} />
                     ))}
                   </div>
                 )}
               </div>
             ))}
           </div>
         </div>
 
         {/* Difficult Points */}
         {result.difficultPoints.length > 0 && (
           <div className="rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-3">
               <AlertCircle className="h-5 w-5 text-rose-500" />
               <h2 className="text-base font-bold text-slate-900">难点提醒</h2>
             </div>
             <div className="space-y-2.5">
               {result.difficultPoints.map((dp) => (
                 <div key={dp.title} className="rounded-2xl bg-white/80 px-4 py-3 border border-rose-100">
                   <p className="text-sm font-bold text-rose-800">{dp.title}</p>
                   <p className="mt-1 text-sm leading-6 text-rose-700">{dp.reason}</p>
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Skip Suggestions */}
         {result.skipSuggestions.length > 0 && (
           <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-3">
               <Lightbulb className="h-5 w-5 text-amber-500" />
               <h2 className="text-base font-bold text-slate-900">可跳过内容</h2>
             </div>
             <div className="space-y-2.5">
               {result.skipSuggestions.map((ss) => (
                 <div key={ss.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                   <span className="mt-0.5 text-slate-400">→</span>
                   <div>
                     <p className="text-sm font-bold text-slate-700">{ss.title}</p>
                     <p className="mt-1 text-xs leading-5 text-slate-500">{ss.reason}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Learning Path */}
         {result.learningPath.length > 0 && (
           <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-4">
               <GraduationCap className="h-5 w-5 text-emerald-600" />
               <h2 className="text-base font-bold text-slate-900">推荐学习路径</h2>
             </div>
             <div className="space-y-3">
               {result.learningPath.map((step) => (
                 <div key={step.step} className="flex gap-3">
                   <div className="flex flex-col items-center">
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">
                       {step.step}
                     </div>
                     {step.step < result.learningPath.length && <div className="mt-1 h-full w-0.5 bg-emerald-200" />}
                   </div>
                   <div className="flex-1 pb-4">
                     <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-slate-900">{step.title}</p>
                       <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                         <Clock className="mr-0.5 inline h-3 w-3" />{step.estimatedTime}
                       </span>
                     </div>
                     <div className="mt-1.5 flex flex-wrap gap-1.5">
                       {step.nodes.map((node) => (
                         <span key={node} className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">
                           {node}
                         </span>
                       ))}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Practice Questions */}
         {result.practiceQuestions.length > 0 && (
           <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-4">
               <Brain className="h-5 w-5 text-violet-500" />
               <h2 className="text-base font-bold text-slate-900">练习题</h2>
             </div>
             <div className="space-y-3">
               {result.practiceQuestions.map((q) => (
                 <PracticeQuestionCard key={q.id} question={q} />
               ))}
             </div>
           </div>
         )}
 
         {/* Re-analyze */}
         <button
           type="button"
           onClick={handleReset}
           className="w-full rounded-2xl border-2 border-dashed border-sky-200 px-5 py-3 text-sm font-bold text-sky-600 transition hover:bg-sky-50"
         >
           <RefreshCw className="mr-1.5 inline h-4 w-4" />
           分析其他文件
         </button>
       </div>
     );
   }
 
   return null;
 }
 
 // ==================== Sub-Components ====================
 
 function NodeTags({ type, canSkip, difficulty }: { type: string; canSkip: boolean; difficulty: number }) {
   const tags: { label: string; className: string }[] = [];
   if (difficulty >= 4) tags.push({ label: "难点", className: "bg-rose-50 text-rose-600 border-rose-200" });
   if (canSkip) tags.push({ label: "可跳过", className: "bg-slate-100 text-slate-500 border-slate-200" });
   if (type === "project") tags.push({ label: "实操", className: "bg-amber-50 text-amber-700 border-amber-200" });
   if (type === "exam") tags.push({ label: "考点", className: "bg-violet-50 text-violet-700 border-violet-200" });
   if (tags.length === 0 && difficulty >= 3) tags.push({ label: "重点", className: "bg-sky-50 text-sky-700 border-sky-200" });
   return (
     <div className="flex gap-1">
       {tags.map((t) => (
         <span key={t.label} className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${t.className}`}>{t.label}</span>
       ))}
     </div>
   );
 }
 
 function ChildNode({ node }: { node: { title: string; summary: string; type: string; priority: number; difficulty: number; reason: string; canSkip: boolean } }) {
   const [expanded, setExpanded] = useState(false);
   return (
     <button
       type="button"
       onClick={() => setExpanded(!expanded)}
       className={`w-full rounded-2xl border px-3.5 py-2.5 text-left transition ${
         node.priority >= 4
           ? "border-rose-200 bg-rose-50/60"
           : node.priority >= 3
             ? "border-amber-200 bg-amber-50/40"
             : "border-slate-200 bg-white hover:bg-slate-50"
       }`}
     >
       <div className="flex items-center justify-between gap-2">
         <div className="min-w-0 flex-1">
           <p className="text-sm font-bold text-slate-900 truncate">{node.title}</p>
           <p className="text-xs text-slate-500 truncate">{node.summary}</p>
         </div>
         <NodeTags type={node.type} canSkip={node.canSkip} difficulty={node.difficulty} />
       </div>
       {expanded && (
         <div className="mt-2.5 border-t border-slate-200 pt-2.5 animate-in fade-in">
           <p className="text-sm leading-6 text-slate-600">{node.reason}</p>
         </div>
       )}
     </button>
   );
 }
 
 function PracticeQuestionCard({ question }: { question: { id: string; type: string; question: string; answer: string; explanation: string } }) {
   const [showAnswer, setShowAnswer] = useState(false);
   const typeLabels: Record<string, string> = {
     choice: "选择", blank: "填空", true_false: "判断", short_answer: "简答", project: "项目",
   };
   return (
     <div className="rounded-2xl border border-slate-100 bg-slate-50/60 overflow-hidden">
       <div className="px-4 py-3">
         <div className="flex items-start gap-2">
           <span className="shrink-0 rounded-lg bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
             {typeLabels[question.type] || question.type}
           </span>
           <p className="text-sm leading-6 text-slate-800">{question.question}</p>
         </div>
         <button
           type="button"
           onClick={() => setShowAnswer(!showAnswer)}
           className="mt-2 flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
         >
           {showAnswer ? "收起答案" : "查看答案"}
           {showAnswer ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
         </button>
         {showAnswer && (
           <div className="mt-2.5 rounded-2xl bg-emerald-50 px-3.5 py-3 animate-in fade-in">
             <p className="text-sm font-semibold text-emerald-800">答案：{question.answer}</p>
             <p className="mt-1 text-sm leading-6 text-emerald-700">{question.explanation}</p>
           </div>
         )}
       </div>
     </div>
   );
 }
 
 function countAllNodes(modules: Array<{ children?: Array<{ children?: unknown[] }> }>): number {
   return modules.reduce((sum, m) => sum + 1 + (m.children ? m.children.length : 0) + (m.children ? m.children.reduce((s: number, c: { children?: unknown[] }) => s + (c.children ? c.children.length : 0), 0) : 0), 0);
 }
