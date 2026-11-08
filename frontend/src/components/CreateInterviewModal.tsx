"use client";

import { useState } from "react";
import { X, Sparkles, Loader2,Bot } from "lucide-react";
import { createInterviewApi, Interview } from "@/lib/api";

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInterview: Interview) => void;
}

export function CreateInterviewModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInterviewModalProps) {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Mid-level");
  const [techstack, setTechstack] = useState("");
  const [type, setType] = useState("Technical");
  const [amount, setAmount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!role.trim()) {
      setError("Please enter a target role (e.g. Full Stack Engineer).");
      return;
    }
    if (!techstack.trim()) {
      setError("Please specify tech stack skills (e.g. React, Node.js, TypeScript).");
      return;
    }

    setLoading(true);

    try {
      const interview = await createInterviewApi({
        role: role.trim(),
        level: level || "Mid-level",
        techstack: techstack.trim(),
        type: type || "Technical",
        amount: Number(amount) || 5,
      });
      onSuccess(interview);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate interview. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generate AI Interview</h2>
              <p className="text-xs text-muted-foreground">
                Gemini will craft role-specific questions for your practice session.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Target Role
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Frontend Engineer"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Experience Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Mid-level">Mid-level (3-5 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
                <option value="Lead / Staff">Lead / Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Interview Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Technical">Technical</option>
                <option value="Behavioural">Behavioural</option>
                <option value="Balanced">Balanced Mix</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              required
              value={techstack}
              onChange={(e) => setTechstack(e.target.value)}
              placeholder="React, Next.js, Node.js, PostgreSQL"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Number of Questions
                </label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {amount <= 3
                    ? "Quick ~10-min screening"
                    : amount <= 6
                    ? "Standard ~20-min session"
                    : "Deep dive ~30-min full interview"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-1 text-primary shadow-xs">
                <span className="text-sm font-bold">{amount}</span>
                <span className="text-[11px] font-medium opacity-85">Questions</span>
              </div>
            </div>

            {/* Custom Styled Slider Bar */}
            <div className="relative flex items-center py-1">
              <input
                type="range"
                min={2}
                max={10}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
                    ((amount - 2) / 8) * 100
                  }%, var(--muted) ${((amount - 2) / 8) * 100}%, var(--muted) 100%)`,
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-background
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-115
                  [&::-webkit-slider-thumb]:active:scale-95
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-background
                  [&::-moz-range-thumb]:shadow-md"
              />
            </div>

            {/* Quick Selection Presets */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              {[
                { count: 3, label: "Quick (3)" },
                { count: 5, label: "Standard (5)" },
                { count: 7, label: "Detailed (7)" },
                { count: 10, label: "Full (10)" },
              ].map((preset) => (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => setAmount(preset.count)}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition-all ${
                    amount === preset.count
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold scale-[1.02]"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg  border-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  {/* <Sparkles className="h-4 w-4" /> */}
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

