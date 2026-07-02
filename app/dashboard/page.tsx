import { LearningMap } from "@/components/learning/learning-map";
import { ProgressPanel } from "@/components/learning/progress-panel";
import { TodayTasks } from "@/components/learning/today-tasks";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">学习驾驶舱</p>
          <h1 className="text-3xl font-semibold">今天继续推进你的学习计划</h1>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1.4fr_0.9fr]">
          <LearningMap />
          <TodayTasks />
          <ProgressPanel />
        </div>
      </div>
    </AppShell>
  );
}
