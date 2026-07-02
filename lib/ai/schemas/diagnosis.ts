import { z } from "zod";

export const diagnosisRequestSchema = z.object({
  goal: z.string().min(2),
  currentLevel: z.string().min(1),
  weeklyHours: z.number().int().positive().max(80),
  preferences: z.array(z.string()).default([]),
});

export type DiagnosisRequest = z.infer<typeof diagnosisRequestSchema>;
