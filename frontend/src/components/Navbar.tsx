"use client";

import Link from "next/link";
import { Mic, Sparkles } from "lucide-react";

export function Navbar({ onOpenCreate }: { onOpenCreate?: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">InterviewAI</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                TweakCN
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">AI Voice Mock Interviewer</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>

          {onOpenCreate && (
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>New Interview</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

