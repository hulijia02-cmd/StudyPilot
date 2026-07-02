export type AgentName =
  | "goal-diagnosis-agent"
  | "knowledge-agent"
  | "learning-planner-agent"
  | "mindmap-agent"
  | "practice-agent"
  | "curriculum-planner-agent"
  | "tutor-agent"
  | "exercise-agent"
  | "evaluator-agent"
  | "review-agent"
  | "progress-analyst-agent";

export type AgentTask =
  | "diagnose_goal"
  | "plan_learning"
  | "explain_knowledge"
  | "generate_mindmap"
  | "generate_practice"
  | "score_practice"
  | "create_plan"
  | "teach_topic"
  | "generate_exercise"
  | "evaluate_answer"
  | "schedule_review"
  | "analyze_progress";
