import { z } from "zod";

export const knowledgeAgentRequestSchema = z.object({
  topic: z.string().min(1).describe("The knowledge point to explain."),
  subject: z.string().default("general"),
  learnerLevel: z.enum(["zero_based", "beginner", "intermediate"]).default("zero_based"),
  language: z.enum(["zh-CN", "en"]).default("zh-CN"),
  learningGoal: z.string().optional(),
});

export const knowledgeAgentResponseSchema = z.object({
  agent: z.literal("knowledge-agent"),
  version: z.string(),
  topic: z.string(),
  subject: z.string(),
  learnerLevel: z.string(),
  explanation: z.object({
   oneSentence: z.string(),
    definition: z.string(),
    whyImportant: z.string(),
   lifeExample: z.string(),
  designApplication: z.string(),
 keyPoints: z.array(z.string()).min(1),
    difficultPoints: z.array(z.string()).min(1),
    examPoints: z.array(z.string()).min(1),
    commonMistakes: z.array(z.string()).min(1),
    summary: z.string(),
  }),
  nextStep: z.object({
    type: z.enum(["practice", "mindmap", "next_topic", "review"]),
    label: z.string(),
  }),
});

export type KnowledgeAgentRequest = z.infer<typeof knowledgeAgentRequestSchema>;
export type KnowledgeAgentResponse = z.infer<typeof knowledgeAgentResponseSchema>;
