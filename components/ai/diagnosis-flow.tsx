"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const questions = [
  "你是否接触过这个学习主题？",
  "你更希望通过案例、项目还是考试题来学习？",
  "你的截止日期和每周学习时间是多少？",
];

export function DiagnosisFlow() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="mt-8 rounded-lg border border-border bg-white/80 p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">诊断问题</h2>
        <span className="text-sm text-muted-foreground">
          {activeIndex + 1}/{questions.length}
        </span>
      </div>
      <p className="text-xl font-medium">{questions[activeIndex]}</p>
      <textarea
        className="mt-5 min-h-28 w-full rounded-md border border-border bg-background p-3 outline-none ring-primary transition focus:ring-2"
        placeholder="输入你的回答"
      />
      <div className="mt-5 flex gap-3">
        <Button
          type="button"
          onClick={() => setActiveIndex((value) => Math.min(value + 1, questions.length - 1))}
        >
          下一题
        </Button>
        <Button type="button" variant="secondary">
          生成诊断结果
        </Button>
      </div>
    </section>
  );
}
