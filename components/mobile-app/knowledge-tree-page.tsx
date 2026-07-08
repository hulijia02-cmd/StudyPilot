"use client";

import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Flame,
  FolderTree,
  GraduationCap,
  Loader2,
  Star,
  Wrench,
} from "lucide-react";
import type { KnowledgeExplanation } from "@/lib/aiClient";
import type { KnowledgeNode } from "@/lib/mockLearningData";

type KnowledgeTreePageProps = {
  expandedModuleId?: string;
  explanation?: KnowledgeExplanation | null;
  goal?: string;
  isLoadingExplanation: boolean;
  selectedNode?: KnowledgeNode | null;
  tree: KnowledgeNode[];
  onGoHome: () => void;
  onModuleToggle: (id: string) => void;
  onNodeSelect: (node: KnowledgeNode) => void;
};

const typeLabel: Record<KnowledgeNode["type"], string> = {
  concept: "概念",
  skill: "技能",
  tool: "工具",
  project: "项目",
  exam: "考核",
};

export function KnowledgeTreePage({
  expandedModuleId,
  explanation,
  goal,
  isLoadingExplanation,
  selectedNode,
  tree,
  onGoHome,
  onModuleToggle,
  onNodeSelect,
}: KnowledgeTreePageProps) {
  if (!goal || tree.length === 0) {
    return (
      <section className="rounded-[28px] border border-dashed border-sky-200 bg-white p-5 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-950">请先在首页输入学习目标</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">输入学习目标后，AI 会生成课程全景图</p>
        <button
          className="mt-4 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100"
          onClick={onGoHome}
          type="button"
        >
          去首页
        </button>
      </section>
    );
  }

  const expandedModule = tree.find((item) => item.id === expandedModuleId) ?? tree[0];
  const activeNode = selectedNode ?? expandedModule;
  const totalNodes = tree.reduce((count, node) => count + 1 + node.children.length + node.children.reduce((sum, child) => sum + child.children.length, 0), 0);

  return (
    <div className="space-y-4">
      <header className="rounded-[28px] bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-sky-600">课程全景地图</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">{goal}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">像幕布/XMind 一样，从整门课到模块再到知识点，一眼看清先学什么、重点在哪里?</p>
          </div>
          <span className="rounded-2xl bg-white px-3 py-2 text-xs font-bold text-sky-700 shadow-sm">
            {totalNodes} 节点
          <a href="/mindmap" target="_blank" className="ml-2 rounded-lg bg-sky-100 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-200 transition whitespace-nowrap">?? ?</a></span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MapStat label="阶段" value={tree.length} />
          <MapStat label="模块" value={tree.reduce((sum, item) => sum + item.children.length, 0)} />
          <MapStat
 label="֪知识点"
            value={tree.reduce((sum, item) => sum + item.children.reduce((inner, child) => inner + child.children.length, 0), 0)}
          />
        </div>
      </header>

      <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-sky-100 p-2 text-sky-700">
              <FolderTree className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-950">XMind 视图</h2>
              <p className="text-xs text-slate-500">横向滑动查看完整课程地图</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">AI 生成<a href="/mindmap" target="_blank" className="ml-2 rounded-lg bg-sky-100 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-200 transition whitespace-nowrap">查看完整导图</a></span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[860px] items-center gap-5">
            <button
              className="relative flex min-h-28 w-44 shrink-0 flex-col justify-center rounded-[28px] bg-slate-950 p-4 text-left text-white shadow-lg shadow-slate-200"
              onClick={() => {
                onModuleToggle(expandedModule.id);
                onNodeSelect(expandedModule);
              }}
              type="button"
            >
              <Brain className="mb-3 h-5 w-5 text-sky-300" />
              <p className="text-xs font-semibold text-slate-300">学习目标</p>
              <h3 className="mt-1 text-lg font-bold leading-6">{goal}</h3>
            </button>

            <div className="h-px w-8 shrink-0 bg-slate-300" />

            <div className="grid min-w-[620px] grid-cols-2 gap-3">
              {tree.map((module, index) => (
                <MindMapStage
                  index={index}
                  isActive={expandedModule.id === module.id}
                  key={module.id}
                  module={module}
                  onModuleToggle={onModuleToggle}
                  onNodeSelect={onNodeSelect}
                  selectedNodeId={activeNode.id}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">当前分支</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">{expandedModule.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">点击下方节点查看 AI 讲解和学习建议?</p>
          </div>
          <span className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">三级结构<a href="/mindmap" target="_blank" className="ml-2 rounded-lg bg-sky-100 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-200 transition whitespace-nowrap">查看完整导图</a></span>
        </div>

        <div className="mt-4 space-y-3">
          {expandedModule.children.map((child, index) => (
            <OutlineNode key={child.id} node={child} order={index + 1} onNodeSelect={onNodeSelect} selectedNodeId={activeNode.id} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-sky-600">节点讲解</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{activeNode.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{activeNode.summary}</p>
          </div>
          <StatusIcon node={activeNode} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="重要度" value={activeNode.importance} icon={<Star className="h-4 w-4" />} />
          <Metric label="难度" value={activeNode.difficulty} icon={<Flame className="h-4 w-4" />} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Tag label={typeLabel[activeNode.type]} />
          {activeNode.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>

        {isLoadingExplanation ? null}
      </section>
    </div>
  );
}

function MindMapStage({
  index,
  isActive,
  module,
  onModuleToggle,
  onNodeSelect,
  selectedNodeId,
}: {
  index: number;
  isActive: boolean;
  module: KnowledgeNode;
  onModuleToggle: (id: string) => void;
  onNodeSelect: (node: KnowledgeNode) => void;
  selectedNodeId: string;
}) {
  return (
    <div className="relative flex gap-3">
      <div className="mt-8 h-px w-5 shrink-0 bg-slate-200" />
      <div
        className={`w-full rounded-[24px] border p-3 shadow-sm transition ${
          isActive ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50"
        }`}
      >
        <button
          className="flex w-full items-start justify-between gap-2 text-left"
          onClick={() => {
            onModuleToggle(module.id);
            onNodeSelect(module);
          }}
          type="button"
        >
          <div>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-sky-700 shadow-sm">
              阶段 {index + 1}
            </span>
            <h3 className="mt-2 text-sm font-bold leading-5 text-slate-950">{module.title}</h3>
          </div>
          <ChevronRight className={`mt-1 h-4 w-4 text-slate-400 transition ${isActive ? "rotate-90" : ""}`} />
        </button>

        <div className="mt-3 space-y-2">
          {module.children.slice(0, 4).map((child) => (
            <button
              className={`w-full rounded-2xl border px-3 py-2 text-left text-xs font-semibold leading-5 transition ${
                selectedNodeId === child.id
                  ? "border-sky-300 bg-white text-sky-700 shadow-sm"
                  : "border-transparent bg-white/70 text-slate-700 hover:bg-white"
              }`}
              key={child.id}
              onClick={() => onNodeSelect(child)}
              type="button"
            >
              {child.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutlineNode({
  node,
  onNodeSelect,
  order,
  selectedNodeId,
}: {
  node: KnowledgeNode;
  onNodeSelect: (node: KnowledgeNode) => void;
  order: number;
  selectedNodeId: string;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3">
      <button
        className={`flex w-full items-start gap-3 rounded-2xl p-2 text-left transition ${
          selectedNodeId === node.id ? "bg-white shadow-sm" : "hover:bg-white"
        }`}
        onClick={() => onNodeSelect(node)}
        type="button"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-bold text-sky-700 shadow-sm">
          {order}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">{node.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{node.summary}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {node.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>
      </button>

      {node.children.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 pl-11">
          {node.children.map((leaf) => (
            <button
              className={`rounded-2xl bg-white p-3 text-left text-xs shadow-sm transition hover:bg-sky-50 ${
                selectedNodeId === leaf.id ? "ring-2 ring-sky-200" : ""
              }`}
              key={leaf.id}
              onClick={() => onNodeSelect(leaf)}
              type="button"
            >
              <p className="font-bold leading-5 text-slate-800">{leaf.title}</p>
              <p className="mt-1 text-[10px] font-semibold text-sky-600">{typeLabel[leaf.type]}</p>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MapStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/85 px-3 py-2 shadow-sm">
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500">{title}</h3>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <p className="rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700" key={`${item}-${index}`}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            className={`h-2 flex-1 rounded-full ${index < value ? "bg-sky-500" : "bg-slate-200"}`}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ node }: { node: KnowledgeNode }) {
  if (node.status === "mastered") {
    return <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />;
  }

  if (node.type === "project") {
    return <Wrench className="h-6 w-6 shrink-0 text-amber-500" />;
  }

  return <GraduationCap className="h-6 w-6 shrink-0 text-sky-500" />;
}

function Tag({ label }: { label: string }) {
  const color =
    label === "难点"
      ? "bg-rose-50 text-rose-600"
      : label === "项目"
        ? "bg-amber-50 text-amber-700"
        : label === "已掌握"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-sky-50 text-sky-700";

  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${color}`}>{label}</span>;
}

