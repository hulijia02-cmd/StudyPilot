"use client";

import { ArrowRight, Loader2, Sparkles } from "lucide-react";

type HomePageProps = {
  aiSuggestion?: string;
  error?: string;
  goal: string;
  isLoading: boolean;
  progress?: number;
  recommendedTasks: string[];
  onGoalChange: (goal: string) => void;
  onStartLearning: (goal?: string) => void;
};

export function HomePage({
  aiSuggestion,
  error,
  goal,
  isLoading,
  progress,
  recommendedTasks,
  onGoalChange,
  onStartLearning,
}: HomePageProps) {
  const hasProgram = recommendedTasks.length > 0;

  return (
    <div className="space-y-5">
      <header className="rounded-[28px] bg-gradient-to-br from-sky-50 to-white p-5 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">AI Learning OS</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">StudyPilot</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">输入学习目标后，AI 会实时生成计划、知识树、讲解和练习。</p>
        </div>

        <form
          className="mt-7"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onStartLearning(String(formData.get("goal") ?? ""));
          }}
        >
          <h2 className="text-xl font-bold text-slate-900">今天想学习什么？</h2>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            <input
              aria-label="学习目标"
              className="w-full rounded-2xl border-none bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              disabled={isLoading || goal.trim().length < 2}
              name="goal"
              onChange={(event) => onGoalChange(event.target.value)}
              placeholder="例如：设计数学、Python 入门、考研英语"
              value={goal}
            />
            <button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {isLoading ? "AI 正在生成" : "开始学习"}
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-600">{error}</p>
        ) : null}
      </header>

      {hasProgram ? (
        <>
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">学习进度</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{progress ?? 0}%</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${progress ?? 0}%` }} />
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-semibold text-emerald-700">AI 建议</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{aiSuggestion}</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-slate-950">AI 推荐学习任务</h2>
            </div>
            <div className="mt-4 space-y-3">
              {recommendedTasks.map((task, index) => (
                <button
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-sky-50"
                  key={`${task}-${index}`}
                  onClick={() => onStartLearning(goal)}
                  type="button"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-sky-700 shadow-sm">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium leading-5 text-slate-700">{task}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[28px] border border-dashed border-sky-200 bg-white/80 p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">还没有学习内容</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">输入任意学习目标后，StudyPilot 会调用 DeepSeek 动态生成。</p>
        </section>
      )}
    </div>
  );
}
