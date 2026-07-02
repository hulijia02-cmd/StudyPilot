import { NextResponse } from "next/server";
import { generateLearningPlan } from "@/lib/aiClient";

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: string; learningGoal?: string; topic?: string };
  const result = await generateLearningPlan(body.goal ?? body.learningGoal ?? body.topic ?? "");

  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
