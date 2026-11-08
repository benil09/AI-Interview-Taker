"use client";

import Link from "next/link";
import { Mic, ArrowRight, CheckCircle2, Award } from "lucide-react";
import { Interview } from "@/lib/api";

export function InterviewCard({ interview }: { interview: Interview }) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md animate-in fade-in duration-300">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground mb-2">
              {interview.level}
            </span>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {interview.role}
            </h3>
          </div>

          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              interview.finalized
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {interview.finalized ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Ready
              </>
            )}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {interview.techstack.slice(0, 4).map((tech, idx) => (
            <span
              key={idx}
              className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {interview.techstack.length > 4 && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              +{interview.techstack.length - 4}
            </span>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {interview.questions?.length || 0} Questions • {interview.type || "Technical"} Focus
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 pt-4 border-t border-border/60">
        <Link
          href={`/interviews/${interview.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Mic className="h-3.5 w-3.5" />
          <span>{interview.finalized ? "Retake" : "Start Session"}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>

        <Link
          href={`/interviews/${interview.id}/feedback`}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted active:scale-95 transition-all"
          title="View Score & Feedback"
        >
          {/* <Award className="h-3.5 w-3.5 text-muted-foreground" /> */}
          <span className="hidden sm:inline">Results</span>
        </Link>
      </div>
    </div>
  );
}

