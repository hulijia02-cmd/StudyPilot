import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPilot - AI Learning OS",
  description: "An AI-native learning operating system for planning, tutoring, practice, assessment, and review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
