import { NextResponse } from "next/server";
import { generatePractice } from "@/lib/aiClient";

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: string; topic?: string };
  const result = await generatePractice(body.goal ?? "", body.topic);

  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
