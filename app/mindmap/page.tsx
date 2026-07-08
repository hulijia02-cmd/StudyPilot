"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MindmapPage } from "@/components/mindmap/mindmap-page";
import type { KnowledgeNode, LearningProgram } from "@/lib/mockLearningData";

export default function MindmapRoute() {
  const router = useRouter();
  const [data, setData] = useState<{ goal: string; tree: KnowledgeNode[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("studypilot_mobile_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.program) {
          const prog = parsed.program as LearningProgram;
          setData({ goal: prog.goal || prog.domain, tree: prog.tree || [] });
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">加载中...</p>
      </div>
    );
  }

  if (!data || !data.goal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <h1 className="text-xl font-bold text-slate-800">还没有学习目标</h1>
        <p className="text-sm text-slate-500">请先在首页输入学习目标，生成学习计划后再来查看思维导图。</p>
        <Link
          href="/"
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-sky-700 transition"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <MindmapPage
      tree={data.tree}
      goal={data.goal}
      onBack={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
    />
  );
}
