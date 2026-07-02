"use client";

import { Bot, Lightbulb, Mic, Send, WandSparkles } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AiMessage, KnowledgeTreeItem } from "@/components/home/home-types";

type AiTeacherPanelProps = {
  messages: AiMessage[];
  selectedKnowledge: KnowledgeTreeItem;
  onGeneratePractice: () => void;
  onSendMessage: (question: string) => void;
};

export function AiTeacherPanel({
  messages,
  selectedKnowledge,
  onGeneratePractice,
  onSendMessage,
}: AiTeacherPanelProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendDraft();
  }

  function sendDraft() {
    const value = (inputRef.current?.value ?? draft).trim();
    if (!value) {
      return;
    }

    onSendMessage(value);
    setDraft("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <aside className="flex min-h-[720px] flex-col rounded-[32px] border border-white/70 bg-white/84 p-5 shadow-soft backdrop-blur-2xl xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button className="flex items-center gap-3 text-left" onClick={() => onSendMessage("请介绍当前知识点")} type="button">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">AI 老师</h2>
            <p className="text-sm text-muted-foreground">Tutor Agent 在线</p>
          </div>
        </button>
        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          Adaptive
        </span>
      </div>

      <button
        className="mt-4 rounded-2xl bg-primary/10 p-4 text-left transition hover:bg-primary/15"
        onClick={() => onSendMessage(`请用生活例子讲解 ${selectedKnowledge.title}`)}
        type="button"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Lightbulb className="h-4 w-4" />
          当前教学策略
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          围绕「{selectedKnowledge.title}」先用生活例子建立直觉，再通过短题评估掌握度。
        </p>
      </button>

      <section className="mt-4 rounded-2xl bg-background/80 p-4">
        <h3 className="text-sm font-semibold">{selectedKnowledge.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {selectedKnowledge.explanation.oneSentence}
        </p>
        <div className="mt-3 grid gap-3 text-xs leading-5 text-muted-foreground">
          <KnowledgeList title="重点" items={selectedKnowledge.explanation.keyPoints} />
          <KnowledgeList title="难点" items={selectedKnowledge.explanation.difficultPoints} />
          <KnowledgeList title="考点" items={selectedKnowledge.explanation.examPoints} />
        </div>
      </section>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            key={`${message.role}-${index}-${message.content}`}
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[86%] rounded-[22px] bg-foreground px-4 py-3 text-sm leading-6 text-background"
                  : "max-w-[86%] rounded-[22px] bg-background px-4 py-3 text-sm leading-6 text-foreground"
              }
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        <button
          className="flex items-center gap-2 rounded-2xl bg-background px-4 py-3 text-left text-sm font-medium transition hover:bg-muted"
          onClick={onGeneratePractice}
          type="button"
        >
          <WandSparkles className="h-4 w-4 text-primary" />
          生成 5 类练习题
        </button>
        <form
          className="flex items-center gap-2 rounded-2xl border border-border bg-background/80 p-2"
          onSubmit={handleSubmit}
        >
          <Button
            aria-label="语音输入"
            onClick={() => setDraft("请用更简单的话解释 " + selectedKnowledge.title)}
            type="button"
            variant="ghost"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendDraft();
              }
            }}
            placeholder="向 AI 老师提问..."
            ref={inputRef}
            value={draft}
          />
          <Button aria-label="发送" onClick={sendDraft} type="button">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}

function KnowledgeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-foreground">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
