"use client";

import { Bot, Loader2, Send } from "lucide-react";
import type { ChatMessage } from "@/lib/mockLearningData";

type AiTeacherPageProps = {
  draft: string;
  goal?: string;
  isLoading: boolean;
  messages: ChatMessage[];
  onDraftChange: (value: string) => void;
  onGoHome: () => void;
  onQuickAction: (label: string) => void;
  onSend: () => void;
};

const quickActions = ["讲简单点", "生成思维导图", "生成练习题", "总结重点"];

export function AiTeacherPage({
  draft,
  goal,
  isLoading,
  messages,
  onDraftChange,
  onGoHome,
  onQuickAction,
  onSend,
}: AiTeacherPageProps) {
  if (!goal) {
    return (
      <section className="rounded-[28px] border border-dashed border-sky-200 bg-white p-5 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-950">AI 老师还没有学习主题</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">先在首页输入学习目标，AI 老师会围绕该目标讲解和答疑。</p>
        <button
          className="mt-4 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100"
          onClick={onGoHome}
          type="button"
        >
          去首页生成
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
      <header className="rounded-[28px] bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold text-sky-600">当前学习主题</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{goal}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">AI 老师会按规划讲解、出题、复盘，而不是固定回复。</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            key={action}
            onClick={() => onQuickAction(action)}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>

      <section className="flex-1 space-y-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        {messages.map((message) => (
          <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}>
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 ${
                message.role === "user" ? "bg-sky-600 text-white" : "bg-slate-50 text-slate-700"
              }`}
            >
              {message.role === "ai" ? (
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-sky-700">
                  <Bot className="h-4 w-4" />
                  AI 老师
                </div>
              ) : null}
              {message.content}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI 正在思考
            </div>
          </div>
        ) : null}
      </section>
      </div>

      <div className="px-4 pb-3 pt-2">
      <form
        className="rounded-3xl border border-slate-200 bg-white p-2 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <div className="flex items-center gap-2">
          <input
            aria-label="向 AI 老师提问"
            className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            disabled={isLoading}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="问 AI 老师一个和当前目标相关的问题"
            value={draft}
          />
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isLoading || draft.trim().length === 0}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
