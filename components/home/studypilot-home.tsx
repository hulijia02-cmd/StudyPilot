"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadHomeState, saveHomeState } from "@/lib/storage";
import { AiTeacherPanel } from "@/components/home/ai-teacher-panel";
import { HomeTopBar } from "@/components/home/home-top-bar";
import { LearningSidebar } from "@/components/home/learning-sidebar";
import { MainLearningPanel } from "@/components/home/main-learning-panel";
import type {
  AiMessage,
  DailyTask,
  HomeModule,
  KnowledgeTreeItem,
  LearningRouteItem,
  PlannerSummary,
  PracticeQuestion,
} from "@/components/home/home-types";

const initialRoutes: LearningRouteItem[] = [
  { id: "route-foundation", title: "Arduino \u5165\u95e8\u57fa\u7840", progress: 100, detail: "\u8ba4\u8bc6 Arduino \u677f\u5361\u3001IDE\u3001\u4e0a\u4f20\u7a0b\u5e8f\u548c\u7b2c\u4e00\u4e2a Blink \u5b9e\u9a8c\u3002", duration: "\u7b2c1\u5468", deliverable: "\u8ba9\u677f\u4e0a LED \u6309\u8282\u594f\u95ea\u70c1\u3002" },
  { id: "route-circuit", title: "\u57fa\u7840\u7535\u8def\u4e0e\u8f93\u5165\u8f93\u51fa", progress: 68, detail: "\u638c\u63e1\u9762\u5305\u677f\u3001\u7535\u963b\u3001LED\u3001\u6309\u94ae\u8f93\u5165\u548c\u6570\u5b57\u8f93\u51fa\u3002", duration: "\u7b2c2-3\u5468", deliverable: "\u505a\u51fa\u6309\u94ae\u63a7\u5236 LED \u7684\u5c0f\u7535\u8def\u3002" },
  { id: "route-sensor", title: "\u4f20\u611f\u5668\u4e0e\u6a21\u62df\u4fe1\u53f7", progress: 22, detail: "\u8bfb\u53d6\u5149\u654f\u3001\u7535\u4f4d\u5668\u6216\u8ddd\u79bb\u4f20\u611f\u5668\uff0c\u628a\u6570\u636e\u8f6c\u4e3a\u63a7\u5236\u903b\u8f91\u3002", duration: "\u7b2c4-5\u5468", deliverable: "\u505a\u51fa\u5149\u7ebf\u89e6\u53d1 LED \u6216\u871c\u8702\u5668\u7684\u4ea4\u4e92\u88c5\u7f6e\u3002" },
  { id: "route-project", title: "\u9879\u76ee\u5b9e\u6218", progress: 0, detail: "\u7ec4\u5408\u4f20\u611f\u5668\u3001\u6267\u884c\u5668\u548c\u8c03\u8bd5\u6d41\u7a0b\uff0c\u5b8c\u6210\u53ef\u5c55\u793a\u9879\u76ee\u3002", duration: "\u7b2c6\u5468", deliverable: "\u5b8c\u6210\u667a\u80fd\u591c\u706f\u6216\u8ddd\u79bb\u62a5\u8b66\u5668\u3002" },
];

const knowledgeTree: KnowledgeTreeItem[] = [
  { id: "arduino", title: "Arduino \u662f\u4ec0\u4e48", level: 1, status: "completed", explanation: { oneSentence: "Arduino \u662f\u4e00\u4e2a\u7528\u4ee3\u7801\u63a7\u5236\u7535\u5b50\u5143\u4ef6\u7684\u5c0f\u578b\u5f00\u53d1\u677f\u3002", keyPoints: ["\u5f00\u53d1\u677f\u8d1f\u8d23\u6267\u884c\u4ee3\u7801", "\u5f15\u811a\u53ef\u4ee5\u8fde\u63a5 LED\u3001\u6309\u94ae\u548c\u4f20\u611f\u5668", "\u9002\u5408\u7528\u9879\u76ee\u5b66\u4e60\u786c\u4ef6\u4ea4\u4e92"], difficultPoints: ["\u521a\u5f00\u59cb\u5bb9\u6613\u5206\u4e0d\u6e05\u5f00\u53d1\u677f\u3001\u4ee3\u7801\u548c\u7535\u8def\u5404\u81ea\u7684\u4f5c\u7528"], examPoints: ["\u80fd\u8bf4\u51fa Arduino \u7684\u7528\u9014", "\u80fd\u4e3e\u51fa\u4e00\u4e2a\u8f93\u5165\u548c\u4e00\u4e2a\u8f93\u51fa\u8bbe\u5907"] } },
  { id: "blink", title: "Blink \u7a0b\u5e8f", level: 2, status: "learning", explanation: { oneSentence: "Blink \u7a0b\u5e8f\u5c31\u662f\u8ba9 LED \u6309\u56fa\u5b9a\u8282\u594f\u4eae\u8d77\u548c\u7184\u706d\u3002", keyPoints: ["setup \u53ea\u8fd0\u884c\u4e00\u6b21", "loop \u4f1a\u53cd\u590d\u8fd0\u884c", "delay(1000) \u8868\u793a\u6682\u505c 1 \u79d2"], difficultPoints: ["\u7406\u89e3 loop \u7684\u5faa\u73af\u6267\u884c", "\u7406\u89e3\u6beb\u79d2\u548c\u79d2\u7684\u6362\u7b97"], examPoints: ["\u80fd\u4fee\u6539\u95ea\u70c1\u901f\u5ea6", "\u80fd\u89e3\u91ca pinMode\u3001digitalWrite\u3001delay \u7684\u4f5c\u7528"] } },
  { id: "pin-mode", title: "pinMode", level: 3, status: "weak", explanation: { oneSentence: "pinMode \u7528\u6765\u544a\u8bc9 Arduino \u67d0\u4e2a\u5f15\u811a\u662f\u8f93\u5165\u8fd8\u662f\u8f93\u51fa\u3002", keyPoints: ["OUTPUT \u7528\u4e8e\u63a7\u5236 LED \u7b49\u8f93\u51fa\u8bbe\u5907", "INPUT \u7528\u4e8e\u8bfb\u53d6\u6309\u94ae\u7b49\u8f93\u5165\u8bbe\u5907"], difficultPoints: ["\u5fd8\u8bb0\u8bbe\u7f6e pinMode \u4f1a\u5bfc\u81f4\u7535\u8def\u8868\u73b0\u5f02\u5e38"], examPoints: ["\u80fd\u5224\u65ad\u4ec0\u4e48\u65f6\u5019\u7528 INPUT\uff0c\u4ec0\u4e48\u65f6\u5019\u7528 OUTPUT"] } },
  { id: "digital-write", title: "digitalWrite", level: 3, status: "learning", explanation: { oneSentence: "digitalWrite \u7528\u6765\u8ba9\u6570\u5b57\u5f15\u811a\u8f93\u51fa\u9ad8\u7535\u5e73\u6216\u4f4e\u7535\u5e73\u3002", keyPoints: ["HIGH \u901a\u5e38\u8868\u793a\u8f93\u51fa\u9ad8\u7535\u5e73", "LOW \u901a\u5e38\u8868\u793a\u8f93\u51fa\u4f4e\u7535\u5e73"], difficultPoints: ["HIGH/LOW \u4e0d\u662f\u5f00\u5173\u6587\u5b57\uff0c\u800c\u662f\u7535\u5e73\u72b6\u6001"], examPoints: ["\u80fd\u7528 HIGH \u70b9\u4eae LED\uff0c\u7528 LOW \u7184\u706d LED"] } },
  { id: "breadboard", title: "\u9762\u5305\u677f\u4e0e\u7535\u963b", level: 2, status: "not_started", explanation: { oneSentence: "\u9762\u5305\u677f\u5e2e\u52a9\u4f60\u4e0d\u7528\u710a\u63a5\u5c31\u80fd\u4e34\u65f6\u8fde\u63a5\u7535\u8def\u3002", keyPoints: ["\u540c\u4e00\u6392\u5b54\u5185\u90e8\u76f8\u8fde", "LED \u901a\u5e38\u9700\u8981\u4e32\u8054\u9650\u6d41\u7535\u963b"], difficultPoints: ["\u9762\u5305\u677f\u5185\u90e8\u8fde\u901a\u65b9\u5411\u5bb9\u6613\u63a5\u9519"], examPoints: ["\u80fd\u753b\u51fa LED \u4e32\u8054\u7535\u963b\u7684\u63a5\u7ebf\u65b9\u5f0f"] } },
];

const initialTasks: DailyTask[] = [
  { id: "task-1", title: "\u7406\u89e3 Blink \u7a0b\u5e8f\u7684 setup \u548c loop", time: "18 \u5206\u949f", done: true },
  { id: "task-2", title: "\u5b8c\u6210 5 \u9053 Arduino \u5165\u95e8\u7ec3\u4e60", time: "12 \u5206\u949f", done: false },
  { id: "task-3", title: "\u590d\u76d8 pinMode \u6613\u9519\u70b9", time: "8 \u5206\u949f", done: false },
];

export function StudyPilotHome() {
  const [activeModule, setActiveModule] = useState<HomeModule>("home");
  const [learningGoal, setLearningGoal] = useState("\u6211\u8981\u5b66 Arduino");
  const [plannerSummary, setPlannerSummary] = useState<PlannerSummary | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState(initialRoutes[1].id);
  const [expandedRouteId, setExpandedRouteId] = useState(initialRoutes[1].id);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState("blink");
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: "teacher", content: "\u6211\u5df2\u7ecf\u51c6\u5907\u597d\u56f4\u7ed5 Arduino \u5165\u95e8\u8def\u7ebf\u6559\u5b66\u3002\u4f60\u53ef\u4ee5\u95ee\u6211\u77e5\u8bc6\u70b9\uff0c\u4e5f\u53ef\u4ee5\u8ba9\u6211\u751f\u6210\u7ec3\u4e60\u3002" },
    { role: "teacher", content: "\u5efa\u8bae\u4eca\u5929\u5148\u638c\u63e1 Blink \u7a0b\u5e8f\uff0c\u518d\u7ec3\u4e60 setup\u3001loop\u3001pinMode\u3002" },
  ]);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);

  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = loadHomeState();
    if (saved.learningGoal) setLearningGoal(saved.learningGoal);
    if (saved.activeModule) setActiveModule(saved.activeModule as HomeModule);
    if (saved.messages?.length) setMessages(saved.messages as AiMessage[]);
    if (saved.practiceQuestions?.length) setPracticeQuestions(saved.practiceQuestions as PracticeQuestion[]);
    if (saved.selectedKnowledgeId) setSelectedKnowledgeId(saved.selectedKnowledgeId);
    if (saved.selectedRouteId) setSelectedRouteId(saved.selectedRouteId);
    if (saved.expandedRouteId) setExpandedRouteId(saved.expandedRouteId);
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveHomeState({ learningGoal, activeModule, plannerSummary, messages, practiceQuestions, selectedKnowledgeId, selectedRouteId, expandedRouteId });
    }, 800);
  }, [learningGoal, activeModule, plannerSummary, messages, practiceQuestions, selectedKnowledgeId, selectedRouteId, expandedRouteId]);

  useEffect(() => { if (restored.current) scheduleSave(); }, [scheduleSave]);

  const selectedKnowledge = useMemo(() => knowledgeTree.find((item) => item.id === selectedKnowledgeId) ?? knowledgeTree[0], [selectedKnowledgeId]);
  const selectedRoute = useMemo(() => initialRoutes.find((item) => item.id === selectedRouteId) ?? initialRoutes[0], [selectedRouteId]);

  async function handleStartLearning() {
    setIsPlanning(true);
    setActiveModule("plan");
    try {
      const response = await fetch("/api/ai/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: learningGoal, currentLevel: "unknown", weeklyHours: 6, learningPreference: "hands_on_first" }) });
      const data = await response.json();
      setPlannerSummary({ goal: data.goalAnalysis?.normalizedGoal ?? learningGoal, estimatedWeeks: data.learningPlan?.estimatedCompletionWeeks ?? 6, weeklyHours: data.learningPlan?.weeklyHours ?? 6, phases: data.learningRoute?.phases?.map((p: { title: string }) => p.title) ?? [] });
      setMessages((c) => [...c, { role: "teacher", content: "\u5b66\u4e60\u8ba1\u5212\u5df2\u751f\u6210\uff1a\u9884\u8ba1 " + (data.learningPlan?.estimatedCompletionWeeks ?? 6) + " \u5468\u5b8c\u6210\u3002\u6211\u4eec\u5148\u4ece Blink \u7a0b\u5e8f\u5f00\u59cb\u3002" }]);
    } catch {
      setPlannerSummary({ goal: learningGoal, estimatedWeeks: 6, weeklyHours: 6, phases: initialRoutes.map((r) => r.title) });
    } finally { setIsPlanning(false); }
  }

  async function handleGeneratePractice() {
    setIsPracticing(true);
    setActiveModule("practice");
    try {
      const response = await fetch("/api/ai/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: selectedKnowledge.title, subject: "Arduino", learnerLevel: "zero_based", difficulty: "easy" }) });
      const data = await response.json();
      setPracticeQuestions(data.questions ?? []);
      setMessages((c) => [...c, { role: "teacher", content: "\u6211\u5df2\u7ecf\u6839\u636e\u300c" + selectedKnowledge.title + "\u300d\u751f\u6210\u4e86\u4e00\u7ec4\u7ec3\u4e60\u9898\u3002" }]);
    } catch {
      setPracticeQuestions([{ id: "mock-q1", type: "single_choice", question: "loop \u51fd\u6570\u7684\u7279\u70b9\u662f\u4ec0\u4e48\uff1f", options: ["A. \u53ea\u8fd0\u884c\u4e00\u6b21", "B. \u53cd\u590d\u8fd0\u884c", "C. \u5b89\u88c5\u8f6f\u4ef6", "D. \u8fde\u63a5\u7535\u6e90"], points: 10, standardAnswer: { value: "B", explanation: "loop \u4f1a\u53cd\u590d\u8fd0\u884c\u3002" } }]);
    } finally { setIsPracticing(false); }
  }

  function handleSelectKnowledge(id: string) { setSelectedKnowledgeId(id); setActiveModule("tree"); }
  function handleSelectRoute(id: string) { setSelectedRouteId(id); setExpandedRouteId((c) => (c === id ? "" : id)); setActiveModule("plan"); }

  function handleSendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setActiveModule("teacher");
    setMessages((c) => [...c, { role: "user", content: trimmed }, { role: "teacher", content: "\u6211\u5148\u7528\u96f6\u57fa\u7840\u65b9\u5f0f\u56de\u7b54\uff1a" + selectedKnowledge.explanation.oneSentence + " \u91cd\u70b9\u662f" + selectedKnowledge.explanation.keyPoints.join("\u3001") + "\u3002" }]);
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <HomeTopBar goal={learningGoal} isPlanning={isPlanning} onGoalChange={setLearningGoal} onStartLearning={handleStartLearning} />
        <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <LearningSidebar activeModule={activeModule} expandedRouteId={expandedRouteId} knowledgeItems={knowledgeTree} onModuleChange={setActiveModule} onRouteClick={handleSelectRoute} onKnowledgeClick={handleSelectKnowledge} routeItems={initialRoutes} selectedKnowledgeId={selectedKnowledgeId} selectedRouteId={selectedRouteId} />
          <MainLearningPanel activeModule={activeModule} isPracticing={isPracticing} plannerSummary={plannerSummary} practiceQuestions={practiceQuestions} selectedKnowledge={selectedKnowledge} selectedRoute={selectedRoute} tasks={initialTasks} onGeneratePractice={handleGeneratePractice} onModuleChange={setActiveModule} onStartLearning={handleStartLearning} />
          <AiTeacherPanel messages={messages} selectedKnowledge={selectedKnowledge} onGeneratePractice={handleGeneratePractice} onSendMessage={handleSendMessage} />
        </section>
      </div>
    </main>
  );
}
