import { NextResponse } from "next/server";
import { generateLearningPlan, getAIConfig, getEnvValue } from "@/lib/aiClient";

export function GET() {
  const config = getAIConfig();

  return NextResponse.json({
    message: "StudyPilot generate-plan API is running. This endpoint expects POST from the app.",
    activeProvider: config.provider,
    activeModel: config.model,
    activeBaseUrl: config.baseUrl || "not-configured",
    usingCCSwitch:
      config.provider === "deepseek" &&
      (config.baseUrl.includes("127.0.0.1") || config.baseUrl.includes("localhost")),
    hasDeepSeekKey: Boolean(getEnvValue("DEEPSEEK_API_KEY", "DEEPSEEK API KEY")),
    usage: {
      method: "POST",
      url: "/api/generate-plan",
      body: { goal: "设计数学" },
    },
    appEntry: "/",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { goal?: string };
    const result = await generateLearningPlan(body.goal ?? "");



    return NextResponse.json({
      ...result,
      actualProvider: result.provider,
      actualModel: result.model,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "学习计划接口内部错误",
        detail: error instanceof Error ? error.message : String(error),
        activeProvider: getAIConfig().provider,
      },
      { status: 500 },
    );
  }
}
