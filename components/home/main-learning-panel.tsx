"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clock3,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DailyTask,
  HomeModule,
  KnowledgeTreeItem,
  LearningRouteItem,
  PlannerSummary,
  PracticeQuestion,
} from "@/components/home/home-types";

type MainLearningPanelProps = {
  activeModule: HomeModule;
  isPracticing: boolean;
  plannerSummary: PlannerSummary | null;
  practiceQuestions: PracticeQuestion[];
  selectedKnowledge: KnowledgeTreeItem;
  selectedRoute: LearningRouteItem;
  tasks: DailyTask[];
  onGeneratePractice: () => void;
  onModuleChange: (module: HomeModule) => void;
  onStartLearning: () => void;
};

const recommendations = [
  "先用 Blink 建立“代码控制硬件”的直觉，再进入引脚和电路规则。",
  "你在 pinMode 上标记为薄弱，今天少学新内容，多做输入输出判断题。",
  "建议本周项目选择智能夜灯，和当前知识树匹配度最高。",
];

export function MainLearningPanel({
  activeModule,
  isPracticing,
  plannerSummary,
  practiceQuestions,
  selectedKnowledge,
  selectedRoute,
  tasks,
  onGeneratePractice,
  onModuleChange,
  onStartLearning,
}: MainLearningPanelProps) {
  return (
    <div className="grid gap-5">
      <HeroPanel
        activeModule={activeModule}
        isPracticing={isPracticing}
        onGeneratePractice={onGeneratePractice}
        onStartLearning={onStartLearning}
        selectedKnowledge={selectedKnowledge}
      />

      {activeModule === "plan" ? (
        <PlanPanel plannerSummary={plannerSummary} selectedRoute={selectedRoute} />
      ) : null}
      {activeModule === "tree" ? <KnowledgePanel selectedKnowledge={selectedKnowledge} /> : null}
      {activeModule === "practice" ? (
        <PracticePanel
          isPracticing={isPracticing}
          onGeneratePractice={onGeneratePractice}
          questions={practiceQuestions}
        />
      ) : null}
      {activeModule === "report" ? <ReportPanel /> : null}

      {activeModule === "home" || activeModule === "teacher" ? (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <TodayPanel tasks={tasks} onModuleChange={onModuleChange} />
            <ProgressPanel />
          </div>
          <RecommendationPanel />
        </>
      ) : null}
    </div>
  );
}

function HeroPanel({
  activeModule,
  isPracticing,
  onGeneratePractice,
  onStartLearning,
  selectedKnowledge,
}: {
  activeModule: HomeModule;
  isPracticing: boolean;
  selectedKnowledge: KnowledgeTreeItem;
  onGeneratePractice: () => void;
  onStartLearning: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/82 shadow-soft backdrop-blur-2xl">
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_280px] lg:p-7">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {activeModule === "tree" ? "正在查看知识点讲解" : "AI 已根据掌握度调整今日任务"}
          </div>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {activeModule === "tree"
              ? selectedKnowledge.title
              : "今日学习：用 Arduino 点亮第一个 LED"}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            {activeModule === "tree"
              ? selectedKnowledge.explanation.oneSentence
              : "先建立直觉，再做概念判断，最后把错因沉淀到复习系统里。"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onStartLearning} type="button">
              开始学习
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button disabled={isPracticing} onClick={onGeneratePractice} type="button" variant="secondary">
              {isPracticing ? "生成中..." : "生成练习"}
            </Button>
          </div>
        </div>

        <button
          className="rounded-[26px] bg-foreground p-5 text-left text-background transition hover:scale-[1.01]"
          onClick={onGeneratePractice}
          type="button"
        >
          <p className="text-sm text-white/60">预计完成</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-semibold">38</span>
            <span className="pb-2 text-sm text-white/60">分钟</span>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/14">
            <div className="h-full w-[64%] rounded-full bg-accent" />
          </div>
          <p className="mt-3 text-sm text-white/65">点击生成练习题</p>
        </button>
      </div>
    </section>
  );
}

function TodayPanel({
  tasks,
  onModuleChange,
}: {
  tasks: DailyTask[];
  onModuleChange: (module: HomeModule) => void;
}) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <PanelTitle icon={BookOpenCheck} title="今日学习" />
      <div className="mt-5 space-y-3">
        {tasks.map((task) => (
          <button
            className="flex w-full items-center justify-between rounded-2xl bg-background/75 px-4 py-4 text-left transition hover:bg-muted"
            key={task.id}
            onClick={() => onModuleChange(task.done ? "report" : "practice")}
            type="button"
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  task.done
                    ? "flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success"
                    : "flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                }
              >
                {task.done ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
              </span>
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.time}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </section>
  );
}

function ProgressPanel() {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <PanelTitle icon={Brain} title="学习进度" />
      <div className="mt-5 flex items-center gap-5">
        <button
          className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(hsl(var(--primary))_0_252deg,hsl(var(--muted))_252deg_360deg)]"
          onClick={() => window.alert("当前综合掌握度 70%。")}
          type="button"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
            <span className="text-2xl font-semibold">70%</span>
          </div>
        </button>
        <div className="space-y-3 text-sm">
          <ProgressRow label="概念理解" value="82%" />
          <ProgressRow label="练习正确率" value="68%" />
          <ProgressRow label="复习稳定度" value="61%" />
        </div>
      </div>
    </section>
  );
}

function RecommendationPanel() {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <PanelTitle icon={Sparkles} title="AI 推荐" />
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {recommendations.map((item) => (
          <button
            className="rounded-2xl bg-background/75 p-4 text-left transition hover:bg-muted"
            key={item}
            onClick={() => window.alert(item)}
            type="button"
          >
            <p className="text-sm leading-6 text-muted-foreground">{item}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function PlanPanel({
  plannerSummary,
  selectedRoute,
}: {
  plannerSummary: PlannerSummary | null;
  selectedRoute: LearningRouteItem;
}) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <PanelTitle icon={BookOpenCheck} title="学习计划" />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-background/75 p-4">
          <p className="text-sm text-muted-foreground">当前阶段</p>
          <h3 className="mt-2 text-xl font-semibold">{selectedRoute.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedRoute.detail}</p>
          <p className="mt-3 text-sm font-medium">{selectedRoute.duration}</p>
          <p className="text-sm text-muted-foreground">{selectedRoute.deliverable}</p>
        </div>
        <div className="rounded-2xl bg-background/75 p-4">
          <p className="text-sm text-muted-foreground">AI 规划结果</p>
          <h3 className="mt-2 text-xl font-semibold">
            {plannerSummary ? `${plannerSummary.estimatedWeeks} 周完成` : "等待生成计划"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {plannerSummary
              ? `${plannerSummary.goal}。每周约 ${plannerSummary.weeklyHours} 小时。`
              : "在顶部输入学习目标，点击开始学习即可调用 Learning Planner Agent。"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(plannerSummary?.phases ?? ["入门基础", "基础电路", "传感器", "项目实战"]).map((phase) => (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary" key={phase}>
                {phase}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KnowledgePanel({ selectedKnowledge }: { selectedKnowledge: KnowledgeTreeItem }) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <PanelTitle icon={Brain} title="知识点讲解" />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="一句话解释" items={[selectedKnowledge.explanation.oneSentence]} />
        <InfoBlock title="重点" items={selectedKnowledge.explanation.keyPoints} />
        <InfoBlock title="难点" items={selectedKnowledge.explanation.difficultPoints} />
        <InfoBlock title="考点" items={selectedKnowledge.explanation.examPoints} />
      </div>
    </section>
  );
}

function PracticePanel({
  isPracticing,
  onGeneratePractice,
  questions,
}: {
  isPracticing: boolean;
  questions: PracticeQuestion[];
  onGeneratePractice: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <PanelTitle icon={BookOpenCheck} title="练习题" />
        <Button disabled={isPracticing} onClick={onGeneratePractice} type="button" variant="secondary">
          {isPracticing ? "生成中..." : "重新生成"}
        </Button>
      </div>
      <div className="mt-5 space-y-3">
        {questions.length === 0 ? (
          <p className="rounded-2xl bg-background/75 p-4 text-sm text-muted-foreground">
            点击“生成练习”，Practice Agent 会自动生成选择题、填空题、判断题、简答题和编程题。
          </p>
        ) : (
          questions.map((question, index) => (
            <article className="rounded-2xl bg-background/75 p-4" key={question.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {index + 1}. {question.question}
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  {question.points} 分
                </span>
              </div>
              {question.options ? (
                <div className="mt-3 grid gap-2">
                  {question.options.map((option) => (
                    <button
                      className="rounded-xl border border-border bg-white/70 px-3 py-2 text-left text-sm transition hover:bg-muted"
                      key={option}
                      onClick={() => window.alert(`标准答案：${String(question.standardAnswer.value)}\n${question.standardAnswer.explanation}`)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  className="mt-3 rounded-xl border border-border bg-white/70 px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted"
                  onClick={() => window.alert(`标准答案：${String(question.standardAnswer.value)}\n${question.standardAnswer.explanation}`)}
                  type="button"
                >
                  查看标准答案
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ReportPanel() {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur-2xl">
      <PanelTitle icon={Brain} title="学习报告" />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <InfoBlock title="本周完成率" items={["82%", "今日建议保持 30-40 分钟学习。"]} />
        <InfoBlock title="薄弱点" items={["pinMode", "面包板连通规则", "delay 时间控制"]} />
        <InfoBlock title="下一步" items={["先复盘错题，再生成一组变式练习。"]} />
      </div>
    </section>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-background/75 p-4">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PanelTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <button
      className="flex min-w-40 items-center justify-between gap-4 rounded-xl px-2 py-1 text-left transition hover:bg-muted"
      onClick={() => window.alert(`${label}: ${value}`)}
      type="button"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </button>
  );
}
