import { NextResponse } from "next/server";
import { scorePracticeSubmission } from "@/lib/ai/agents/practice-agent";
import { practiceSubmissionSchema } from "@/lib/ai/schemas/practice";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = practiceSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid practice submission", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = scorePracticeSubmission(parsed.data);
  return NextResponse.json(result);
}
