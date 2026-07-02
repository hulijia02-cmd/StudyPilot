import { z } from "zod";

export const practiceQuestionTypeSchema = z.enum([
  "single_choice",
  "fill_blank",
  "true_false",
  "short_answer",
  "coding",
]);

export const practiceAgentRequestSchema = z.object({
  topic: z.string().min(1),
  subject: z.string().default("general"),
  learnerLevel: z.enum(["zero_based", "beginner", "intermediate"]).default("zero_based"),
  learningGoal: z.string().optional(),
  questionTypes: z.array(practiceQuestionTypeSchema).default([
    "single_choice",
    "fill_blank",
    "true_false",
    "short_answer",
    "coding",
  ]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
});

export const scoringRuleSchema = z.object({
  method: z.enum(["exact_match", "keyword_match", "boolean_match", "rubric", "code_static_check"]),
  maxScore: z.number().int().positive(),
  keywords: z.array(z.string()).default([]),
  requiredIncludes: z.array(z.string()).default([]),
  rubric: z.array(z.string()).default([]),
});

export const practiceQuestionSchema = z.object({
  id: z.string(),
  type: practiceQuestionTypeSchema,
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  question: z.string(),
  options: z.array(z.string()).optional(),
  points: z.number().int().positive(),
  standardAnswer: z.object({
    value: z.union([z.string(), z.boolean()]),
    explanation: z.string(),
  }),
  scoringRule: scoringRuleSchema,
});

export const practiceAgentResponseSchema = z.object({
  agent: z.literal("practice-agent"),
  version: z.string(),
  topic: z.string(),
  subject: z.string(),
  questions: z.array(practiceQuestionSchema).min(1),
  totalPoints: z.number().int().positive(),
  autoScoringSupported: z.literal(true),
});

export const practiceSubmissionSchema = z.object({
  topic: z.string().min(1),
  questions: z.array(practiceQuestionSchema).min(1),
  answers: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

export const practiceScoreItemSchema = z.object({
  questionId: z.string(),
  type: practiceQuestionTypeSchema,
  score: z.number().min(0),
  maxScore: z.number().positive(),
  isCorrect: z.boolean(),
  feedback: z.string(),
});

export const practiceScoreResponseSchema = z.object({
  agent: z.literal("practice-agent"),
  version: z.string(),
  topic: z.string(),
  totalScore: z.number().min(0),
  totalPoints: z.number().positive(),
  accuracy: z.number().min(0).max(1),
  results: z.array(practiceScoreItemSchema),
  nextAction: z.object({
    type: z.enum(["review_mistakes", "continue_learning", "generate_more_practice"]),
    label: z.string(),
  }),
});

export type PracticeQuestionType = z.infer<typeof practiceQuestionTypeSchema>;
export type PracticeAgentRequest = z.infer<typeof practiceAgentRequestSchema>;
export type PracticeQuestion = z.infer<typeof practiceQuestionSchema>;
export type PracticeAgentResponse = z.infer<typeof practiceAgentResponseSchema>;
export type PracticeSubmission = z.infer<typeof practiceSubmissionSchema>;
export type PracticeScoreResponse = z.infer<typeof practiceScoreResponseSchema>;
