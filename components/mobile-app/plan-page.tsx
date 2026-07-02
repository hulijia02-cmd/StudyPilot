"use client";

import { ChevronDown, Play } from "lucide-react";
import type { DailyPlan } from "@/lib/mockLearningData";

type PlanPageProps = {
  goal?: string;
  expandedDay: number;
  plans: DailyPlan[];
  onDayToggle: (day: number) => void;
  onStartToday: () => void;
  onGoHome: () => void;
};

export function PlanPage({ goal, expandedDay, plans, onDayToggle, onStartToday, onGoHome }: PlanPageProps) {
  if (!goal || plans.length === 0) {
    return (
      <EmptyPanel
        title="还没有学习计划"
        description="先在首页输入学习目标，StudyPilot 会调用 AI 生成专属 30 天计划。"
        action="去首页生成"
        onAction={onGoHome}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-[28px] bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold text-sky-600">当前学习目标</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{goal}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">以下内容由 AI 根据你的目标动态生成，可展开每天任务查看重点和练习。</p>
      </header>

      <button
        className="sticky top-0 z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100"
        onClick={onStartToday}
        type="button"
      >
        <Play className="h-4 w-4 fill-white" />
        开始今日学习
      </button>

      <section className="space-y-3">
        {plans.map((plan) => {
          const isExpanded = expandedDay === plan.day;

          return (
            <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" key={plan.day}>
              <button
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => onDayToggle(plan.day)}
                type="button"
              >
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-bold text-sky-700">
                    {plan.day}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold leading-5 text-slate-950">{plan.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">{plan.estimatedTime}</p>
                  </div>
                </div>
                <ChevronDown className={`mt-1 h-4 w-4 text-slate-400 transition ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded ? (
                <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-3">
                  <InfoLine label="学习内容" value={plan.focus} />
                  <InfoLine label="重点练习" value={plan.practice} />
                  <div>
                    <p className="text-xs font-bold text-slate-500">任务详情</p>
                    <ul className="mt-2 space-y-2">
                      {plan.details.map((detail) => (
                        <li className="rounded-xl bg-white px-3 py-2 text-xs leading-5 text-slate-600" key={detail}>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function EmptyPanel({
  action,
  description,
  onAction,
  title,
}: {
  action: string;
  description: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-dashed border-sky-200 bg-white p-5 text-center shadow-sm">
      <h1 className="text-lg font-bold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <button
        className="mt-4 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100"
        onClick={onAction}
        type="button"
      >
        {action}
      </button>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
