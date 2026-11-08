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
  Share2,
  Check,
  Award,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ListChecks,
  MessageSquareQuote,
  Layers,
  ArrowUpRight,
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
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "checklist" | "questions">("overview");
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [checkedImprovements, setCheckedImprovements] = useState<Record<number, boolean>>({});

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

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function toggleCheck(idx: number) {
    setCheckedImprovements((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

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
          <div className="p-3.5 rounded-2xl bg-muted/70 mb-4 text-muted-foreground border border-border">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">No Feedback Available Yet</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            No evaluation report has been submitted for this interview session. Join the interview room and complete your answers to generate an AI score report.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href={`/interviews/${id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Enter Interview Room</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted active:scale-95 transition-all"
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

  // Normalize total score
  const totalScore = Math.min(100, Math.max(0, feedback.totalScore || 75));

  // Determine score status tier
  const tier =
    totalScore >= 85
      ? { label: "Strong Hire", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "Exceeds Expectations 🚀", desc: "Demonstrated advanced domain expertise, clear communication, and structured problem solving." }
      : totalScore >= 70
      ? { label: "Hire Ready", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", badge: "Solid Technical Bar 👍", desc: "Strong conceptual understanding with practical knowledge. Minor refinements will elevate to lead level." }
      : totalScore >= 55
      ? { label: "Borderline", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", badge: "Needs Targeted Practice 🎯", desc: "Good foundation, but answers lacked structured depth on edge cases and architectural tradeoffs." }
      : { label: "Needs Practice", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", badge: "Early Stage Prep 📚", desc: "Review key fundamentals and practice articulating technical decisions before high-stakes loops." };

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
      <Navbar />

      <main className="mx-auto flex-1 w-full max-w-5xl px-6 py-8">
        {/* Navigation & Share Row */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Report</span>
                </>
              )}
            </button>
            <Link
              href={`/interviews/${id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Interview</span>
            </Link>
          </div>
        </div>

        {/* Hero Scorecard Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 text-card-foreground shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Verified Evaluation</span>
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${tier.bg} ${tier.color} ${tier.border}`}>
                  <Award className="h-3.5 w-3.5" />
                  <span>{tier.label}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {interview?.role || "Software Engineering"} Evaluation
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {interview?.level ? `${interview.level} Level` : "Technical Mock"} • {tier.desc}
              </p>

              {/* Tech stack badges */}
              {interview?.techstack && interview.techstack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {interview.techstack.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center gap-6 p-4 rounded-2xl border border-border bg-muted/30 backdrop-blur-sm self-center md:self-auto">
              <div className="relative flex items-center justify-center">
                <svg className="h-32 w-32 -rotate-90 transform">
                  {/* Background track circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-muted/40"
                    fill="transparent"
                  />
                  {/* Filled progress circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black tracking-tight text-foreground">{totalScore}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">out of 100</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Overall Verdict</p>
                <p className="text-sm font-extrabold text-foreground">{tier.badge}</p>
                <p className="text-xs text-muted-foreground">
                  {totalScore >= 80 ? "Top 15% Candidate" : totalScore >= 60 ? "Ready for final loop" : "Needs review"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
          {[
            { id: "overview", label: "Executive Summary", icon: Layers },
            { id: "categories", label: "Category Scorecard", icon: BarChart3, count: categories.length },
            { id: "checklist", label: "Action & Prep Plan", icon: ListChecks, count: improvements.length },
            ...(interview?.questions && interview.questions.length > 0
              ? [{ id: "questions", label: "Question Log", icon: MessageSquareQuote, count: interview.questions.length }]
              : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE SUMMARY / OVERVIEW */}
        {activeTab === "overview" && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
            {/* Final Verdict Callout */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Hiring Recommendation & Summary
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                {typeof assessment === "string" ? assessment : Array.isArray(assessment) ? assessment.join(" ") : ""}
              </p>
            </div>

            {/* Strengths & Improvements Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Key Strengths ({strengths.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Standouts
                  </span>
                </div>
                <ul className="mt-4 space-y-3">
                  {strengths.map((str, idx) => (
                    <li
                      key={idx}
                      className="group flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs text-foreground/80 leading-relaxed group-hover:text-foreground">
                        {str}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Growth Areas ({improvements.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("checklist")}
                    className="text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Checklist</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
                <ul className="mt-4 space-y-3">
                  {improvements.map((imp, idx) => (
                    <li
                      key={idx}
                      className="group flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-1 rounded-full bg-amber-500/10 text-amber-500 mt-0.5 shrink-0">
                        <Target className="h-3 w-3" />
                      </div>
                      <span className="text-xs text-foreground/80 leading-relaxed group-hover:text-foreground">
                        {imp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Category Summary Grid */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Score Distribution Across Dimensions
                </h3>
                <button
                  onClick={() => setActiveTab("categories")}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Detailed Rubrics</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setExpandedCategory(idx);
                      setActiveTab("categories");
                    }}
                    className="cursor-pointer rounded-xl border border-border bg-muted/30 p-3.5 hover:border-primary/40 hover:bg-muted/60 transition-all text-center group"
                  >
                    <p className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                      {cat.score}
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground mt-0.5 line-clamp-1">
                      {cat.name}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(cat.score, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED CATEGORY SCORECARD */}
        {activeTab === "categories" && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                Click any category card to expand in-depth AI observations and actionable guidance.
              </p>
              <button
                onClick={() => setExpandedCategory(expandedCategory !== null ? null : 0)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {expandedCategory !== null ? "Collapse All" : "Expand First"}
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat, idx) => {
                const isExpanded = expandedCategory === idx;
                const scoreColor =
                  cat.score >= 80
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : cat.score >= 65
                    ? "text-primary bg-primary/10 border-primary/20"
                    : "text-amber-500 bg-amber-500/10 border-amber-500/20";

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? "border-primary/50 bg-card shadow-md"
                        : "border-border bg-card hover:border-primary/30 shadow-xs"
                    }`}
                  >
                    <div
                      onClick={() => setExpandedCategory(isExpanded ? null : idx)}
                      className="cursor-pointer flex items-center justify-between p-5"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
                          <div className="mt-1 flex items-center gap-3">
                            <div className="w-32 sm:w-48 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(cat.score, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-foreground">{cat.score}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreColor}`}>
                          {cat.score >= 80 ? "Proficient" : cat.score >= 65 ? "Competent" : "Needs Review"}
                        </span>
                        <div className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-border animate-in fade-in duration-150">
                        <div className="rounded-xl bg-muted/40 p-4 border border-border">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Observation & Feedback
                          </p>
                          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            {cat.feedback || cat.comment || "Demonstrated sound engineering intuition with room for deeper structural clarity."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIONABLE STUDY CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Interactive Practice Checklist</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Check off targeted improvement areas as you review them before your next interview.
                  </p>
                </div>
                <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {Object.values(checkedImprovements).filter(Boolean).length} / {improvements.length} Completed
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {improvements.map((item, idx) => {
                  const isChecked = !!checkedImprovements[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`cursor-pointer flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
                        isChecked
                          ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-input bg-background"
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" />}
                      </div>

                      <div className="flex-1">
                        <p className={`text-xs sm:text-sm leading-relaxed ${isChecked ? "line-through opacity-70" : ""}`}>
                          {item}
                        </p>
                        <span className="mt-1.5 inline-block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Priority {idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUESTION LOG & REVIEW */}
        {activeTab === "questions" && interview?.questions && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-200">
            <p className="text-xs text-muted-foreground">
              These are the questions generated by Gemini for this practice session:
            </p>

            <div className="space-y-3">
              {interview.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      Q{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                      {q}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Retake & Practice Banner */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Ready to apply this feedback?</p>
              <p className="text-xs text-muted-foreground">
                Retake this exact session to improve your score, or create an interview with a different stack.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/interviews/${id}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Interview</span>
            </Link>
            <Link
              href="/"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-xs font-semibold hover:bg-muted/80 active:scale-95 transition-all"
            >
              <span>Explore Roles</span>
            </Link>
          </div>
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
