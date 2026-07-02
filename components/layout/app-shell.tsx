import Link from "next/link";
import { ReactNode } from "react";
import { Network } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "驾驶舱" },
  { href: "/onboarding/goal", label: "目标" },
  { href: "/onboarding/diagnosis", label: "诊断" },
  { href: "/mindmap", label: "思维导图" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white/75 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold">
            StudyPilot
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = (item as { icon?: typeof Network }).icon ?? null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {Icon && <Icon className="mr-1.5 h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
