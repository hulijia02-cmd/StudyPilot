import { NextResponse } from "next/server";
import { generatePractice } from "@/lib/aiClient";

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: string; subject?: string; topic?: string };
  const result = await generatePractice(body.goal ?? body.subject ?? "", body.topic);

  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
