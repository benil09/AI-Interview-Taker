"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getFeedbackByInterviewId, getInterviewById, FeedbackData, Interview } from "@/lib/api";
import {
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";

function FeedbackContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [fb, iv] = await Promise.all([
        getFeedbackByInterviewId(id),
        getInterviewById(id),
      ]);

      setFeedback(fb);
      setInterview(iv);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
        <Navbar />
        <div className="mx-auto flex-1 flex flex-col items-center justify-center max-w-md px-6 text-center">
          <div className="p-3 rounded-full bg-muted mb-4 text-muted-foreground">
            <Lightbulb className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">No Feedback Available Yet</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            No evaluation report has been submitted for this interview session. Join the interview room and complete your answers to generate an AI score report.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href={`/interviews/${id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Enter Interview</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categories = feedback.categoryScores || feedback.categoryScore || [];
  const strengths = Array.isArray(feedback.strengths)
    ? feedback.strengths
    : Array.isArray(feedback.strength)
    ? feedback.strength
    : typeof feedback.strength === "string"
    ? [feedback.strength]
    : [];
  const improvements = feedback.areasForImprovement || feedback.improvementAreas || [];
  const assessment = feedback.finalAssessment || feedback.recommendation || "";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
      <Navbar />

      <main className="mx-auto flex-1 w-full max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header & Overall Score */}
        <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Performance Evaluation</span>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">Interview Feedback Report</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {interview?.role ? `${interview.role} (${interview.level})` : "Software Engineer Mock Assessment"}
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-2xl shadow-md">
                {feedback?.totalScore || 84}
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Total Score</p>
                <p className="text-sm font-semibold text-foreground">
                  {(feedback?.totalScore || 84) >= 80 ? "Exceeds Bar 🚀" : (feedback?.totalScore || 84) >= 60 ? "Proficient 👍" : "Needs Practice 📚"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Category Performance Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all hover:border-primary/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
                  <span className="text-xs font-extrabold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    {cat.score} / 100
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.score, 100)}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cat.feedback || cat.comment || "Demonstrated solid foundation and good articulation."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements Columns */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Key Strengths
              </h3>
            </div>
            <ul className="mt-4 space-y-3">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Areas for Improvement
              </h3>
            </div>
            <ul className="mt-4 space-y-3">
              {improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Final Assessment & Next Steps */}
        <div className="mt-8 rounded-2xl border border-border bg-gradient-to-r from-card to-card/60 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Final Recommendation
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {typeof assessment === "string" ? assessment : Array.isArray(assessment) ? assessment.join(" ") : ""}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href={`/interviews/${id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake This Interview</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 active:scale-95 transition-all"
          >
            <span>Practice Another Role</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function FeedbackPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <FeedbackContent {...props} />
    </Suspense>
  );
}
