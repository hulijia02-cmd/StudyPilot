"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadMobileState, saveMobileState } from "@/lib/storage";
import { AiTeacherPage } from "@/components/mobile-app/ai-teacher-page";
import { BottomTabBar } from "@/components/mobile-app/bottom-tab-bar";
import { HomePage } from "@/components/mobile-app/home-page";
import { KnowledgeTreePage } from "@/components/mobile-app/knowledge-tree-page";
import { PlanPage } from "@/components/mobile-app/plan-page";
import { MaterialPage } from "@/components/mobile-app/material-page";
import type { KnowledgeExplanation } from "@/lib/aiClient";
import type { AppTab, ChatMessage, KnowledgeNode, KnowledgeType, LearningProgram } from "@/lib/mockLearningData";

type AIResponse<T> = {
  data: T;
  actualProvider?: string;
  actualModel?: string;
  fallback?: boolean;
  fallbackReason?: string;
};

type MindmapResponse = {
  markdown: string;
};

const emptyProgram: LearningProgram = {
  goal: "",
  domain: "",
  outcome: "",
  recommendedTasks: [],
  plan: [],
  tree: [],
  progress: 0,
  aiSuggestion: "",
};

export function StudyPilotMobileApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [goalInput, setGoalInput] = useState("");
  const [program, setProgram] = useState<LearningProgram | null>(null);
  const [expandedDay, setExpandedDay] = useState(1);
  const [expandedModuleId, setExpandedModuleId] = useState<string | undefined>();
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
      const [knowledgeExplanation, setKnowledgeExplanation] = useState<KnowledgeExplanation | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [aiStatus, setAiStatus] = useState("AI: \u7b49\u5f85\u5b66\u4e60\u76ee\u6807");
  const [error, setError] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);


  const restored = useRef(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const saved = loadMobileState();
    if (saved.goalInput) setGoalInput(saved.goalInput);
    if (saved.activeTab) setActiveTab(saved.activeTab as AppTab);
    if (saved.program) setProgram(saved.program as LearningProgram);
    if (saved.messages?.length) setMessages(saved.messages as ChatMessage[]);

    if (saved.expandedDay) setExpandedDay(saved.expandedDay);
    if (saved.expandedModuleId) setExpandedModuleId(saved.expandedModuleId);
    if (saved.aiStatus) setAiStatus(saved.aiStatus);
    if (saved.knowledgeExplanation) setKnowledgeExplanation(saved.knowledgeExplanation as KnowledgeExplanation);
  }, []);

  // Debounced save to localStorage on state changes
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMobileState({
        goalInput,
        activeTab,
        program,
        messages,
    
        selectedNode,
        knowledgeExplanation,
        expandedDay,
        expandedModuleId: expandedModuleId ?? null,
        aiStatus,
      });
    }, 800);
  }, [
    goalInput, activeTab, program, messages,
    selectedNode, knowledgeExplanation, expandedDay, expandedModuleId, aiStatus,
  ]);

  useEffect(() => {
    if (restored.current) scheduleSave();
  }, [scheduleSave]);

  const title = useMemo(() => {
    const labels: Record<AppTab, string> = {
      home: "\u9996\u9875",
      material: "\u8d44\u6599",
      plan: "\u5b66\u4e60\u8ba1\u5212",
      tree: "\u77e5\u8bc6\u6811",
      teacher: "AI\u8001\u5e08",
      // removed practice tab\u7ec3\u4e60",
    };
    return labels[activeTab];
  }, [activeTab]);

  async function handleStartLearning(nextGoal?: string) {
    const normalizedGoal = (nextGoal ?? goalInput).trim();
    if (normalizedGoal.length < 2 || isPlanning) {
      return;
    }
    setError("");
    setIsPlanning(true);
    setAiStatus("AI: \u6b63\u5728\u8c03\u7528 DeepSeek");
    setMessages([]);
    setKnowledgeExplanation(null);

    try {
      const planResult = await postAI<LearningProgram>("/api/generate-plan", { goal: normalizedGoal });
      const mindmapResult = await postAI<MindmapResponse>("/api/mindmap", { goal: normalizedGoal });
      const tree = parseMindmapToKnowledgeTree(mindmapResult.data.markdown, planResult.data.goal || normalizedGoal);
      if (tree.length === 0) throw new Error("AI \u77e5\u8bc6\u6811\u89e3\u6790\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5");
      const nextProgram: LearningProgram = { ...emptyProgram, ...planResult.data, goal: planResult.data.goal || normalizedGoal, tree };
      const firstNode = tree[0];
      setProgram(nextProgram);
      setGoalInput(nextProgram.goal);
      setExpandedDay(1);
      setExpandedModuleId(firstNode.id);
      setSelectedNode(firstNode);
      setAiStatus("AI: " + (planResult.actualProvider ?? "deepseek") + " / " + (planResult.actualModel ?? "deepseek-chat"));
      setActiveTab("plan");
      await Promise.all([
        loadKnowledgeExplanation(firstNode, nextProgram.goal),
        createInitialTeacherMessage(nextProgram, firstNode),
      ]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "AI \u8c03\u7528\u5931\u8d25";
      setError(message + "\u3002\u8bf7\u786e\u8ba4 CC Switch \u672c\u5730\u8def\u7531\u6b63\u5728\u8fd0\u884c\uff0c\u7136\u540e\u91cd\u8bd5\u3002");
      setAiStatus("AI: DeepSeek \u8c03\u7528\u5931\u8d25");
    } finally {
      setIsPlanning(false);
    }
  }

  function handleStartToday() {
    if (!program) { setActiveTab("home"); return; }
    setActiveTab("teacher");
    void askTeacher("\u8bf7\u6839\u636e\u5f53\u524d\u5b66\u4e60\u8ba1\u5212\uff0c\u5f00\u59cb\u4eca\u5929\u7b2c\u4e00\u8bfe\u3002");
  }

  function handleModuleToggle(id: string) { setExpandedModuleId(id); }

  function handleNodeSelect(node: KnowledgeNode) {
    setSelectedNode(node);
    if (program) void loadKnowledgeExplanation(node, program.goal);
  }

  async function loadKnowledgeExplanation(node: KnowledgeNode, goal: string) {
    setKnowledgeExplanation(null);
    setIsKnowledgeLoading(true);
    try {
      const result = await postAI<KnowledgeExplanation>("/api/ai/knowledge", { goal, topic: node.title });
      setKnowledgeExplanation(result.data);
      setAiStatus("AI: " + (result.actualProvider ?? "deepseek") + " / " + (result.actualModel ?? "deepseek-chat"));
    } catch {
      setKnowledgeExplanation(null);
      setAiStatus("AI: \u77e5\u8bc6\u8bb2\u89e3\u8c03\u7528\u5931\u8d25");
    } finally {
      setIsKnowledgeLoading(false);
    }
  }

  async function createInitialTeacherMessage(nextProgram: LearningProgram, node: KnowledgeNode) {
    const result = await postAI<{ answer: string }>("/api/chat", {
      goal: nextProgram.goal,
      question: "\u8bf7\u4ee5 AI \u8001\u5e08\u8eab\u4efd\u4e3b\u52a8\u5f00\u573a\u3002\u5148\u8bf4\u660e\u6211\u6b63\u5728\u5b66\u4e60\u300c" + nextProgram.goal + "\u300d\uff0c\u518d\u7528\u96f6\u57fa\u7840\u65b9\u5f0f\u4ecb\u7ecd\u7b2c\u4e00\u8bfe\u300c" + node.title + "\u300d\uff0c\u6700\u540e\u7ed9\u51fa\u4e0b\u4e00\u6b65\u884c\u52a8\u3002",
      selectedNode: node,
    });
    setMessages([{ id: "ai-init-" + Date.now(), role: "ai", content: result.data.answer }]);
  }

  async function handleSend() {
    const question = draft.trim();
    if (!question || !program || isTeacherLoading) return;
    setDraft("");
    setMessages((current) => [...current, { id: "user-" + Date.now(), role: "user", content: question }]);
    await askTeacher(question);
  }

  async function askTeacher(question: string) {
    if (!program || isTeacherLoading) return;
    setIsTeacherLoading(true);
    try {
      const recentContext = messages.slice(-6).map((m) => (m.role === "user" ? "\u7528\u6237" : "AI\u8001\u5e08") + "\uff1a" + m.content).join("\n");
      const result = await postAI<{ answer: string }>("/api/chat", {
        goal: program.goal,
        question: recentContext ? "\u6700\u8fd1\u5bf9\u8bdd\uff1a\n" + recentContext + "\n\n\u7528\u6237\u65b0\u95ee\u9898\uff1a" + question : question,
        selectedNode,
      });
      setMessages((current) => [...current, { id: "ai-" + Date.now(), role: "ai", content: result.data.answer }]);
      setAiStatus("AI: " + (result.actualProvider ?? "deepseek") + " / " + (result.actualModel ?? "deepseek-chat"));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "AI \u8001\u5e08\u8c03\u7528\u5931\u8d25";
      setMessages((current) => [...current, { id: "ai-error-" + Date.now(), role: "ai", content: message + "\u3002\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002" }]);
      setAiStatus("AI: DeepSeek \u8c03\u7528\u5931\u8d25");
    } finally {
      setIsTeacherLoading(false);
    }
  }

    async function handleQuickAction(label: string) {
    if (!program || isTeacherLoading) {
      if (!program) setActiveTab("home");
      return;
    }
    setMessages((current) => [...current, { id: "quick-" + Date.now(), role: "user", content: label }]);
    if (label === "\u751f\u6210\u7ec3\u4e60\u9898") {
      await askTeacher("\u8bf7\u5e2e\u6211\u51fa\u51e0\u9053\u7ec3\u4e60\u9898\uff0c\u6211\u4f1a\u76f4\u63a5\u5728\u5bf9\u8bdd\u6846\u56de\u7b54\u3002");
      return;
    }
    if (label === "\u751f\u6210\u601d\u7ef4\u5bfc\u56fe") {
      setIsTeacherLoading(true);
      try {
        const result = await postAI<MindmapResponse>("/api/mindmap", { goal: program.goal });
        setProgram((current) => current ? { ...current, tree: parseMindmapToKnowledgeTree(result.data.markdown, current.goal) } : current);
        setMessages((current) => [...current, { id: "ai-mindmap-" + Date.now(), role: "ai", content: result.data.markdown }]);
        setAiStatus("AI: " + (result.actualProvider ?? "deepseek") + " / " + (result.actualModel ?? "deepseek-chat"));
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "\u601d\u7ef4\u5bfc\u56fe\u751f\u6210\u5931\u8d25";
        setMessages((current) => [...current, { id: "ai-mindmap-error-" + Date.now(), role: "ai", content: message + "\u3002\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002" }]);
        setAiStatus("AI: \u601d\u7ef4\u5bfc\u56fe\u751f\u6210\u5931\u8d25");
      } finally { setIsTeacherLoading(false); }
    } else {
      await askTeacher(label);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-4 sm:px-6">
      <section className="relative h-[calc(100vh-32px)] w-full max-w-[430px] overflow-hidden rounded-[38px] border border-white bg-white shadow-[0_24px_80px_rgb(15_23_42/14%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
          <div className="h-1.5 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between px-5 pb-3 pt-8">
            <div>
              <p className="text-xs font-semibold text-slate-400">StudyPilot</p>
              <p className="text-lg font-bold text-slate-950">{title}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
              <p className="text-[10px] font-semibold text-slate-400">目标</p>
              <p className="max-w-32 truncate text-xs font-bold text-sky-700">{program?.goal ?? "未设置"}</p>
            </div>
          </div>
          <p className="px-5 pb-2 text-right text-[10px] font-semibold text-slate-400">{aiStatus}</p>
          <div className="relative flex-1 overflow-y-auto px-4 pb-28">
            {activeTab === "material" ? (<MaterialPage />) : null}
            {activeTab === "home" ? (<HomePage aiSuggestion={program?.aiSuggestion} error={error} goal={goalInput} isLoading={isPlanning} onGoalChange={setGoalInput} onStartLearning={handleStartLearning} progress={program?.progress} recommendedTasks={program?.recommendedTasks ?? []} />) : null}
            {activeTab === "plan" ? (<PlanPage expandedDay={expandedDay} goal={program?.goal} onDayToggle={(day) => setExpandedDay((c) => (c === day ? 0 : day))} onGoHome={() => setActiveTab("home")} onStartToday={handleStartToday} plans={program?.plan ?? []} />) : null}
            {activeTab === "tree" ? (<KnowledgeTreePage expandedModuleId={expandedModuleId} explanation={knowledgeExplanation} goal={program?.goal} isLoadingExplanation={isKnowledgeLoading} onGoHome={() => setActiveTab("home")} onModuleToggle={handleModuleToggle} onNodeSelect={handleNodeSelect} selectedNode={selectedNode} tree={program?.tree ?? []} />) : null}
            {activeTab === "teacher" ? (<AiTeacherPage draft={draft} goal={program?.goal} isLoading={isTeacherLoading} messages={messages} onDraftChange={setDraft} onGoHome={() => setActiveTab("home")} onQuickAction={handleQuickAction} onSend={handleSend} />) : null}
          </div>
          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </section>
    </main>
  );
}

function parseMindmapToKnowledgeTree(markdown: string, goal: string): KnowledgeNode[] {
  const lines = markdown.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const roots: KnowledgeNode[] = [];
  let currentRoot: KnowledgeNode | null = null;
  let currentChild: KnowledgeNode | null = null;
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = cleanNodeTitle(heading[2]);
      if (level === 1) continue;
      if (level <= 2) {
        currentRoot = createKnowledgeNode(title, goal, roots.length, "root");
        roots.push(currentRoot);
        currentChild = null;
      } else {
        if (!currentRoot) {
          currentRoot = createKnowledgeNode(goal, goal, roots.length, "root");
          roots.push(currentRoot);
        }
        currentChild = createKnowledgeNode(title, goal, currentRoot.children.length, "child");
        currentRoot.children.push(currentChild);
      }
      continue;
    }
    if (bullet) {
      const title = cleanNodeTitle(bullet[1]);
      if (!currentRoot) {
        currentRoot = createKnowledgeNode(goal, goal, roots.length, "root");
        roots.push(currentRoot);
      }
      if (!currentChild) {
        currentChild = createKnowledgeNode(title, goal, currentRoot.children.length, "child");
        currentRoot.children.push(currentChild);
      } else {
        currentChild.children.push(createKnowledgeNode(title, goal, currentChild.children.length, "leaf"));
      }
    }
  }

return roots.slice(0, 8).map((root, index) => ({
    ...root,
    order: "\u7b2c" + (index + 1) + "\u9636\u6bb5",
    children: root.children.slice(0, 6).map((child, childIndex) => ({
      ...child,
      order: "\u7b2c" + (index + 1) + "." + (childIndex + 1) + "\u6b65",
      children: child.children.slice(0, 6),
    })),
  }));
}

function createKnowledgeNode(title: string, goal: string, index: number, level: "root" | "child" | "leaf"): KnowledgeNode {
  const type = inferKnowledgeType(title);
  const difficulty = Math.min(5, Math.max(1, level === "root" ? index + 2 : index + 1)) as 1 | 2 | 3 | 4 | 5;
  const importance = (level === "root" || index < 2 ? 5 : 4) as 1 | 2 | 3 | 4 | 5;
  return {
    id: (goal + "-" + level + "-" + title + "-" + index).replace(/\s+/g, "-"),
    title,
    summary: title + " \u662f\u300c" + goal + "\u300d\u5b66\u4e60\u5730\u56fe\u4e2d\u7684 AI \u751f\u6210\u8282\u70b9\u3002",
    importance,
    difficulty,
    status: index === 0 ? "learning" : "not_started",
    type,
    order: level === "root" ? "\u7b2c" + (index + 1) + "\u9636\u6bb5" : "\u7b2c" + (index + 1) + "\u6b65",
    keyPoints: ["\u7406\u89e3\u300c" + title + "\u300d\u89e3\u51b3\u4ec0\u4e48\u95ee\u9898", "\u77e5\u9053\u300c" + title + "\u300d\u5728\u300c" + goal + "\u300d\u4e2d\u7684\u4f4d\u7f6e"],
    difficultPoints: ["\u628a\u300c" + title + "\u300d\u4ece\u6982\u5ff5\u8fc1\u79fb\u5230\u771f\u5b9e\u4efb\u52a1\u4e2d"],
    examPoints: ["\u80fd\u89e3\u91ca\u300c" + title + "\u300d", "\u80fd\u5b8c\u6210\u76f8\u5173\u7ec3\u4e60"],
    practiceAdvice: "\u56f4\u7ed5\u300c" + title + "\u300d\u5b8c\u6210\u4e00\u4e2a 10 \u5206\u949f\u5c0f\u7ec3\u4e60\u3002",
    tags: createTags(title, type),
    children: [],
  };
}

function inferKnowledgeType(title: string): KnowledgeType {
  if (/项目|实战|作品|案例|实践/.test(title)) return "project";
  if (/工具|软件|环境|平台|配置|安装/.test(title)) return "tool";
  if (/练习|考核|测试|复习|评估|考试/.test(title)) return "exam";
  if (/方法|技能|操作|应用|表达|编程|建模/.test(title)) return "skill";
  return "concept";
}

function createTags(title: string, type: KnowledgeType) {
  const tags = new Set<string>();
  if (/重点|核心|基础|关键/.test(title)) tags.add("\u91cd\u70b9");
  if (/难点|复杂|进阶/.test(title)) tags.add("\u96be\u70b9");
  if (type === "project") tags.add("\u9879\u76ee");
  if (tags.size === 0) tags.add(type === "concept" ? "\u6982\u5ff5" : "\u7ec3\u4e60");
  return Array.from(tags);
}

function cleanNodeTitle(rawTitle: string) {
  return rawTitle.replace(/\*\*/g, "").replace(/\[[x\s-]\]/gi, "").replace(/\u72b6\u6001[:\uff1a].*$/i, "").replace(/\u91cd\u8981\u5ea6[:\uff1a]\s*\d/gi, "").replace(/\u96be\u5ea6[:\uff1a]\s*\d/gi, "").replace(/[\u2605\u2606\u25c6\u25b6\u25c0\u25b2\u25bc]/g, "").trim();
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sanitizeError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.replace(/C:\\[^:]+(?=\.tsx|\.js|\:)/g, "[path]").replace(/\\u[a-f0-9]{4}/g, "").slice(0, 200);
}

async function postAI<T>(url: string, body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
  const rawText = await response.text();
  let result: AIResponse<T> & { error?: string; detail?: string };
  try {
    result = JSON.parse(rawText) as AIResponse<T> & { error?: string; detail?: string };
  } catch {
    throw new Error(rawText.slice(0, 160) || "\u63a5\u53e3\u6ca1\u6709\u8fd4\u56de JSON \u6570\u636e");
  }
  if (!response.ok && !result.data) throw new Error(result.detail || result.error || "\u63a5\u53e3\u8bf7\u6c42\u5931\u8d25");
  if (!result.data) throw new Error("AI \u6ca1\u6709\u8fd4\u56de\u6709\u6548\u5185\u5bb9");
  return result;
}
