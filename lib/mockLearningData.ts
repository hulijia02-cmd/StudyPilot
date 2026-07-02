export type AppTab = "home" | "plan" | "tree" | "teacher" | "material";

export type KnowledgeStatus = "not_started" | "learning" | "mastered";
export type KnowledgeType = "concept" | "skill" | "tool" | "project" | "exam";

export type KnowledgeNode = {
  id: string;
  title: string;
  summary: string;
  importance: 1 | 2 | 3 | 4 | 5;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: KnowledgeStatus;
  type: KnowledgeType;
  order: string;
  keyPoints: string[];
  difficultPoints: string[];
  examPoints: string[];
  practiceAdvice: string;
  tags: string[];
  children: KnowledgeNode[];
};

export type DailyPlan = {
  day: number;
  title: string;
  estimatedTime: string;
  focus: string;
  practice: string;
  details: string[];
};

export type ChatMessage = {
  id: string;
  role: "ai" | "user";
  content: string;
};

export type LearningProgram = {
  goal: string;
  domain: string;
  outcome: string;
  recommendedTasks: string[];
  plan: DailyPlan[];
  tree: KnowledgeNode[];
  progress: number;
  aiSuggestion: string;
};

export const defaultLearningGoal = "";
