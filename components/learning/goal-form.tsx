"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GoalForm() {
  const [goal, setGoal] = useState("30 天入门机器学习");

  return (
    <form className="mt-8 space-y-5 rounded-lg border border-border bg-white/80 p-6 shadow-sm">
      <label className="block">
        <span className="text-sm font-medium">学习目标</span>
        <textarea
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-md border border-border bg-background p-3 outline-none ring-primary transition focus:ring-2"
          placeholder="例如：3 个月学会 Python 并完成一个数据分析项目"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">当前基础</span>
          <select className="mt-2 w-full rounded-md border border-border bg-background p-3 outline-none ring-primary transition focus:ring-2">
            <option>零基础</option>
            <option>了解一点</option>
            <option>有项目经验</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">每周可学习时间</span>
          <select className="mt-2 w-full rounded-md border border-border bg-background p-3 outline-none ring-primary transition focus:ring-2">
            <option>3-5 小时</option>
            <option>5-8 小时</option>
            <option>8 小时以上</option>
          </select>
        </label>
      </div>
      <Button type="button">生成 AI 诊断</Button>
    </form>
  );
}
