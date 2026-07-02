import { BookOpenCheck, ClipboardCheck, RefreshCcw } from "lucide-react";

const tasks = [
  { title: "学习监督学习的基本定义", icon: BookOpenCheck, status: "待开始" },
  { title: "完成 3 道概念判断题", icon: ClipboardCheck, status: "待开始" },
  { title: "复习昨天的错因标签", icon: RefreshCcw, status: "待复习" },
];

export function TodayTasks() {
  return (
    <section className="rounded-lg border border-border bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">今日任务</h2>
          <p className="text-sm text-muted-foreground">由 AI 根据计划和掌握度生成。</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {tasks.map((task) => (
          <article key={task.title} className="flex items-center justify-between rounded-md border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <task.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{task.title}</span>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {task.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
