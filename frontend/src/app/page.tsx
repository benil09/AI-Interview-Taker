"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CreateInterviewModal } from "@/components/CreateInterviewModal";
import { InterviewCard } from "@/components/InterviewCard";
import { getInterviews, Interview } from "@/lib/api";
import { Plus, Search, Sparkles, Filter, Code2, Headphones, Award } from "lucide-react";

export default function Home() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getInterviews();
        setInterviews(data || []);
      } catch (err) {
        console.error("Failed to load interviews:", err);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleInterviewCreated(newInterview: Interview) {
    setInterviews((prev) => [newInterview, ...prev]);
  }

  const filteredInterviews = interviews.filter((item) => {
    const matchesSearch =
      item.role.toLowerCase().includes(search.toLowerCase()) ||
      item.techstack.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = filterLevel === "All" || item.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navbar onOpenCreate={() => setIsModalOpen(true)} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border bg-card/40 py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
                Master Technical Interviews with Real-Time AI Voice Agent
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Generate questions tailored to your exact tech stack, converse with an interactive voice assistant, and receive scored feedback across communication, technical depth, and problem solving.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Session</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-border pt-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Any Tech Stack</p>
                <p className="text-xs text-muted-foreground">React, Node, Go, Python, Cloud</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Voice-to-Voice AI</p>
                <p className="text-xs text-muted-foreground">Conversational speech via Vapi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Gemini Scoring</p>
                <p className="text-xs text-muted-foreground">In-depth rubric across 5 dimensions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Interviews List */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Interview Sessions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select an interview to start practicing or inspect your past score reports.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search role or stack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="relative flex items-center">
              <Filter className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="rounded-lg border border-input bg-card pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Levels</option>
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-xl border border-border bg-card/60 animate-pulse"
              />
            ))}
          </div>
        ) : filteredInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviews.map((item) => (
              <InterviewCard key={item.id} interview={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card/40">
            <p className="text-sm font-medium text-foreground">No interview sessions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first AI-tailored session to get started.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Interview</span>
            </button>
          </div>
        )}
      </main>

      <CreateInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInterviewCreated}
      />
    </div>
  );
}
