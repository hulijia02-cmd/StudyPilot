import type { DailyPlan, KnowledgeNode, LearningProgram } from "@/lib/mockLearningData";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type AIProvider = "openai" | "deepseek" | "qwen" | "mock";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type PlanSeed = {
  goal: string;
  domain: string;
  outcome: string;
  modules: Array<{
    title: string;
    summary?: string;
    description?: string;
    children: Array<string | { title?: string; name?: string }>;
  }>;
  recommendedTasks: string[];
  aiSuggestion: string;
};

export type AIResult<T> = {
  data: T;
  provider: AIProvider;
  model: string;
  fallback: boolean;
  fallbackReason?: string;
};

export type PracticeQuestion = {
  id: string;
  type: "choice" | "blank" | "true_false" | "short_answer" | "project";
  question: string;
  answer: string;
  explanation: string;
  options?: string[];
};

export type KnowledgeExplanation = {
 topic: string;
  definition: string;
 oneSentence: string;
 lifeExample: string;
  whyImportant: string;
  designApplication: string;
 keyPoints: string[];
  difficultPoints: string[];
  examPoints: string[];
  commonMistakes: string[];
  summary: string;
};

export function getAIConfig() {
  const providerFromEnv = getEnvValue("AI_PROVIDER", "AI PROVIDER")?.toLowerCase() ?? "mock";
  const openAIKey = getEnvValue("OPENAI_API_KEY", "OPENAI API KEY");
  const deepSeekKey = getEnvValue("DEEPSEEK_API_KEY", "DEEPSEEK API KEY");
  const dashScopeKey = getEnvValue("DASHSCOPE_API_KEY", "DASHSCOPE API KEY");

  if (providerFromEnv === "openai" && openAIKey) {
    return {
      provider: "openai" as const,
      apiKey: openAIKey,
      baseUrl: getEnvValue("OPENAI_BASE_URL", "OPENAI BASE URL") ?? "https://api.openai.com/v1",
      model: getEnvValue("OPENAI_MODEL", "OPENAI MODEL") ?? "gpt-4o-mini",
    };
  }

  if (providerFromEnv === "deepseek" && deepSeekKey) {
    return {
      provider: "deepseek" as const,
      apiKey: deepSeekKey,
      baseUrl: getEnvValue("DEEPSEEK_BASE_URL", "DEEPSEEK BASE URL") ?? "https://api.deepseek.com",
      model: getEnvValue("DEEPSEEK_MODEL", "DEEPSEEK MODEL") ?? "deepseek-chat",
    };
  }

  if (providerFromEnv === "qwen" && dashScopeKey) {
    return {
      provider: "qwen" as const,
      apiKey: dashScopeKey,
      baseUrl: getEnvValue("DASHSCOPE_BASE_URL", "DASHSCOPE BASE URL") ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: getEnvValue("DASHSCOPE_MODEL", "DASHSCOPE MODEL") ?? "qwen-plus",
    };
  }

  return {
    provider: "mock" as const,
    apiKey: "",
    baseUrl: "",
    model: "dynamic-mock",
  };
}

export function getEnvValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value?.trim()) {
      return value.trim();
    }
  }

  const localEnv = readLocalEnvFile();
  for (const name of names) {
    const normalizedName = normalizeEnvName(name);
    const value = localEnv[normalizedName];
    if (value?.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readLocalEnvFile() {
  const envFiles = [".env.local", ".env"];
  const values: Record<string, string> = {};

  for (const file of envFiles) {
    const filePath = join(process.cwd(), file);
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalIndex = trimmed.indexOf("=");
      if (equalIndex <= 0) {
        continue;
      }

      const rawKey = trimmed.slice(0, equalIndex).trim();
      const rawValue = trimmed.slice(equalIndex + 1).trim();
      values[normalizeEnvName(rawKey)] = stripEnvQuotes(rawValue);
    }
  }

  return values;
}

function normalizeEnvName(name: string) {
  return name.replace(/[\s-]+/g, "_").toUpperCase();
}

function stripEnvQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export async function generateLearningPlan(goal: string): Promise<AIResult<LearningProgram>> {
  const normalizedGoal = normalizeGoal(goal);
  const config = getAIConfig();

  if (config.provider === "mock") {
    return makeResult(createDynamicProgram(normalizedGoal), config, false);
  }

  try {
    const content = await callOpenAICompatible(
      config,
      [
        {
          role: "system",
          content:
            "你是 StudyPilot 的 Learning Planner Agent。你负责学习规划，不是聊天机器人。你必须输出严格 JSON，不要输出 Markdown。",
        },
        {
          role: "user",
          content: `请为学习目标「${normalizedGoal}」生成学习规划种子。
为了保证系统稳定，你只输出精简 JSON，不要生成 30 天完整计划。

必须输出如下 JSON：
{
  "goal": "string",
  "domain": "string",
  "outcome": "string",
  "recommendedTasks": ["string"],
  "modules": [
    {
      "title": "模块名",
      "summary": "模块说明",
      "children": ["知识点1", "知识点2", "知识点3"]
    }
  ],
  "aiSuggestion": "string"
}

要求：
1. modules 必须正好 8 个。
2. 每个 module 至少 3 个 children。
3. 内容必须围绕「${normalizedGoal}」，不能固定 Arduino。
4. 面向零基础学习者，语言清晰、具体、可执行。
5. 只输出 JSON。`,
        },
      ],
      { responseFormat: "json_object" },
    );

    return makeResult(programFromSeed(planSeedFromAIContent(content, normalizedGoal), normalizedGoal), config, false);
  } catch (error) {
    return makeResult(createDynamicProgram(normalizedGoal), config, true, formatFallbackReason(error));
  }
}

export async function generateKnowledgeExplanation(input: {
  goal: string;
  topic: string;
}): Promise<AIResult<KnowledgeExplanation>> {
  const goal = normalizeGoal(input.goal);
  const topic = input.topic.trim() || goal;
  const config = getAIConfig();

  if (config.provider === "mock") {
    return makeResult(createMockKnowledge(goal, topic), config, false);
  }

  try {
    const content = await callOpenAICompatible(config, [
      {
        role: "system",
        content:
          "你是 StudyPilot 的 Knowledge Agent。你负责把知识讲给零基础用户。必须输出严格 JSON，不要 Markdown。",
      },
      {
        role: "user",
        content: `学习目标：${goal}
知识点：${topic}

输出 JSON：
{
  "topic": "string",
  "oneSentence": "一句话解释",
  "lifeExample": "生活例子",
  "keyPoints": ["重点"],
  "difficultPoints": ["难点"],
  "examPoints": ["考点"],
  "commonMistakes": ["易错点"],
  "summary": "总结"
}`,
      },
    ]);

    return makeResult(parseJson<KnowledgeExplanation>(content), config, false);
  } catch (error) {
    return makeResult(createMockKnowledge(goal, topic), config, true, formatFallbackReason(error));
  }
}

export async function chatWithTeacher(input: {
  goal: string;
  question: string;
  selectedNode?: KnowledgeNode;
}): Promise<AIResult<{ answer: string }>> {
  const goal = normalizeGoal(input.goal);
  const question = input.question.trim();
  const config = getAIConfig();

  if (config.provider === "mock") {
    return makeResult({ answer: createMockChatAnswer(goal, question, input.selectedNode) }, config, false);
  }

  try {
    const content = await callOpenAICompatible(config, [
      {
        role: "system",
        content:
          "你是 StudyPilot 的 AI 老师。你负责规划、讲解、练习、评估、复盘。你必须围绕当前学习目标回答，不要泛泛聊天。",
      },
      {
        role: "user",
        content: `当前学习目标：${goal}
当前知识点：${input.selectedNode?.title ?? "未选择"}
知识点摘要：${input.selectedNode?.summary ?? "无"}
用户问题：${question}

请用适合零基础学习者的方式回答，并给出下一步学习动作。`,
      },
    ]);

    return makeResult({ answer: content }, config, false);
  } catch (error) {
    return makeResult({ answer: createMockChatAnswer(goal, question, input.selectedNode) }, config, true, formatFallbackReason(error));
  }
}

export async function generateMindmap(goal: string): Promise<AIResult<{ markdown: string }>> {
  const normalizedGoal = normalizeGoal(goal);
  const config = getAIConfig();

  if (config.provider === "mock") {
    return makeResult({ markdown: createMockMindmap(normalizedGoal) }, config, false);
  }

  try {
    const content = await callOpenAICompatible(config, [
      {
        role: "system",
        content: "你是 StudyPilot 的 MindMap Agent。你只输出兼容 Markmap 的 Markdown。",
      },
      {
        role: "user",
        content: `根据学习目标「${normalizedGoal}」生成三级知识树：
学习阶段 -> 核心模块 -> 具体知识点。
请标注重点、难点、项目、已掌握状态。
内容必须围绕「${normalizedGoal}」。`,
      },
    ]);

    return makeResult({ markdown: content }, config, false);
  } catch (error) {
    return makeResult({ markdown: createMockMindmap(normalizedGoal) }, config, true, formatFallbackReason(error));
  }
}

export async function generatePractice(
  goal: string,
  topic?: string,
): Promise<AIResult<{ questions: PracticeQuestion[] }>> {
  const normalizedGoal = normalizeGoal(goal);
  const normalizedTopic = topic?.trim() || "核心知识点";
  const config = getAIConfig();

  if (config.provider === "mock") {
    return makeResult({ questions: createMockPractice(normalizedGoal, normalizedTopic) }, config, false);
  }

  try {
    const content = await callOpenAICompatible(config, [
      {
        role: "system",
        content:
          "你是 StudyPilot 的 Practice Agent。你负责生成练习题和标准答案。必须输出严格 JSON，不要 Markdown。",
      },
      {
        role: "user",
        content: `学习目标：${normalizedGoal}
练习主题：${normalizedTopic}

请生成选择题、填空题、判断题、简答题、项目题。
输出 JSON：
{
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "题干",
      "answer": "标准答案",
      "explanation": "解析"
    }
  ]
}`,
      },
    ]);

    return makeResult(parseJson<{ questions: PracticeQuestion[] }>(content), config, false);
  } catch (error) {
    return makeResult({ questions: createMockPractice(normalizedGoal, normalizedTopic) }, config, true, formatFallbackReason(error));
  }
}

export async function generateReview(goal: string): Promise<AIResult<{ review: string }>> {
  const normalizedGoal = normalizeGoal(goal);
  const config = getAIConfig();

  if (config.provider === "mock") {
    return makeResult({ review: createMockReview(normalizedGoal) }, config, false);
  }

  try {
    const content = await callOpenAICompatible(config, [
      {
        role: "system",
        content:
          "你是 StudyPilot 的 Review Agent。你负责学习分析、学习复盘、遗忘曲线复习建议。",
      },
      {
        role: "user",
        content: `请为「${normalizedGoal}」生成今日学习复盘，包括掌握情况、薄弱点、明日复习、遗忘曲线提醒。`,
      },
    ]);

    return makeResult({ review: content }, config, false);
  } catch (error) {
    return makeResult({ review: createMockReview(normalizedGoal) }, config, true, formatFallbackReason(error));
  }
}

async function callOpenAICompatible(
  config: Exclude<ReturnType<typeof getAIConfig>, { provider: "mock" }>,
  messages: Message[],
  options?: { responseFormat?: "json_object" },
) {
  const requestBody: {
    model: string;
    messages: Message[];
    temperature: number;
    max_tokens: number;
    stream: boolean;
    response_format?: { type: "json_object" };
  } = {
    model: config.model,
    messages,
    temperature: 0.4,
    max_tokens: 2200,
    stream: false,
  };

  if (options?.responseFormat === "json_object") {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`${config.provider} API failed: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${config.provider} API returned empty content`);
  }

  return content;
}

function makeResult<T>(
  data: T,
  config: ReturnType<typeof getAIConfig>,
  fallback: boolean,
  fallbackReason?: string,
): AIResult<T> {
  return {
    data,
    provider: fallback ? "mock" : config.provider,
    model: fallback ? `dynamic-mock-from-${config.provider}` : config.model,
    fallback,
    fallbackReason,
  };
}

function formatFallbackReason(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._\-\/+=]+/g, "Bearer ***");
}

function parseJson<T>(content: string): T {
  const clean = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain a JSON object");
  }
  return JSON.parse(clean.slice(start, end + 1)) as T;
}

function planSeedFromAIContent(content: string, goal: string): PlanSeed {
  try {
    return parseJson<PlanSeed>(content);
  } catch {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const modules: PlanSeed["modules"] = [];
    let currentModule: PlanSeed["modules"][number] | null = null;

    for (const line of lines) {
      const clean = line
        .replace(/^[-*\d.、\s]+/, "")
        .replace(/^["']?(title|模块|module)["']?\s*[:：]\s*/i, "")
        .replace(/,$/, "")
        .trim();
      const moduleMatch =
        clean.match(/^(M\d+|第[一二三四五六七八九十]+[阶段模块]|模块\s*\d+)[:：.\s-]*(.+)$/i) ??
        clean.match(/^["']?title["']?\s*[:：]\s*["']?([^"',，]+)["']?/i);

      if (moduleMatch && modules.length < 8) {
        currentModule = {
          title: cleanNodeText(moduleMatch[2] ?? moduleMatch[1]),
          summary: `学习「${goal}」的关键模块。`,
          children: [],
        };
        modules.push(currentModule);
        continue;
      }

      const childMatch =
        clean.match(/^["']?children["']?\s*[:：]\s*(.+)$/i) ??
        clean.match(/^["']?name["']?\s*[:：]\s*["']?([^"',，]+)["']?/i) ??
        clean.match(/^["']?title["']?\s*[:：]\s*["']?([^"',，]+)["']?/i);
      if (currentModule && childMatch && currentModule.children.length < 4) {
        currentModule.children.push(cleanNodeText(childMatch[1]));
      }
    }

    return {
      goal,
      domain: `${goal} / AI 动态规划`,
      outcome: `系统掌握「${goal}」核心知识，并完成可展示成果。`,
      recommendedTasks: [
        `先建立「${goal}」的全局地图`,
        `完成第一个核心知识点练习`,
        `让 AI 老师讲解一个难点并复述`,
      ],
      modules: ensurePlanModules(goal, modules),
      aiSuggestion: `建议先按 AI 生成的模块顺序学习「${goal}」，每天完成讲解、练习、复盘三个动作。`,
    };
  }
}

function cleanNodeText(text: string) {
  return text
    .replace(/[{}",[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ensurePlanModules(goal: string, modules: PlanSeed["modules"]) {
  const filled = modules
    .filter((item) => item.title)
    .slice(0, 8)
    .map((item, index) => ({
      title: item.title,
      summary: item.summary || item.description || `学习「${goal}」第 ${index + 1} 个核心模块。`,
      children:
        item.children.length > 0
          ? item.children
          : [`${item.title}基础`, `${item.title}例子`, `${item.title}练习`],
    }));

  while (filled.length < 8) {
    const index = filled.length + 1;
    filled.push({
      title: `${goal}模块 ${index}`,
      summary: `学习「${goal}」的第 ${index} 个核心部分。`,
      children: [`核心概念 ${index}`, `典型案例 ${index}`, `练习任务 ${index}`],
    });
  }

  return filled;
}

function normalizeGoal(goal: string) {
  return goal.trim() || "新的学习目标";
}

function programFromSeed(seed: PlanSeed, goal: string): LearningProgram {
  const fallback = createDynamicProgram(goal);
  const modules =
    Array.isArray(seed.modules) && seed.modules.length >= 4
      ? seed.modules.slice(0, 8).map((item, index) => ({
          title: item.title || fallback.tree[index]?.title || `模块 ${index + 1}`,
          summary: item.summary || item.description || fallback.tree[index]?.summary || `学习「${goal}」的核心模块。`,
          type: fallback.tree[index]?.type ?? "concept",
          children:
            Array.isArray(item.children) && item.children.length > 0
              ? item.children.slice(0, 4).map((child) => normalizePlanChild(child))
              : fallback.tree[index]?.children.map((child) => child.title) ?? ["基础概念", "典型例子", "练习任务"],
        }))
      : fallback.tree.map((node) => ({
          title: node.title,
          summary: node.summary,
          type: node.type,
          children: node.children.map((child) => child.title),
        }));

  const profile = {
    domain: seed.domain || fallback.domain,
    outcome: seed.outcome || fallback.outcome,
    action: modules[0]?.children[0] ? `完成「${modules[0].children[0]}」练习` : fallback.recommendedTasks[0],
    modules,
  };

  return {
    goal: seed.goal || goal,
    domain: profile.domain,
    outcome: profile.outcome,
    recommendedTasks:
      Array.isArray(seed.recommendedTasks) && seed.recommendedTasks.length > 0
        ? seed.recommendedTasks.slice(0, 3)
        : fallback.recommendedTasks,
    plan: createPlan(goal, profile),
    tree: profile.modules.map((item, index) => createNode(goal, item, index)),
    progress: 8,
    aiSuggestion: seed.aiSuggestion || fallback.aiSuggestion,
  };
}

function normalizePlanChild(child: string | { title?: string; name?: string }) {
  if (typeof child === "string") {
    return child;
  }

  return child.title || child.name || "核心知识点";
}

function createDynamicProgram(goal: string): LearningProgram {
  const profile = getProfile(goal);
  return {
    goal,
    domain: profile.domain,
    outcome: profile.outcome,
    recommendedTasks: [
      `完成「${profile.modules[0].title}」导学，建立全局认知`,
      `练习「${profile.modules[1].children[0]}」，用自己的话解释`,
      `做一个 15 分钟小任务：${profile.action}`,
    ],
    plan: createPlan(goal, profile),
    tree: profile.modules.map((module, index) => createNode(goal, module, index)),
    progress: goal.includes("Arduino") ? 32 : 8,
    aiSuggestion: `先学「${profile.modules[0].title}」，再进入「${profile.modules[1].title}」，今天只追求完成一个可验证的小练习。`,
  };
}

function getProfile(goal: string) {
  if (goal.includes("英语四级") || goal.toLowerCase().includes("cet")) {
    return {
      domain: "英语四级 / 听读写译 / 应试能力",
      outcome: "掌握四级核心词汇、听力策略、阅读题型、写译模板，并形成稳定刷题复盘节奏",
      action: "背 20 个高频词，完成 1 篇阅读和 1 段听力精听",
      modules: [
        module("考试认知", "了解四级题型、分值、时间分配和备考路线。", "concept", ["题型结构", "分值策略", "时间规划"]),
        module("核心词汇", "掌握高频词、词根词缀和语境记忆。", "skill", ["高频词", "词根词缀", "熟词僻义"]),
        module("听力训练", "从关键词、转折词和场景词抓答案。", "skill", ["短篇新闻", "长对话", "篇章听力"]),
        module("阅读理解", "训练定位、同义替换和长难句拆解。", "skill", ["选词填空", "段落匹配", "仔细阅读"]),
        module("写作模板", "建立开头、论证、例子和结尾模板。", "tool", ["观点表达", "连接词", "模板改写"]),
        module("翻译能力", "训练中文信息拆分和英文表达转换。", "skill", ["主干提取", "短语转换", "文化词汇"]),
        module("真题实战", "按真实时间完成整套题并复盘。", "project", ["限时训练", "错题分析", "分数预测"]),
        module("复盘冲刺", "按遗忘曲线复习错词、错题和模板。", "exam", ["错词回顾", "题型补弱", "考前节奏"]),
      ],
    };
  }

  if (goal.includes("数学") || goal.toLowerCase().includes("math")) {
    return {
      domain: "数学思维 / 建模 / 解题能力",
      outcome: "理解核心概念，建立解题步骤，并能把数学用于真实问题分析",
      action: "把一个概念画成图，再做 3 道基础题",
      modules: [
        module("数学认知", "理解这门数学内容解决什么问题，以及为什么要学。", "concept", ["学习目标", "先修知识", "常见误区"]),
        module("核心概念", "建立定义、符号、图像之间的对应关系。", "concept", ["定义理解", "符号语言", "图像直觉"]),
        module("基础运算", "掌握最小必需的计算规则。", "skill", ["公式变形", "代数操作", "单位量纲"]),
        module("解题模型", "把题目拆成已知、未知、关系、步骤。", "skill", ["题型识别", "步骤模板", "反例检查"]),
        module("应用场景", "把数学用于设计、数据、工程或生活问题。", "project", ["比例关系", "估算", "建模"]),
        module("错题诊断", "从错题里定位概念、计算、审题或策略问题。", "exam", ["错因分类", "重做策略", "迁移练习"]),
        module("综合项目", "完成一个可展示的小项目或案例分析。", "project", ["案例选择", "建模过程", "结果解释"]),
        module("复习考核", "用间隔复习和综合题确认真正掌握。", "exam", ["知识回忆", "限时练习", "复盘报告"]),
      ],
    };
  }

  if (goal.includes("设计") || goal.toLowerCase().includes("design")) {
    return {
      domain: "设计基础 / 视觉表达 / 产品体验",
      outcome: "做出结构清晰、视觉统一、可解释的设计方案",
      action: "临摹一个优秀界面，并标出层级、间距、颜色和字体",
      modules: [
        module("设计认知", "理解设计不是装饰，而是解决信息表达和使用问题。", "concept", ["设计目标", "用户场景", "评价标准"]),
        module("视觉层级", "让用户一眼知道先看什么、后看什么。", "concept", ["大小对比", "留白", "重点引导"]),
        module("版式网格", "用网格和对齐建立秩序感。", "tool", ["栅格", "对齐", "间距"]),
        module("字体颜色", "通过字体、颜色和对比控制情绪和可读性。", "skill", ["字体层级", "色彩角色", "对比度"]),
        module("组件设计", "把按钮、卡片、表单做成可复用模块。", "skill", ["状态", "一致性", "点击区域"]),
        module("交互流程", "让用户知道当前在哪、下一步做什么。", "skill", ["导航", "反馈", "错误处理"]),
        module("作品实战", "完成一套可展示的 App 或小程序页面。", "project", ["首页", "核心流程", "展示说明"]),
        module("设计评审", "用标准检查设计是否清晰、可用、一致。", "exam", ["可读性", "一致性", "完成度"]),
      ],
    };
  }

  return {
    domain: goal.includes("Arduino") ? "Arduino / 创客硬件 / 入门嵌入式开发" : "通用自学 / 知识建构 / 项目实践",
    outcome: `系统掌握「${goal}」核心知识，并完成一个可展示成果`,
    action: `完成一个「${goal}」最小练习`,
    modules: [
      module("目标澄清", "明确学习边界、成果和评价标准。", "concept", ["目标", "边界", "成果"]),
      module("基础概念", "建立最小必要概念库。", "concept", ["定义", "例子", "反例"]),
      module("核心方法", "掌握最常用的操作步骤。", "skill", ["流程", "方法", "模板"]),
      module("工具资源", "找到合适工具、资料和练习环境。", "tool", ["资料", "工具", "案例"]),
      module("典型任务", "用真实任务检验理解。", "skill", ["任务拆解", "练习", "反馈"]),
      module("难点突破", "集中处理容易卡住的部分。", "concept", ["误区", "难点", "纠错"]),
      module("项目应用", "做一个能展示学习成果的小项目。", "project", ["选题", "制作", "展示"]),
      module("复盘考核", "用复盘和测试确认是否真正学会。", "exam", ["回忆", "测试", "改进"]),
    ],
  };
}

function module(title: string, summary: string, type: KnowledgeNode["type"], children: string[]) {
  return { title, summary, type, children };
}

function createPlan(goal: string, profile: ReturnType<typeof getProfile>): DailyPlan[] {
  return Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const current = profile.modules[Math.min(Math.floor(index / 4), profile.modules.length - 1)];
    return {
      day,
      title: `Day ${day}：${current.title}`,
      estimatedTime: day % 5 === 0 ? "45 分钟" : "30 分钟",
      focus: `围绕「${goal}」学习：${current.summary}`,
      practice: `练习：${current.children[index % current.children.length]}`,
      details: ["AI 讲解一个知识点", "完成一个小练习", "记录重点、难点和易错点"],
    };
  });
}

function createNode(goal: string, current: ReturnType<typeof module>, index: number): KnowledgeNode {
  return {
    id: `${goal}-${current.title}`.replace(/\s+/g, "-"),
    title: current.title,
    summary: current.summary,
    importance: index < 2 ? 5 : 4,
    difficulty: index < 2 ? 2 : index < 5 ? 3 : 4,
    status: index === 0 ? "learning" : "not_started",
    type: current.type,
    order: `第 ${index + 1} 步`,
    keyPoints: [`理解「${current.title}」解决什么问题`, "能举出例子", "能完成最小练习"],
    difficultPoints: [`容易把「${current.title}」当成孤立知识，而不是服务于「${goal}」`],
    examPoints: ["能说清定义", "能判断场景", "能做基础题"],
    practiceAdvice: `围绕「${current.title}」做 10 分钟练习，并写下结果。`,
    tags: [index < 2 ? "重点" : "基础", current.type === "project" ? "项目" : ""].filter(Boolean),
    children: current.children.map((child, childIndex) => ({
      id: `${goal}-${current.title}-${child}`.replace(/\s+/g, "-"),
      title: child,
      summary: `这是「${current.title}」模块下的核心知识点，用来支撑「${goal}」的真实应用。`,
      importance: childIndex < 2 ? 5 : 4,
      difficulty: childIndex === 0 ? 2 : 3,
      status: childIndex === 0 ? "learning" : "not_started",
      type: childIndex === 2 ? "project" : "concept",
      order: childIndex === 0 ? "先学" : childIndex === 1 ? "再学" : "最后练",
      keyPoints: [`知道「${child}」是什么`, `知道「${child}」什么时候用`, `能解释「${child}」`],
      difficultPoints: [`容易只记住「${child}」这个词，但不会用它解决问题`],
      examPoints: [`能解释「${child}」`, "能完成相关小题"],
      practiceAdvice: `用 3 句话解释「${child}」，再做一个与「${goal}」相关的小例子。`,
      tags: [childIndex < 2 ? "重点" : "练习"],
      children: [],
    })),
  };
}

function createMockKnowledge(goal: string, topic: string): KnowledgeExplanation {
  return {
    topic,
    oneSentence: `「${topic}」是学习「${goal}」时需要先建立直觉、再通过练习掌握的核心知识点。`,
    lifeExample: "就像学骑车，先知道车把、刹车和脚踏各自做什么，再上车练习，最后通过纠错形成稳定能力。",
    keyPoints: ["先理解它解决什么问题", "再看具体规则和例子", "最后用练习验证是否掌握"],
    difficultPoints: ["容易只背定义，不会迁移到真实题目或项目里"],
    examPoints: ["能解释定义", "能判断应用场景", "能完成基础练习"],
    commonMistakes: ["只看讲解不做题", "把相似概念混在一起", "没有复盘错误原因"],
    summary: `学习「${topic}」时，要把它放回「${goal}」的整体目标里理解。`,
  };
}

function createMockChatAnswer(goal: string, question: string, selectedNode?: KnowledgeNode) {
  const topic = selectedNode?.title ?? getProfile(goal).modules[0].title;
  if (question.includes("怎么学") || question.includes("计划") || question.includes("路线")) {
    return `针对「${goal}」，建议按“全局认知 -> 核心概念 -> 方法练习 -> 项目应用 -> 复盘考核”学习。你现在先学「${topic}」，目标不是看懂，而是完成一个可检查的小练习。`;
  }
  if (question.includes("为什么") || question.toLowerCase().includes("why")) {
    return `原因是「${topic}」决定了你后续能不能把「${goal}」学成可迁移能力。先理解它解决什么问题，再用例子验证。`;
  }
  if (question.includes("练习") || question.includes("题")) {
    return `给你 3 个练习：1. 用一句话解释「${topic}」。2. 举一个和「${goal}」相关的例子。3. 做一个 10 分钟小任务并写下错误点。`;
  }
  return `我会围绕「${goal}」回答。你这个问题可以放在「${topic}」里理解：先抓定义，再看例子，最后做练习。下一步建议：写下你对「${topic}」的一句话解释。`;
}

function createMockMindmap(goal: string) {
  const profile = getProfile(goal);
  return [`# ${goal}`, ...profile.modules.map((item) => `## ${item.title}\n- ${item.summary}\n${item.children.map((child) => `- ${child}`).join("\n")}`)].join("\n");
}

function createMockPractice(goal: string, topic: string): PracticeQuestion[] {
  const topics = [topic, goal.slice(0, 8) + "??", goal.slice(0, 6) + "??", "????"].filter(Boolean);
  const choiceA = topics[0] || "????";
  const choiceB = topics[1] || "????";
  const choiceC = topics[2] || "????";
  const choiceD = "????";
  return [
    {
      id: "q1",
      type: "choice",
      question: `???${topic}????????????`,
      options: [`${choiceA}???${goal}???`, `${choiceB}??????${goal}???`, `${choiceC}?${goal}?????`, choiceD],
      answer: `${choiceA}???${goal}???`,
      explanation: `?${choiceA}?????${goal}???????????????????`,
    },
    {
      id: "q2",
      type: "blank",
      question: `???${topic}?????____????????????????`,
      answer: "??",
      explanation: "???????????????????????????????",
    },
    {
      id: "q3",
      type: "true_false",
      question: `??????${topic}??????????????${goal}??`,
      answer: "??",
      explanation: "?????????????????????????????",
    },
    {
      id: "q4",
      type: "short_answer",
      question: `?????????${topic}?????${goal}???????`,
      answer: `?${topic}???${goal}?????????????????`,
      explanation: "???????????????????",
    },
    {
      id: "q5",
      type: "project",
      question: `???????${topic}???????? 15 ??????`,
      answer: `??????${goal}??????????${topic}??????????????????`,
      explanation: "?????????????????????",
    },
  ];
}function createMockReview(goal: string) {
  return `今日复盘：你正在学习「${goal}」。建议回忆 3 个核心概念，重做 1 道错题，明天先复习今天最不熟的知识点，再进入新内容。`;
}
import { buildFileAnalysisSystemPrompt, buildFileAnalysisUserPrompt, buildFileAnalysisMockResponse } from "@/lib/ai/prompts/file-analysis";
import type { FileAnalysisRequest } from "@/lib/ai/schemas/file-analysis";
import type { FileAnalysisResult } from "@/types/learning";

export async function analyzeFileContent(input: FileAnalysisRequest): Promise<AIResult<FileAnalysisResult>> {
  const config = getAIConfig();

  if (config.provider === "mock") {
    const mockData = buildFileAnalysisMockResponse(input);
    return makeResult(JSON.parse(mockData) as FileAnalysisResult, config, false);
  }

  try {
    const content = await callOpenAICompatible(
      config,
      [
        { role: "system", content: buildFileAnalysisSystemPrompt() },
        { role: "user", content: buildFileAnalysisUserPrompt(input) },
      ],
      { responseFormat: "json_object" },
    );

    return makeResult(parseJson(content) as FileAnalysisResult, config, false);
  } catch (error) {
    const mockData = buildFileAnalysisMockResponse(input);
    return makeResult(JSON.parse(mockData) as FileAnalysisResult, config, true, formatFallbackReason(error));
  }
}
export type PracticeQuestionExtended = PracticeQuestion & {
  options?: string[];
  knowledgePoint?: string;
  multiCorrect?: string[];
};

export async function explainQuestion(input: { question: string; answer: string; goal?: string }): Promise<AIResult<{ explanation: string; example: string }>> {
  const config = getAIConfig();
  if (config.provider === "mock") {
    return makeResult({
      explanation: "这道题考察的是对知识点的理解。正确答案是「" + input.answer + "」。要记住核心要点：理解概念、掌握方法、多加练习。",
      example: "举个例子：在实际应用中，你可以通过以下步骤巩固这个知识点：1. 用自己的话解释概念 2. 找一个生活中的例子 3. 试着教给别人。",
    }, config, false);
  }
  try {
    const content = await callOpenAICompatible(config, [
      { role: "system", content: "你是 StudyPilot 的练习讲解助手。请解释这道题，并给出一个生活中的例子。必须输出严格 JSON。" },
      { role: "user", content: JSON.stringify({ question: input.question, answer: input.answer, goal: input.goal }) + "\n\n输出 JSON：{ \"explanation\": \"知识点讲解\", \"example\": \"生活例子\" }" },
    ], { responseFormat: "json_object" });
    return makeResult(parseJson(content) as { explanation: string; example: string }, config, false);
  } catch (error) {
    return makeResult({ explanation: "解析失败，请重试。", example: "暂时无法生成例子。" }, config, true, formatFallbackReason(error));
  }
}

export async function generateSimilarQuestion(input: { question: string; answer: string; goal?: string }): Promise<AIResult<{ question: string; answer: string; explanation: string }>> {
  const config = getAIConfig();
  if (config.provider === "mock") {
    return makeResult({
      question: "如果将题目中的条件稍作改变，你应该如何分析？请说明解题思路。",
      answer: "需要根据具体知识点调整分析思路。关键在于理解概念的本质，而不是死记硬背。",
      explanation: "举一反三是学习的关键。理解了一道题的解法，就能解决一类题。",
    }, config, false);
  }
  try {
    const content = await callOpenAICompatible(config, [
      { role: "system", content: "你是 StudyPilot 的出题助手。根据原题生成一道类似的题。必须输出严格 JSON。" },
      { role: "user", content: JSON.stringify(input) + "\n\n输出 JSON：{ \"question\": \"类似题目\", \"answer\": \"答案\", \"explanation\": \"解析\" }" },
    ], { responseFormat: "json_object" });
    return makeResult(parseJson(content) as { question: string; answer: string; explanation: string }, config, false);
  } catch (error) {
    return makeResult({ question: "请解释为什么这个知识点很重要。", answer: "因为它是后续学习的基础。", explanation: "基础不牢，地动山摇。" }, config, true, formatFallbackReason(error));
  }
}

export async function generatePracticeSummary(input: { correct: number; total: number; wrongTopics: string[]; goal?: string }): Promise<AIResult<{ summary: string; reviewAdvice: string }>> {
  const config = getAIConfig();
  if (config.provider === "mock") {
    const rate = Math.round(input.correct / input.total * 100);
    return makeResult({
      summary: "本次练习共完成" + input.total + "题，正确" + input.correct + "题（" + rate + "%）。" + (rate >= 80 ? "掌握情况良好，继续保持。" : rate >= 60 ? "基本掌握，建议复习薄弱知识点。" : "需要加强练习，建议重新学习基础概念。"),
      reviewAdvice: input.wrongTopics.length > 0 ? "建议优先复习：" + input.wrongTopics.slice(0, 3).join("、") + "。" : "当前知识点掌握较好，可以进入下一阶段学习。",
    }, config, false);
  }
  try {
    const content = await callOpenAICompatible(config, [
      { role: "system", content: "你是 StudyPilot 的学习分析助手。根据练习结果给出总结和复习建议。必须输出严格 JSON。" },
      { role: "user", content: JSON.stringify(input) + "\n\n输出 JSON：{ \"summary\": \"练习总结\", \"reviewAdvice\": \"复习建议\" }" },
    ], { responseFormat: "json_object" });
    return makeResult(parseJson(content) as { summary: string; reviewAdvice: string }, config, false);
  } catch (error) {
    return makeResult({ summary: "分析失败，请重试。", reviewAdvice: "建议重新学习相关知识点。" }, config, true, formatFallbackReason(error));
  }
}
