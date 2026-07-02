import { NextResponse } from "next/server";
import { diagnosisRequestSchema } from "@/lib/ai/schemas/diagnosis";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = diagnosisRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid diagnosis request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    profile: {
      currentLevel: "beginner",
      suggestedPace: "steady",
      risks: ["目标较宽，需要先收敛为阶段任务"],
    },
    nextStep: "generate_learning_plan",
  });
}
