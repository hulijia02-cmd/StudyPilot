import { NextResponse } from "next/server";
import { chatWithTeacher } from "@/lib/aiClient";
import type { KnowledgeNode } from "@/lib/mockLearningData";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    goal?: string;
    question?: string;
    selectedNode?: KnowledgeNode;
  };

  const result = await chatWithTeacher({
    goal: body.goal ?? "",
    question: body.question ?? "",
    selectedNode: body.selectedNode,
  });



  return NextResponse.json({
    ...result,
    actualProvider: result.provider,
    actualModel: result.model,
  });
}
