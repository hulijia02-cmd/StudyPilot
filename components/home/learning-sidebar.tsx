"use client";

import {
  BarChart3,
  BookOpenCheck,
  Bot,
  CalendarDays,
  ChevronRight,
  GitFork,
  Home,
  Map,
  Network,
  Target,
} from "lucide-react";
import type {
  HomeModule,
  KnowledgeTreeItem,
  LearningRouteItem,
} from "@/components/home/home-types";

type LearningSidebarProps = {
  activeModule: HomeModule;
  expandedRouteId: string;
  knowledgeItems: KnowledgeTreeItem[];
  routeItems: LearningRouteItem[];
  selectedKnowledgeId: string;
  selectedRouteId: string;
  onKnowledgeClick: (id: string) => void;
  onModuleChange: (module: HomeModule) => void;
  onRouteClick: (id: string) => void;
};

const navItems: { id: HomeModule; label: string; icon: typeof Home }[] = [
  { id: "home", label: "首页", icon: Home },
  { id: "plan", label: "学习计划", icon: CalendarDays },
  { id: "tree", label: "知识树", icon: Network },
  { id: "teacher", label: "AI老师", icon: Bot },
  { id: "practice", label: "练习", icon: BookOpenCheck },
  { id: "report", label: "学习报告", icon: BarChart3 },
];

const planItems = ["09:30 概念学习", "14:00 练习测评", "20:30 错题复盘"];

export function LearningSidebar({
  activeModule,
  expandedRouteId,
  knowledgeItems,
  onKnowledgeClick,
  onModuleChange,
  onRouteClick,
  routeItems,
  selectedKnowledgeId,
  selectedRouteId,
}: LearningSidebarProps) {
  return (
    <aside className="grid gap-5 lg:grid-cols-3 xl:grid-cols-1">
      <PanelHeaderCard />

      <section className="rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-soft backdrop-blur-2xl">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          {navItems.map((item) => (
            <button
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium transition ${
                activeModule === item.id
                  ? "bg-foreground text-background"
                  : "bg-background/70 text-foreground hover:bg-muted"
              }`}
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              type="button"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
        <SectionTitle icon={Map} title="学习路线" action={`${routeItems.length} 阶段`} />
        <div className="mt-5 space-y-3">
          {routeItems.map((item) => (
            <button
              className={`w-full rounded-2xl p-3 text-left transition hover:bg-muted ${
                selectedRouteId === item.id ? "bg-primary/10" : "bg-background/70"
              }`}
              key={item.id}
              onClick={() => onRouteClick(item.id)}
              type="button"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{item.title}</span>
                <span className="text-muted-foreground">{item.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
              {expandedRouteId === item.id ? (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs leading-5 text-muted-foreground">
                  <p>{item.detail}</p>
                  <p className="mt-2 font-medium text-foreground">{item.duration}</p>
                  <p>{item.deliverable}</p>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
        <SectionTitle icon={Network} title="知识树" action="点击查看" />
        <div className="mt-5 space-y-2">
          {knowledgeItems.map((item) => (
            <button
              className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${
                selectedKnowledgeId === item.id
                  ? "bg-foreground text-background"
                  : "bg-background/70 text-foreground hover:bg-muted"
              }`}
              key={item.id}
              onClick={() => onKnowledgeClick(item.id)}
              style={{ marginLeft: `${(item.level - 1) * 16}px`, width: `calc(100% - ${(item.level - 1) * 16}px)` }}
              type="button"
            >
              <GitFork className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
              <span className="text-xs opacity-70">{statusLabel(item.status)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
        <SectionTitle icon={CalendarDays} title="学习计划" action="今天" />
        <div className="mt-5 space-y-3">
          {planItems.map((item) => (
            <button
              className="flex w-full items-center justify-between rounded-2xl bg-background/70 px-4 py-3 text-left transition hover:bg-muted"
              key={item}
              onClick={() => onModuleChange("plan")}
              type="button"
            >
              <span className="text-sm font-medium">{item}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function PanelHeaderCard() {
  return (
    <section className="rounded-[28px] bg-foreground p-5 text-background shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-white/65">当前目标</p>
          <h2 className="text-lg font-semibold">30 天掌握 Arduino 基础</h2>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <MiniStat value="18" label="知识点" />
        <MiniStat value="42%" label="进度" />
        <MiniStat value="B+" label="状态" />
      </div>
    </section>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Map;
  title: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{action}</span>
    </div>
  );
}

function statusLabel(status: KnowledgeTreeItem["status"]) {
  const labels: Record<KnowledgeTreeItem["status"], string> = {
    completed: "已完成",
    learning: "学习中",
    weak: "薄弱",
    not_started: "未开始",
    review_due: "待复习",
  };
  return labels[status];
}
