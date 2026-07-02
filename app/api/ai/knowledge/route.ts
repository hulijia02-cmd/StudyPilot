import { NextResponse } from "next/server";
import { generateKnowledgeExplanation } from "@/lib/aiClient";

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: string; subject?: string; topic?: string };
  const result = await generateKnowledgeExplanation({
    goal: body.goal ?? body.subject ?? body.topic ?? "",
    topic: body.topic ?? body.goal ?? body.subject ?? "",
  });



  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
