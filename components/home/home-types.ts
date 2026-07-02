export type HomeModule = "home" | "plan" | "tree" | "teacher" | "practice" | "report";

export type LearningRouteItem = {
  id: string;
  title: string;
  progress: number;
  detail: string;
  duration: string;
  deliverable: string;
};

export type KnowledgeTreeItem = {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  status: "completed" | "learning" | "weak" | "not_started" | "review_due";
  explanation: {
    oneSentence: string;
    keyPoints: string[];
    difficultPoints: string[];
    examPoints: string[];
  };
};

export type DailyTask = {
  id: string;
  title: string;
  time: string;
  done: boolean;
};

export type AiMessage = {
  role: "teacher" | "user";
  content: string;
};

export type PracticeQuestion = {
  id: string;
  type: string;
  question: string;
  options?: string[];
  standardAnswer: {
    value: string | boolean;
    explanation: string;
  };
  points: number;
};

export type PlannerSummary = {
  goal: string;
  estimatedWeeks: number;
  weeklyHours: number;
  phases: string[];
};
