export type LearningGoal = {
  id: string;
  title: string;
  description: string;
  targetLevel: string;
  weeklyHours: number;
  status: "draft" | "active" | "paused" | "completed";
};

export type KnowledgePoint = {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  masteryScore: number;
};
export type LearningPurpose = "考试复习" | "课程作业" | "软件实操" | "项目制作" | "考研考证" | "兴趣入门";
export type LearningLevel = "零基础" | "学过一点" | "已经会基础" | "想快速复习";
export type TimeLimit = "1天" | "3天" | "7天" | "30天";

export type KnowledgePriority = 1 | 2 | 3 | 4 | 5;

export type KnowledgeMapNode = {
  title: string;
  summary: string;
  type: "concept" | "skill" | "tool" | "project" | "exam";
  importance: KnowledgePriority;
  difficulty: KnowledgePriority;
  priority: KnowledgePriority;
  reason: string;
  canSkip: boolean;
  children: KnowledgeMapNode[];
};

export type KeyPoint = {
  title: string;
  reason: string;
  relatedGoal: string;
  priority: KnowledgePriority;
};

export type FileAnalysisResult = {
  fileTitle: string;
  userGoal: string;
  learningProfile: {
    purpose: string;
    level: string;
    timeLimit: string;
  };
  summary: string;
  knowledgeMap: KnowledgeMapNode[];
  keyPoints: KeyPoint[];
  difficultPoints: { title: string; reason: string; priority: KnowledgePriority }[];
  skipSuggestions: { title: string; reason: string }[];
  learningPath: { step: number; title: string; estimatedTime: string; nodes: string[] }[];
  practiceQuestions: { id: string; type: string; question: string; answer: string; explanation: string }[];
};
