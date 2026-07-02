"use client";

import { useEffect, useState } from "react";
import { MindmapPage } from "@/components/mindmap/mindmap-page";
import type { KnowledgeNode, LearningProgram } from "@/lib/mockLearningData";

export default function MindmapRoute() {
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
        <p className="text-sm text-slate-400">\u52a0\u8f7d\u4e2d...</p>
      </div>
    );
  }

  if (!data || !data.goal) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <h1 className="text-xl font-bold text-slate-800">\u8fd8\u6ca1\u6709\u5b66\u4e60\u76ee\u6807</h1>
        <p className="text-sm text-slate-500">\u8bf7\u5148\u5728\u9996\u9875\u8f93\u5165\u5b66\u4e60\u76ee\u6807\uff0c\u751f\u6210\u5b66\u4e60\u8ba1\u5212\u540e\u518d\u6765\u67e5\u770b\u601d\u7ef4\u5bfc\u56fe\u3002</p>
        <Link
          href="/"
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-sky-700 transition"
        >
          \u8fd4\u56de\u9996\u9875
        </Link>
      </div>
    );
  }

  return (
    <MindmapPage
      tree={data.tree}
      goal={data.goal}
      onBack={() => window.history.back()}
    />
  );
}
import Link from "next/link";
