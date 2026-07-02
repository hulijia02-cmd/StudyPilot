import { z } from "zod";

export const learningPlannerRequestSchema = z.object({
  goal: z.string().min(2).describe("User's learning goal, for example: I want to learn Arduino."),
  currentLevel: z
    .enum(["unknown", "beginner", "some_experience", "intermediate"])
    .default("unknown"),
  weeklyHours: z.number().int().positive().max(80).default(6),
  targetOutcome: z.string().optional(),
  deadlineWeeks: z.number().int().positive().max(52).optional(),
  learningPreference: z
    .enum(["project_based", "exam_based", "concept_first", "hands_on_first"])
    .default("hands_on_first"),
});

export const knowledgeNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.number().int().min(1).max(5),
  prerequisites: z.array(z.string()),
});

export const learningPhaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  durationWeeks: z.number().int().positive(),
  knowledgeNodes: z.array(knowledgeNodeSchema),
  deliverable: z.string(),
});

export const weeklyPlanSchema = z.object({
  week: z.number().int().positive(),
  theme: z.string(),
  goals: z.array(z.string()),
  tasks: z.array(z.string()),
  practice: z.array(z.string()),
  assessment: z.string(),
});

export const learningPlannerResponseSchema = z.object({
  agent: z.literal("learning-planner-agent"),
  version: z.string(),
  goalAnalysis: z.object({
    normalizedGoal: z.string(),
    domain: z.string(),
    assumedCurrentLevel: z.string(),
    targetOutcome: z.string(),
    constraints: z.array(z.string()),
    learnerRisks: z.array(z.string()),
  }),
  learningRoute: z.object({
    title: z.string(),
    phases: z.array(learningPhaseSchema),
  }),
  learningPlan: z.object({
    estimatedCompletionWeeks: z.number().int().positive(),
    weeklyHours: z.number().int().positive(),
    weeklyPlan: z.array(weeklyPlanSchema),
  }),
  successCriteria: z.array(z.string()),
  nextAction: z.object({
    type: z.enum(["start_first_lesson", "ask_diagnostic_questions", "adjust_plan"]),
    label: z.string(),
  }),
});

export type LearningPlannerRequest = z.infer<typeof learningPlannerRequestSchema>;
export type LearningPlannerResponse = z.infer<typeof learningPlannerResponseSchema>;
