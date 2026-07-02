export function ProgressPanel() {
  return (
    <aside className="rounded-lg border border-border bg-white/80 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">掌握度</h2>
      <div className="mt-5">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold">42%</span>
          <span className="pb-1 text-sm text-muted-foreground">当前阶段</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[42%] rounded-full bg-primary" />
        </div>
      </div>
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">薄弱点</span>
          <span className="font-medium">线性回归</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">复习任务</span>
          <span className="font-medium">2 个</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">连续学习</span>
          <span className="font-medium">3 天</span>
        </div>
      </div>
    </aside>
  );
}
