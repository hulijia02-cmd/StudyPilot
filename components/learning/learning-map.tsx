const modules = ["认知地图", "核心概念", "基础练习", "项目实践"];

export function LearningMap() {
  return (
    <section className="rounded-lg border border-border bg-white/80 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">学习路径</h2>
      <div className="mt-5 space-y-4">
        {modules.map((module, index) => (
          <div key={module} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              {index < modules.length - 1 ? <span className="h-8 w-px bg-border" /> : null}
            </div>
            <div>
              <h3 className="font-medium">{module}</h3>
              <p className="text-sm text-muted-foreground">AI Planner 将生成具体知识点和任务。</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
