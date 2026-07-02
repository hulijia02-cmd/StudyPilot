 import { NextRequest, NextResponse } from "next/server";
 
 export async function POST(request: NextRequest) {
   try {
     const formData = await request.formData();
     const file = formData.get("file") as File | null;
 
     if (!file) {
       return NextResponse.json({ error: "请选择要上传的文件。" }, { status: 400 });
     }
 
     if (file.size > 10 * 1024 * 1024) {
       return NextResponse.json({ error: "文件大小超过 10MB 限制。" }, { status: 400 });
     }
 
     const ext = file.name.toLowerCase().split(".").pop() || "";
 
     if (ext === "txt" || ext === "md" || ext === "markdown") {
       const text = await file.text();
       return NextResponse.json({ content: text });
     }
 
     if (ext === "pdf") {
       const buffer = Buffer.from(await file.arrayBuffer());
       // Simple PDF text extraction: look for text between parentheses in PDF stream
       // This handles basic PDF files. Complex PDFs may need a dedicated library.
       const raw = buffer.toString("utf-8");
       const textMatches = raw.match(/\(([^)]{1,500})\)/g) || [];
       const extracted = textMatches
         .map((m: string) => m.slice(1, -1))
         .filter((t: string) => t.length > 3 && /[a-zA-Z\u4e00-\u9fff]/.test(t))
         .join("\n");
 
       if (extracted.length > 50) {
         return NextResponse.json({ content: extracted.slice(0, 50000) });
       }
 
       // Fallback: try to find readable text chunks
       const textChunks: string[] = [];
       let i = 0;
       while (i < buffer.length - 2) {
         // Look for text between BT and ET markers (PDF text objects)
         if (buffer[i] === 0x42 && buffer[i + 1] === 0x54) { // "BT"
           const end = raw.indexOf("ET", i);
           if (end > i) {
             const chunk = raw.slice(i, end + 2);
             const texts = chunk.match(/\(([^)]{1,300})\)/g) || [];
             for (const t of texts) {
               const clean = t.slice(1, -1).replace(/\\[^\\]/g, " ").trim();
               if (clean.length > 2) textChunks.push(clean);
             }
             i = end + 2;
             continue;
           }
         }
         i++;
       }
 
       const finalText = textChunks.join("\n");
       if (finalText.length > 50) {
         return NextResponse.json({ content: finalText.slice(0, 50000) });
       }
 
       return NextResponse.json({
         error: "无法提取此 PDF 的文字内容。请尝试：1) 使用 TXT 或 Markdown 格式 2) 确认 PDF 不是扫描件（图片格式）。",
       }, { status: 422 });
     }
 
     return NextResponse.json({
       error: "不支持的文件格式。目前支持：TXT、Markdown、PDF。",
     }, { status: 400 });
   } catch (error) {
     console.error("Upload error:", error);
     return NextResponse.json({ error: "文件处理失败，请重试。" }, { status: 500 });
   }
 }
 
 export const config = {
   api: {
     bodyParser: false,
   },
 };
