import { NextResponse } from "next/server";
import { generateMindmap } from "@/lib/aiClient";

export async function POST(request: Request) {
  const body = (await request.json()) as { goal?: string };
  const result = await generateMindmap(body.goal ?? "");



  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
