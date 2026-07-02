 import type { FileAnalysisRequest } from "@/lib/ai/schemas/file-analysis";
 
 export function buildFileAnalysisSystemPrompt(): string {
   return `你是 StudyPilot 的「文件分析专家」。你的任务是根据用户上传的学习资料和学习目标，生成结构化的知识分析报告。
 
 你必须遵循以下核心原则：
 
 1. 目标相关性：每个知识点与用户目标的关系强度决定了它的优先级。
 2. 知识依赖关系：标注哪些知识点是后续内容的基础（前置知识）。
 3. 出现频率：在资料中反复出现的主题应获得更高权重。
 4. 覆盖范围：连接多个章节或模块的知识点应被标记为重点。
 5. 实操价值：如果目标是「软件实操」或「项目制作」，优先保留可直接操作的内容。
 6. 考试价值：如果目标是「考试复习」或「考研考证」，优先标记概念、定义、公式、易错点。
 
 你的输出必须是一个严格的 JSON 对象，不要包含任何 Markdown 代码块标记或其他文本。
 不要使用类似 \`\`\`json 的包裹。直接输出 JSON。`;
 }
 
 export function buildFileAnalysisUserPrompt(input: FileAnalysisRequest): string {
   return `请分析以下学习资料，并基于用户的学习目标、基础水平和时间限制，生成结构化的知识分析报告。
 
 ## 用户信息
 文件名：${input.fileName}
 学习目标：${input.purpose}
 当前水平：${input.level}
 可用时间：${input.timeLimit}
 
 ## 资料内容
 ${input.content.slice(0, 6000)}${input.content.length > 6000 ? "\n\n（内容过长，已截取前6000字符）" : ""}
 
 ## 输出要求
 请严格按照以下 JSON 结构输出：
 
 {
   "fileTitle": "文件标题",
   "userGoal": "用户的学习目的",
   "learningProfile": {
     "purpose": "学习目标",
     "level": "基础水平",
     "timeLimit": "时间限制"
   },
   "summary": "对资料的简要总结，200字以内",
   "knowledgeMap": [
     {
       "title": "一级模块标题",
       "summary": "模块说明",
       "type": "concept|skill|tool|project|exam",
       "importance": 1-5,
       "difficulty": 1-5,
       "priority": 1-5,
       "reason": "为什么这个模块重要/不重要（基于用户目标的分析）",
       "canSkip": false,
       "children": [
         {
           "title": "二级知识点",
           "summary": "知识点说明",
           "type": "concept|skill|tool|project|exam",
           "importance": 1-5,
           "difficulty": 1-5,
           "priority": 1-5,
           "reason": "判断依据",
           "canSkip": false,
           "children": []
         }
       ]
     }
   ],
   "keyPoints": [
     {
       "title": "重点内容",
       "reason": "为什么是重点（必须结合用户目标给出具体分析）",
       "relatedGoal": "与哪个学习目标相关",
       "priority": 1-5
     }
   ],
   "difficultPoints": [
     { "title": "难点", "reason": "为什么难", "priority": 1-5 }
   ],
   "skipSuggestions": [
     { "title": "可跳过内容", "reason": "为什么建议跳过" }
   ],
   "learningPath": [
     { "step": 1, "title": "第一步", "estimatedTime": "预计时间", "nodes": ["涉及的知识点"] }
   ],
   "practiceQuestions": [
     { "id": "q1", "type": "choice|blank|true_false|short_answer", "question": "题目", "answer": "答案", "explanation": "解析" }
   ]
 }
 
 ## 重要要求
 - importance/difficulty/priority 都是 1-5 的数字
 - 每个重点、难点、建议跳过，都必须有 reason（判断依据）
 - reason 必须结合用户的具体目标给出分析，不能泛泛而谈
 - knowledgeMap 至少 3 个一级模块，每个模块至少 2 个子节点
 - learningPath 根据可用时间生成合理的步数（1天=3步，3天=4步，7天=5步，30天=7步）
 - practiceQuestions 生成 3-5 道题`;
 }
 
 export function buildFileAnalysisMockResponse(input: FileAnalysisRequest): string {
   const { content, purpose, level, timeLimit, fileName } = input;
   const topicWords = extractTopicWords(content);
   const mainTopic = topicWords[0] || "学习内容";
   const subTopics = topicWords.slice(1, 6);
   const stepCount = timeLimit === "1天" ? 3 : timeLimit === "3天" ? 4 : timeLimit === "7天" ? 5 : 7;
   const questionCount = timeLimit === "1天" ? 3 : 5;
   const isExam = purpose.includes("考试") || purpose.includes("考研") || purpose.includes("考证");
   const isPractice = purpose === "软件实操" || purpose === "项目制作";
 
   const modules = [
     {
       title: mainTopic + "基础概念",
       summary: "理解" + mainTopic + "的核心定义和基本原理，这是后续学习的基础。",
       type: "concept" as const,
       importance: isExam ? 5 : 4,
       difficulty: 2,
       priority: 5,
       reason: "作为整个知识体系的基础，" + (isExam ? "考试中常以概念题出现。" : "所有后续操作都建立在这些概念之上。"),
       canSkip: level === "已经会基础" || level === "想快速复习",
       children: [
         { title: mainTopic + "的定义与范畴", summary: "明确" + mainTopic + "解决什么问题。", type: "concept" as const, importance: 5, difficulty: 1, priority: 5, reason: "知识体系的起点，必须掌握。", canSkip: false, children: [] as Record<string, unknown>[] },
         { title: "核心原理", summary: "理解" + mainTopic + "的核心机制。", type: "concept" as const, importance: 4, difficulty: 3, priority: 4, reason: isExam ? "考试重点考察内容。" : "理解原理才能灵活应用。", canSkip: false, children: [] as Record<string, unknown>[] },
       ],
     },
     {
       title: isPractice ? mainTopic + "实操技能" : mainTopic + "核心方法",
       summary: isPractice ? "掌握" + mainTopic + "的实际操作步骤和工具使用。" : "学习" + mainTopic + "的核心方法和分析框架。",
       type: (isPractice ? "skill" : "concept") as "skill" | "concept",
       importance: isPractice ? 5 : 4,
       difficulty: 3,
       priority: isPractice ? 5 : 4,
       reason: isPractice ? "你的目标是" + purpose + "，这部分直接对应实际操作能力。" : "掌握方法才能解决实际问题。" + (isExam ? "考试中的大题经常考查方法应用。" : ""),
       canSkip: false,
       children: [
         { title: subTopics[0] || mainTopic + "基本操作", summary: "最常用的操作和步骤。", type: isPractice ? "skill" as const : "concept" as const, importance: 5, difficulty: 3, priority: 5, reason: "高频使用，必须熟练。", canSkip: false, children: [] as Record<string, unknown>[] },
         { title: subTopics[1] || mainTopic + "进阶技巧", summary: "提升效率的关键技巧。", type: isPractice ? "tool" as const : "skill" as const, importance: 3, difficulty: 4, priority: 3, reason: timeLimit === "1天" ? "时间有限，可以先了解。" : "有一定难度，建议留出足够时间练习。", canSkip: timeLimit === "1天", children: [] as Record<string, unknown>[] },
       ],
     },
     {
       title: "综合应用与实践",
       summary: isExam ? "通过真题和模拟练习巩固所学知识。" : "将所学知识应用到真实场景中。",
       type: (isExam ? "exam" : "project") as "exam" | "project",
       importance: 5,
       difficulty: 4,
       priority: 5,
       reason: isExam ? "考试复习的核心目标是拿分，真题练习是最有效的方式。" + (timeLimit === "30天" ? "可以有计划地做完整套题。" : "优先做高频考点题。") : "学习的最终目的是应用，综合项目能检验真实掌握程度。",
       canSkip: false,
       children: [
         { title: isExam ? "典型真题解析" : "实际案例一", summary: isExam ? "分析考试题型和答题技巧。" : "一个完整的实战案例。", type: isExam ? "exam" as const : "project" as const, importance: 5, difficulty: 4, priority: 5, reason: "直接对应学习目标的核心产出。", canSkip: false, children: [] as Record<string, unknown>[] },
         { title: isExam ? "易错题总结" : "独立实践任务", summary: isExam ? "整理常见错误和陷阱。" : "一个可以自己完成的练习任务。", type: isExam ? "exam" as const : "project" as const, importance: 4, difficulty: 4, priority: 4, reason: "通过实践发现问题，针对性改进。", canSkip: false, children: [] as Record<string, unknown>[] },
       ],
     },
   ];
   if (subTopics.length >= 3) {
     modules.push({
       title: subTopics[2] + "专题",
       summary: "深入" + subTopics[2] + "相关的高级话题。",
       type: "concept" as const,
       importance: 3,
       difficulty: 4,
       priority: 3,
       reason: timeLimit === "30天" || timeLimit === "7天" ? "在有足够时间的情况下深入学习。" : "时间有限，建议优先掌握基础内容。",
       canSkip: timeLimit === "1天" || timeLimit === "3天",
       children: [
         { title: subTopics[2], summary: "深入了解" + subTopics[2] + "的核心内容。", type: "concept" as const, importance: 3, difficulty: 4, priority: 3, reason: "进阶内容，打好基础后再学。", canSkip: timeLimit === "1天", children: [] as Record<string, unknown>[] },
       ],
     });
   }
 
   const paths = [];
   for (let i = 0; i < stepCount; i++) {
     const modIdx = Math.min(i, modules.length - 1);
     const mod = modules[modIdx];
     paths.push({
       step: i + 1,
       title: "第" + (i + 1) + "步：" + (mod ? mod.title : "综合复习"),
       estimatedTime: timeLimit === "1天" ? (i === 0 ? "4小时" : "2小时") : timeLimit === "3天" ? (i === 0 ? "半天" : "3小时") : "1天",
       nodes: mod ? [mod.title, ...mod.children.map((c: Record<string, unknown>) => c.title)] : ["全部内容复习"],
     });
   }
 
   const questions = [];
   for (let i = 0; i < questionCount; i++) {
     const types = ["choice", "true_false", "blank", "short_answer", "choice"];
     questions.push({
       id: "q" + (i + 1),
       type: types[i % types.length],
       question: "关于「" + mainTopic + "」的" + (i + 1) + "题" + (isExam ? "（考试常见题型）" : ""),
       answer: "参考答案：这是" + (subTopics[i] || mainTopic) + "的核心内容。",
       explanation: "本题考查对" + (subTopics[0] || mainTopic) + "的理解。" + (isExam ? "考试中这类题要注意审题。" : "建议结合实例加深理解。"),
     });
   }
 
   const result = {
     fileTitle: fileName || mainTopic + "学习资料",
     userGoal: purpose,
     learningProfile: { purpose, level, timeLimit },
     summary: "这份资料主要介绍了「" + mainTopic + "」的相关知识" + (subTopics.length > 0 ? "，涵盖" + subTopics.slice(0, 3).join("、") + "等方面" : "") + "。根据你的目标（" + purpose + "）和当前水平（" + level + "），AI 为你规划了" + modules.length + "个学习模块，共" + stepCount + "步学习路径。",
     knowledgeMap: modules,
     keyPoints: modules.filter(m => m.priority >= 4).map(m => ({
       title: m.title,
       reason: m.reason,
       relatedGoal: purpose,
       priority: m.priority,
     })),
     difficultPoints: modules.filter(m => m.difficulty >= 4).map(m => ({
       title: m.title,
       reason: "内容较为抽象，" + (isExam ? "需要结合真题理解。" : "需要动手实践才能掌握。") + (level === "零基础" ? "建议先打好基础再学习。" : ""),
       priority: m.difficulty,
     })),
     skipSuggestions: modules.filter(m => m.canSkip).map(m => ({
       title: m.title,
       reason: m.reason,
     })),
     learningPath: paths,
     practiceQuestions: questions,
   };
 
   return JSON.stringify(result);
 }
 
 function extractTopicWords(content: string): string[] {
   const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
   const headingLines = lines.filter(l => /^#{1,3}\s/.test(l) || /^[A-Z][a-zA-Z\s]{2,50}$/.test(l));
   const words: string[] = [];
   for (const line of headingLines) {
     const clean = line.replace(/^#{1,3}\s*/, "").replace(/[#*_\[\]]/g, "").trim();
     if (clean.length > 1 && clean.length < 50) words.push(clean);
   }
   if (words.length >= 3) return words.slice(0, 8);
   const sentences = content.match(/[^。！？\n]+[。！？]/g) || [];
   for (const s of sentences.slice(0, 5)) {
     const nouns = s.replace(/[，,。、；：""''（）()""''\d]/g, " ").split(/\s+/).filter(w => w.length >= 2 && w.length <= 20);
     words.push(...nouns.slice(0, 2));
   }
   const unique = [...new Set(words)].filter(w => w.length >= 2);
   return unique.length > 0 ? unique : [content.slice(0, Math.min(content.length, 20)), "基础知识", "核心技能", "实践应用"];
 }
