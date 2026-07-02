"use client";

import { Bot, CalendarDays, FileText, Home, Network } from "lucide-react";
import type { AppTab } from "@/lib/mockLearningData";

type BottomTabBarProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const tabs: Array<{ id: AppTab; label: string; icon: typeof Home }> = [
  { id: "home", label: "首页", icon: Home },
  { id: "material", label: "资料", icon: FileText },
  { id: "plan", label: "计划", icon: CalendarDays },
  { id: "tree", label: "知识树", icon: Network },
  { id: "teacher", label: "AI老师", icon: Bot },
];

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/92 px-3 pb-3 pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              aria-pressed={isActive}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition ${
                isActive
                  ? "bg-sky-100 text-sky-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
