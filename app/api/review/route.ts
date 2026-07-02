import { NextResponse } from "next/server";
import { generateReview } from "@/lib/aiClient";

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: string };
  const result = await generateReview(body.goal ?? "");

  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
