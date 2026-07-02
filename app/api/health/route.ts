import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "StudyPilot",
    timestamp: new Date().toISOString(),
  });
}
