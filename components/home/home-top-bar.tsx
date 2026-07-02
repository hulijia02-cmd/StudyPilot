"use client";

import { Bell, Flame, GraduationCap, Search, Sparkles } from "lucide-react";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";

type HomeTopBarProps = {
  goal: string;
  isPlanning: boolean;
  onGoalChange: (goal: string) => void;
  onStartLearning: () => void;
};

export function HomeTopBar({
  goal,
  isPlanning,
  onGoalChange,
  onStartLearning,
}: HomeTopBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStartLearning();
  }

  return (
    <header className="rounded-[28px] border border-white/70 bg-white/80 px-4 py-4 shadow-soft backdrop-blur-2xl sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => onGoalChange(goal || "我要学Arduino")}
          type="button"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">StudyPilot</p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">AI Learning OS</h1>
          </div>
        </button>

        <form
          className="flex flex-1 flex-col gap-3 lg:max-w-3xl lg:flex-row lg:items-center"
          onSubmit={handleSubmit}
        >
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 transition focus-within:ring-2 focus-within:ring-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              onChange={(event) => onGoalChange(event.target.value)}
              placeholder="输入学习目标，例如：我要学Arduino"
              value={goal}
            />
          </label>
          <Button disabled={isPlanning} type="submit">
            {isPlanning ? "生成中..." : "开始学习"}
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <TopMetric icon={Flame} label="连续学习" value="12 天" tone="warm" />
          <TopMetric icon={GraduationCap} label="学习目标" value={goal || "未设置"} />
          <Button
            aria-label="通知"
            onClick={() => window.alert("暂无新通知。")}
            type="button"
            variant="ghost"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <button
            className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 p-2 pr-4 text-left"
            onClick={() => window.alert("林同学，当前等级：Beginner")}
            type="button"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
              L
            </div>
            <div>
              <p className="text-sm font-semibold">林同学</p>
              <p className="text-xs text-muted-foreground">Beginner</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

type TopMetricProps = {
  icon: typeof Flame;
  label: string;
  value: string;
  tone?: "default" | "warm";
};

function TopMetric({ icon: Icon, label, value, tone = "default" }: TopMetricProps) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-background/80 px-3">
      <span
        className={
          tone === "warm"
            ? "flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600"
            : "flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary"
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="max-w-36 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
