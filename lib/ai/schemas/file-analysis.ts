 import { z } from "zod";
 
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
export const knowledgeMapNodeSchema: z.ZodSchema<any> = z.lazy(() =>
   z.object({
     title: z.string().min(1),
     summary: z.string(),
     type: z.enum(["concept", "skill", "tool", "project", "exam"]),
     importance: z.number().min(1).max(5),
     difficulty: z.number().min(1).max(5),
     priority: z.number().min(1).max(5),
     reason: z.string(),
     canSkip: z.boolean(),
     children: z.array(knowledgeMapNodeSchema),
   })
 );
 
 export const fileAnalysisResponseSchema = z.object({
   fileTitle: z.string(),
   userGoal: z.string(),
   learningProfile: z.object({
     purpose: z.string(),
     level: z.string(),
     timeLimit: z.string(),
   }),
   summary: z.string(),
   knowledgeMap: z.array(knowledgeMapNodeSchema),
   keyPoints: z.array(
     z.object({
       title: z.string(),
       reason: z.string(),
       relatedGoal: z.string(),
       priority: z.number().min(1).max(5),
     })
   ),
   difficultPoints: z.array(
     z.object({
       title: z.string(),
       reason: z.string(),
       priority: z.number().min(1).max(5),
     })
   ),
   skipSuggestions: z.array(
     z.object({
       title: z.string(),
       reason: z.string(),
     })
   ),
   learningPath: z.array(
     z.object({
       step: z.number(),
       title: z.string(),
       estimatedTime: z.string(),
       nodes: z.array(z.string()),
     })
   ),
   practiceQuestions: z.array(
     z.object({
       id: z.string(),
       type: z.string(),
       question: z.string(),
       answer: z.string(),
       explanation: z.string(),
     })
   ),
 });
 
 export type FileAnalysisRequest = {
   content: string;
   fileName: string;
   purpose: string;
   level: string;
   timeLimit: string;
 };
 
 export type FileAnalysisResponse = z.infer<typeof fileAnalysisResponseSchema>;
