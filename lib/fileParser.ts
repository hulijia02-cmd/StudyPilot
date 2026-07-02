 /**
  * StudyPilot File Parser
  * Supports: TXT, MD (client-side), PDF (via API)
  */
 
 const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
 
 export type FileParseResult = {
   success: boolean;
   content: string;
   fileName: string;
   fileType: string;
   error?: string;
 };
 
 export type SupportedFileType = "txt" | "md" | "markdown" | "pdf";
 
 export function getFileExtension(fileName: string): string {
   const parts = fileName.toLowerCase().split(".");
   return parts[parts.length - 1] || "";
 }
 
 export function isFileTypeSupported(fileName: string): boolean {
   const ext = getFileExtension(fileName);
   return ["txt", "md", "markdown", "pdf"].includes(ext);
 }
 
 export function getFileTypeLabel(fileName: string): string {
   const ext = getFileExtension(fileName);
   const labels: Record<string, string> = {
     txt: "文本文件",
     md: "Markdown 文档",
     markdown: "Markdown 文档",
     pdf: "PDF 文档",
   };
   return labels[ext] || "未知格式";
 }
 
 export function formatFileSize(bytes: number): string {
   if (bytes < 1024) return bytes + " B";
   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
   return (bytes / (1024 * 1024)).toFixed(1) + " MB";
 }
 
 /**
  * Parse a text-based file (TXT, MD) client-side.
  */
 export function parseTextFile(file: File): Promise<FileParseResult> {
   return new Promise((resolve) => {
     if (file.size > MAX_FILE_SIZE) {
       resolve({
         success: false,
         content: "",
         fileName: file.name,
         fileType: getFileExtension(file.name),
         error: "文件大小超过 10MB 限制，请选择较小的文件。",
       });
       return;
     }
 
     const reader = new FileReader();
 
     reader.onload = (e) => {
       const content = e.target?.result as string;
       if (!content) {
         resolve({
           success: false,
           content: "",
           fileName: file.name,
           fileType: getFileExtension(file.name),
           error: "无法读取文件内容，请重试。",
         });
         return;
       }
       resolve({
         success: true,
         content,
         fileName: file.name,
         fileType: getFileExtension(file.name),
       });
     };
 
     reader.onerror = () => {
       resolve({
         success: false,
         content: "",
         fileName: file.name,
         fileType: getFileExtension(file.name),
         error: "文件读取失败，请重试。",
       });
     };
 
     reader.readAsText(file, "utf-8");
   });
 }
 
 /**
  * Parse a PDF file by sending it to the server API.
  */
 export async function parsePdfFile(file: File): Promise<FileParseResult> {
   if (file.size > MAX_FILE_SIZE) {
     return {
       success: false,
       content: "",
       fileName: file.name,
       fileType: "pdf",
       error: "PDF 文件大小超过 10MB 限制。",
     };
   }
 
   try {
     const formData = new FormData();
     formData.append("file", file);
 
     const response = await fetch("/api/upload", {
       method: "POST",
       body: formData,
     });
 
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       return {
         success: false,
         content: "",
         fileName: file.name,
         fileType: "pdf",
         error: errorData.error || "PDF 解析失败，请重试。",
       };
     }
 
     const data = (await response.json()) as { content: string };
     return {
       success: true,
       content: data.content,
       fileName: file.name,
       fileType: "pdf",
     };
   } catch {
     return {
       success: false,
       content: "",
       fileName: file.name,
       fileType: "pdf",
       error: "PDF 解析请求失败，请检查网络连接后重试。",
     };
   }
 }
 
 /**
  * Parse any supported file type.
  */
 export async function parseFile(file: File): Promise<FileParseResult> {
   const ext = getFileExtension(file.name);
 
   if (ext === "pdf") {
     return parsePdfFile(file);
   }
 
   // TXT, MD, Markdown — read client-side
   return parseTextFile(file);
 }
