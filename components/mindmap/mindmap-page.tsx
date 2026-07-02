"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KnowledgeNode } from "@/lib/mockLearningData";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  ListChecks,
  Minus,
  Network,
  Plus,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type { KnowledgeExplanation } from "@/lib/aiClient";


const NODE_W = 170;
const NODE_H = 44;
const H_GAP = 80;
const V_GAP = 16;
const LEVEL_GAP = 40;

type MindmapPageProps = {
  tree: KnowledgeNode[];
  goal: string;
  onBack?: () => void;
};

type Edge = { x1: number; y1: number; x2: number; y2: number };

export function MindmapPage({ tree, goal, onBack }: MindmapPageProps) {
  const [mode, setMode] = useState<"document" | "mindmap">("mindmap");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [dragging, setDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 2000, h: 2000 });
  const [knowledgeExp, setKnowledgeExp] = useState<KnowledgeExplanation | null>(null);
  const [expLoading, setExpLoading] = useState(false);
  const loadExplanation = useCallback(async (node: KnowledgeNode) => {
    setExpLoading(true);
    try {
      const res = await fetch("/api/ai/knowledge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, topic: node.title }),
      });
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setKnowledgeExp(json.data || null);
    } catch { setKnowledgeExp(null); }
    finally { setExpLoading(false); }
  }, [goal]);
  const dragRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCanvasSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectNode = useCallback((node: KnowledgeNode) => {
    setSelectedNode(node);
    if (goal) loadExplanation(node);
  }, [goal, loadExplanation]);

  const closeExplanation = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Layout calculation for mindmap
  const { nodes: layoutRoots, edges } = useMemo(() => {
    const edges: Edge[] = [];
    const nodes: Array<{ id: string; title: string; x: number; y: number; depth: number; data: KnowledgeNode; hasChildren: boolean; isCollapsed: boolean }> = [];

    function walk(list: KnowledgeNode[], depth: number, startY: number): { height: number; yOffsets: number[] } {
      let y = startY;
      const yOffsets: number[] = [];
      for (const node of list) {
        const isCollapsed = collapsed.has(node.id);
        const x = LEVEL_GAP + depth * (NODE_W + H_GAP);
        nodes.push({
          id: node.id, title: node.title,
          x, y, depth,
          data: node, hasChildren: node.children.length > 0,
          isCollapsed,
        });
        const parentY = y;
        if (!isCollapsed && node.children.length > 0) {
          const result = walk(node.children, depth + 1, y + NODE_H + V_GAP);
          for (const childOffset of result.yOffsets) {
            edges.push({
              x1: x + NODE_W, y1: parentY + NODE_H / 2,
              x2: x + NODE_W + H_GAP, y2: childOffset + NODE_H / 2,
            });
          }
          y = result.height + startY + NODE_H + V_GAP;
        } else {
          y += NODE_H + V_GAP;
        }
        yOffsets.push(parentY);
      }
      return { height: y - startY, yOffsets };
    }

    if (tree.length > 0) {
      walk(tree, 0, LEVEL_GAP);
    }

    return { nodes, edges };
  }, [tree, collapsed]);

  // Mouse handlers for pan/drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    setDragging(true);
    dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y, panX: pan.x, panY: pan.y };
  }, [pan]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [dragging]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.25, Math.min(2, z - e.deltaY * 0.002)));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);



  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} type="button" className="rounded-xl p-2 hover:bg-slate-100 transition">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-900">{'\u601d\u7ef4\u5bfc\u56fe'}</h1>
            <p className="max-w-64 truncate text-xs text-slate-500">{goal}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <button
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === "document" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setMode("document")}
              type="button"
            >
            <FileText className="h-3.5 w-3.5" />
            {'\u6587\u6863'}
            </button>
            <button
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === "mindmap" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setMode("mindmap")}
              type="button"
            >
           <Network className="h-3.5 w-3.5" />
            完整导图
            </button>
          </div>
          {tree.length > 0 && (
            <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-600">
              {tree.reduce((s, n) => s + countAll(n), 0)} {'节点'}
            </span>
          )}
        </div>
      </header>

      {/* Content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {mode === "document" ? (
          <DocumentView
            roots={tree}
            collapsed={collapsed}
            selectedId={selectedNode?.id ?? null}
            onToggle={toggleCollapse}
            onSelect={selectNode}
          />
        ) : (
          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden"
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
          >
            {layoutRoots.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-slate-400">{'\u8bf7\u5148\u5728\u9996\u9875\u8f93\u5165\u5b66\u4e60\u76ee\u6807'}</p>
              </div>
            )}
            {/* SVG connection lines */}
            <svg
              className="pointer-events-none absolute"
              style={{
                left: 0,
                top: 0,
                width: canvasSize.w + 2000,
                height: canvasSize.h + 2000,
                overflow: "visible",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {edges.map((e, i) => (
                <path
                  key={i}
                  d={`M${e.x1},${e.y1} C${e.x1 + (e.x2 - e.x1) * 0.4},${e.y1} ${e.x2 - (e.x2 - e.x1) * 0.4},${e.y2} ${e.x2},${e.y2}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
            </svg>
            {/* Node cards */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {layoutRoots.map((node) => (
                <MindmapNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onToggle={toggleCollapse}
                  onSelect={() => selectNode(node.data)}
                />
              ))}
            </div>
            {/* Zoom controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur z-20">
              <button
                className="rounded-lg p-1.5 hover:bg-slate-100 transition"
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}
                type="button"
              >
                <Minus className="h-4 w-4 text-slate-600" />
              </button>
              <span className="min-w-[44px] text-center text-xs font-semibold text-slate-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="rounded-lg p-1.5 hover:bg-slate-100 transition"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                type="button"
              >
                <Plus className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}

        {/* Explanation panel */}
        {selectedNode && (
          <ExplanationPanel
            node={selectedNode}
            explanation={knowledgeExp}
            isLoading={expLoading}
            onClose={closeExplanation}
          />
        )}
      </div>
    </div>
  );
}

// ---- Sub-components ----

function MindmapNode({
  node,
  isSelected,
  onToggle,
  onSelect,
}: {
  node: { id: string; title: string; x: number; y: number; depth: number; hasChildren: boolean; isCollapsed: boolean };
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: () => void;
}) {
  const depthColors = [
    "border-sky-400 bg-sky-50 text-sky-800",
    "border-emerald-400 bg-emerald-50 text-emerald-800",
    "border-amber-400 bg-amber-50 text-amber-800",
    "border-violet-400 bg-violet-50 text-violet-800",
    "border-rose-400 bg-rose-50 text-rose-800",
    "border-cyan-400 bg-cyan-50 text-cyan-800",
    "border-indigo-400 bg-indigo-50 text-indigo-800",
  ];
  const colorClass = depthColors[Math.min(node.depth, depthColors.length - 1)];

  return (
    <div
      data-no-drag="true"
      className={`absolute flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all cursor-pointer select-none shadow-sm hover:shadow-md ${
        isSelected ? colorClass + " ring-2 ring-slate-900/10 scale-105 z-30" : colorClass + " z-10"
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: NODE_W,
        zIndex: isSelected ? 30 : 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {node.hasChildren && (
        <button
          className="shrink-0 rounded-md p-0.5 hover:bg-black/5 transition"
          onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
          type="button"
        >
          {node.isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      )}
      <span className="truncate flex-1">{node.title}</span>
      {node.hasChildren && (
        <span className="shrink-0 rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-bold opacity-60">
          {node.isCollapsed ? "..." : ""}
        </span>
      )}
    </div>
  );
}

function DocumentView({
  roots,
  collapsed,
  selectedId,
  onToggle,
  onSelect,
}: {
  roots: KnowledgeNode[];
  collapsed: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: KnowledgeNode) => void;
}) {
  if (roots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400">{'\u6682\u65e0\u6570\u636e'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto max-w-2xl space-y-2">
        {roots.map((node) => (
          <DocumentNode
            key={node.id}
            node={node}
            depth={0}
            collapsed={collapsed}
            selectedId={selectedId}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function DocumentNode({
  node,
  depth,
  collapsed,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: KnowledgeNode;
  depth: number;
  collapsed: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: KnowledgeNode) => void;
}) {
  const isCollapsed = collapsed.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        data-no-drag="true"
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer ${
          isSelected
            ? "bg-sky-50 text-sky-800 font-semibold"
            : "text-slate-700 hover:bg-slate-50"
        }`}
        style={{ paddingLeft: 12 + depth * 24 }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            className="shrink-0 rounded-md p-0.5 hover:bg-black/5 transition"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            type="button"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span className="flex-1">{node.title}</span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
          {node.type}
        </span>
      </div>
      {!isCollapsed && hasChildren && (
        <div>
          {node.children.map((child) => (
            <DocumentNode
              key={child.id}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
function ExplanationPanel({
  node,
  explanation,
  isLoading,
  onClose,
}: {
  node: KnowledgeNode;
  explanation: KnowledgeExplanation | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [practiceQuestions, setPracticeQuestions] = useState<Array<{id: string; type: string; typeLabel: string; question: string; answer: string; explanation: string; showAnswer: boolean}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="absolute right-0 top-0 z-50 h-full w-96 border-l border-slate-200 bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">{node.title}</h2>
            <button onClick={onClose} type="button" className="rounded-lg p-1.5 hover:bg-slate-100 transition">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-sky-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span className="ml-3 text-sm text-sky-600 font-medium">\u6b63\u5728\u751f\u6210\u8bf4\u660e...</span>
        </div>
      </div>
    );
  }
  // If explanation available, show API data
  if (explanation) {
    return (
      <div className="absolute right-0 top-0 z-50 h-full w-96 border-l border-slate-200 bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              </div>
              <h2 className="text-base font-bold text-slate-900 max-w-[220px] truncate">{node.title}</h2>
            </div>
            <button onClick={onClose} type="button" className="rounded-lg p-1.5 hover:bg-slate-100 transition">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="space-y-5 p-5 pb-8">
          <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-4">
            <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">{'\u6982\u5ff5\u5b9a\u4e49'}</h3>
            <p className="text-sm leading-7 text-slate-700">{explanation.oneSentence}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">{'\u4e3a\u4ec0\u4e48\u91cd\u8981'}</h3>
            <ul className="space-y-1.5">
              {explanation.keyPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4">
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">{'\u751f\u6d3b\u4e2d\u7684\u4f8b\u5b50'}</h3>
            <p className="text-sm leading-7 text-slate-700">{explanation.lifeExample}</p>
          </div>
          {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
            <div className="rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-4">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">{'\u5e38\u89c1\u8bef\u533a'}</h3>
              <ul className="space-y-1.5">
                {explanation.commonMistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-6 text-rose-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {explanation.summary && (
            <p className="text-sm leading-7 text-slate-600 bg-slate-50 rounded-xl p-4">{explanation.summary}</p>
          )}
        </div>
      </div>
    );
  }

  // Fallback: show node data
  // (original code continues below with node-based display)

  async function handleGeneratePractice() {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    const questions = generatePracticeForTopic(node.title, node.summary);
    setPracticeQuestions(questions);
    setIsGenerating(false);
  }

  function handleAnswerClick(questionId: string) {
    setPracticeQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, showAnswer: !q.showAnswer } : q))
    );
  }

  return (
    <div className="absolute right-0 top-0 z-50 h-full w-96 border-l border-slate-200 bg-white shadow-2xl overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-sky-500 uppercase tracking-wider">练习建议</p>
              <h2 className="text-base font-bold text-slate-900 leading-tight max-w-[240px] truncate">{node.title}</h2>
            </div>
          </div>
          <button onClick={onClose} type="button" className="rounded-lg p-1.5 hover:bg-slate-100 transition">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
      <div className="space-y-5 p-5 pb-8">
        <div className="flex flex-wrap gap-2">
          {node.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-600 border border-sky-100">{tag}</span>
          ))}
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600 border border-amber-100">重要度: {"*".repeat(node.importance)}</span>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-600 border border-violet-100">答案: {"#".repeat(node.difficulty)}</span>
        </div>
        {node.summary && (
          <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-3.5 w-3.5 text-sky-500" />
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">练习建议</h3>
            </div>
            <p className="text-sm leading-7 text-slate-700">{node.summary}</p>
          </div>
        )}
        {node.keyPoints.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <ListChecks className="h-3.5 w-3.5 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">练习建议</h3>
            </div>
            <div className="space-y-2">
              {node.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-slate-50/80 px-3.5 py-2.5 text-sm leading-6 text-slate-700">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">{i + 1}</span>
                  {point}
                </div>
              ))}
            </div>
          </div>
        )}
        {node.difficultPoints.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Brain className="h-3.5 w-3.5 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">练习建议</h3>
            </div>
            <ul className="space-y-1.5">
              {node.difficultPoints.map((item, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-rose-50/60 px-3.5 py-2 text-sm leading-6 text-rose-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {node.examPoints.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">练习建议</h3>
            </div>
            <ul className="space-y-1.5">
              {node.examPoints.map((item, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50/60 px-3.5 py-2 text-sm leading-6 text-amber-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {node.practiceAdvice && (
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">练习建议</h3>
            </div>
            <p className="text-sm leading-7 text-slate-700">{node.practiceAdvice}</p>
          </div>
        )}
        <div className="border-t border-slate-100 pt-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:from-sky-600 hover:to-sky-700 disabled:opacity-50"
            disabled={isGenerating}
            onClick={handleGeneratePractice}
            type="button"
          >
            {isGenerating ? (
              <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>练习建议???...</>
            ) : (
              <><ListChecks className="h-4 w-4" />练习建议???</>
            )}
          </button>
        </div>
        {practiceQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">??? ({practiceQuestions.length})</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            {practiceQuestions.map((q) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-3.5 py-3">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{q.typeLabel}</span>
                    <p className="text-sm leading-6 text-slate-800">{q.question}</p>
                  </div>
                  <button
                    className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
                    onClick={() => handleAnswerClick(q.id)}
                    type="button"
                  >
                    {q.showAnswer ? "练习建议" : "练习建议"}
                    <ChevronDown className={"h-3 w-3 transition " + (q.showAnswer ? "" : "-rotate-90")} />
                  </button>
                  {q.showAnswer && (
                    <div className="mt-2.5 rounded-lg bg-emerald-50 px-3.5 py-2.5">
                      <p className="text-sm font-semibold text-emerald-800">答案: {q.answer}</p>
                      <p className="mt-1 text-sm leading-6 text-emerald-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function generatePracticeForTopic(topic: string, definition: string): Array<{
  id: string; type: string; typeLabel: string; question: string; answer: string; explanation: string; showAnswer: boolean;
}> {
  return [
    { id: "q1", type: "single_choice", typeLabel: "\u5355\u9009", question: "\u5173\u4e8e\u300c" + topic + "\u300d\uff0c\u4ee5\u4e0b\u54ea\u4e2a\u63cf\u8ff0\u662f\u6b63\u786e\u7684\uff1f", answer: "\u300c" + topic + "\u300d\u662f\u5b66\u4e60\u8fc7\u7a0b\u4e2d\u7684\u91cd\u8981\u6982\u5ff5\uff0c\u9700\u8981\u7406\u89e3\u5176\u6838\u5fc3\u5b9a\u4e49\u548c\u5e94\u7528\u573a\u666f\u3002", explanation: "\u8fd9\u4e2a\u95ee\u9898\u8003\u5bdf\u5bf9\u300c" + topic + "\u300d\u57fa\u672c\u5b9a\u4e49\u7684\u7406\u89e3\uff0c\u5e94\u56f4\u7ed5\u5176\u6838\u5fc3\u7279\u5f81\u56de\u7b54\u3002", showAnswer: false },
    { id: "q2", type: "true_false", typeLabel: "\u5224\u65ad", question: "\u300c" + topic + "\u300d\u53ea\u9700\u8981\u80cc\u4e0b\u5b9a\u4e49\u5c31\u7b49\u4e8e\u638c\u63e1\u4e86\u3002\u5bf9\u8fd8\u662f\u9519\uff1f", answer: "\u9519\u8bef", explanation: "\u5149\u80cc\u5b9a\u4e49\u4e0d\u591f\uff0c\u8fd8\u9700\u8981\u901a\u8fc7\u7ec3\u4e60\u3001\u4e3e\u4f8b\u548c\u5e94\u7528\u6765\u9a8c\u8bc1\u662f\u5426\u771f\u6b63\u638c\u63e1\u3002", showAnswer: false },
    { id: "q3", type: "short_answer", typeLabel: "\u7b80\u7b54", question: "\u8bf7\u7528\u4e00\u53e5\u8bdd\u89e3\u91ca\u300c" + topic + "\u300d\u662f\u4ec0\u4e48\uff0c\u5e76\u4e3e\u4e00\u4e2a\u751f\u6d3b\u4e2d\u7684\u4f8b\u5b50\u3002", answer: "\u300c" + topic + "\u300d\u662f\u6307" + (definition || "\u5728\u5b66\u4e60\u8fc7\u7a0b\u4e2d\u9700\u8981\u638c\u63e1\u7684\u6838\u5fc3\u77e5\u8bc6\u70b9") + "\u3002\u4f8b\u5982\uff0c\u5728\u5b9e\u9645\u5b66\u4e60\u4e2d\u53ef\u4ee5\u901a\u8fc7\u7ec3\u4e60\u6765\u52a0\u6df1\u7406\u89e3\u3002", explanation: "\u56de\u7b54\u65f6\u5e94\u5305\u542b\u5b9a\u4e49\u548c\u5177\u4f53\u4f8b\u5b50\u4e24\u4e2a\u8981\u7d20\u3002", showAnswer: false },
    { id: "q4", type: "choice", typeLabel: "\u591a\u9009", question: "\u5b66\u4e60\u300c" + topic + "\u300d\u65f6\uff0c\u4ee5\u4e0b\u54ea\u4e9b\u65b9\u6cd5\u662f\u6709\u6548\u7684\uff1f", answer: "\u7406\u89e3\u5b9a\u4e49\u3001\u5b8c\u6210\u7ec3\u4e60\u3001\u4e3e\u4f8b\u5b50\u3001\u6559\u7ed9\u522b\u4eba", explanation: "\u4e3b\u52a8\u5b66\u4e60\u65b9\u6cd5\u5305\u62ec\u7406\u89e3\u3001\u5e94\u7528\u3001\u8f93\u51fa\u548c\u53cd\u9988\uff0c\u5355\u7eaf\u9605\u8bfb\u4e0d\u7b97\u3002", showAnswer: false },
    { id: "q5", type: "project", typeLabel: "\u5b9e\u64cd", question: "\u8bf7\u8bbe\u8ba1\u4e00\u4e2a 5 \u5206\u949f\u7684\u5c0f\u7ec3\u4e60\uff0c\u5e2e\u52a9\u521d\u5b66\u8005\u638c\u63e1\u300c" + topic + "\u300d\u3002", answer: "\u63a8\u8350\u7ec3\u4e60\uff1a1.\u7528\u81ea\u5df1\u7684\u8bdd\u89e3\u91ca\u300c" + topic + "\u300d 2.\u627e\u4e00\u4e2a\u751f\u6d3b\u4e2d\u7684\u5e94\u7528\u573a\u666f 3.\u5b8c\u6210\u4e00\u9053\u76f8\u5173\u7ec3\u4e60\u9898", explanation: "\u5b9e\u64cd\u7ec3\u4e60\u80fd\u5e2e\u52a9\u5c06\u77e5\u8bc6\u70b9\u8f6c\u5316\u4e3a\u5b9e\u9645\u80fd\u529b\u3002", showAnswer: false },
  ];
}function countAll(node: KnowledgeNode): number {
  return 1 + node.children.reduce((s, c) => s + countAll(c), 0);
}

