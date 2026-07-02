 import { NextResponse } from "next/server";
 import { analyzeFileContent } from "@/lib/aiClient";
 
 export async function POST(request: Request) {
   try {
     const body = (await request.json()) as {
       content: string;
       fileName: string;
       purpose: string;
       level: string;
       timeLimit: string;
     };
 
     if (!body.content || body.content.trim().length < 10) {
       return NextResponse.json({ error: "文件内容太短，无法分析。请上传内容更丰富的文件。" }, { status: 400 });
     }
 
     if (!body.purpose || !body.level || !body.timeLimit) {
       return NextResponse.json({ error: "请完整填写学习目标、基础水平和可用时间。" }, { status: 400 });
     }
 
     const result = await analyzeFileContent({ ...body, content: body.content.slice(0, 6000) });
 
     if (result.fallback) {
       return NextResponse.json({
         ...result,
         actualProvider: result.provider,
         actualModel: result.model,
       });
     }
 
     return NextResponse.json({
       ...result,
       actualProvider: result.provider,
       actualModel: result.model,
     });
   } catch (error) {
     console.error("Analyze file error:", error);
     return NextResponse.json({ error: "文件分析失败，请重试。" }, { status: 500 });
   }
 }
