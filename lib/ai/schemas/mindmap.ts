import { z } from "zod";

export const learningStatusSchema = z.enum([
  "not_started",
  "learning",
  "completed",
  "weak",
  "review_due",
]);

export const mindMapAgentRequestSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1).describe("Learning content, plan, notes, or knowledge points."),
  subject: z.string().default("general"),
  maxDepth: z.literal(3).default(3),
  includeStatus: z.boolean().default(true),
  knownStatuses: z
    .record(z.string(), learningStatusSchema)
    .default({})
    .describe("Optional status map keyed by knowledge node title or id."),
});

const mindMapLevelThreeNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: learningStatusSchema,
  children: z.array(z.never()).default([]),
});

const mindMapLevelTwoNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: learningStatusSchema,
  children: z.array(mindMapLevelThreeNodeSchema),
});

const mindMapLevelOneNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: learningStatusSchema,
  children: z.array(mindMapLevelTwoNodeSchema),
});

export const mindMapNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: learningStatusSchema,
  children: z.array(mindMapLevelOneNodeSchema),
});

export const mindMapAgentResponseSchema = z.object({
  agent: z.literal("mindmap-agent"),
  version: z.string(),
  title: z.string(),
  subject: z.string(),
  format: z.literal("markmap-markdown"),
  markdown: z.string(),
  legend: z.record(learningStatusSchema, z.string()),
  tree: mindMapNodeSchema,
});

export type LearningStatus = z.infer<typeof learningStatusSchema>;
export type MindMapAgentRequest = z.infer<typeof mindMapAgentRequestSchema>;
export type MindMapAgentResponse = z.infer<typeof mindMapAgentResponseSchema>;
