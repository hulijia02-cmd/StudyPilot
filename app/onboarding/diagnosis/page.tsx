import { DiagnosisFlow } from "@/components/ai/diagnosis-flow";
import { AppShell } from "@/components/layout/app-shell";

export default function DiagnosisPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl py-10">
        <p className="text-sm font-medium text-primary">第二步</p>
        <h1 className="mt-2 text-3xl font-semibold">AI 学习诊断</h1>
        <p className="mt-3 text-muted-foreground">
          这里会接入 Goal Diagnosis Agent，用少量问题确定你的起点。
        </p>
        <DiagnosisFlow />
      </main>
    </AppShell>
  );
}
