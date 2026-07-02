import { GoalForm } from "@/components/learning/goal-form";
import { AppShell } from "@/components/layout/app-shell";

export default function GoalPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl py-10">
        <p className="text-sm font-medium text-primary">第一步</p>
        <h1 className="mt-2 text-3xl font-semibold">创建你的学习目标</h1>
        <p className="mt-3 text-muted-foreground">
          StudyPilot 会根据目标、基础、时间和偏好生成第一版学习路径。
        </p>
        <GoalForm />
      </main>
    </AppShell>
  );
}
