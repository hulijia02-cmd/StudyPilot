import type { AgentName, AgentTask } from "@/types/ai";

const agentByTask: Record<AgentTask, AgentName> = {
  diagnose_goal: "goal-diagnosis-agent",
  explain_knowledge: "knowledge-agent",
  generate_mindmap: "mindmap-agent",
  generate_practice: "practice-agent",
  score_practice: "practice-agent",
  plan_learning: "learning-planner-agent",
  create_plan: "curriculum-planner-agent",
  teach_topic: "tutor-agent",
  generate_exercise: "exercise-agent",
  evaluate_answer: "evaluator-agent",
  schedule_review: "review-agent",
  analyze_progress: "progress-analyst-agent",
};

export function resolveAgent(task: AgentTask): AgentName {
  return agentByTask[task];
}
