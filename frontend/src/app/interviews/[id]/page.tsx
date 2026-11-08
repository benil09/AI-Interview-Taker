"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getInterviewById, endInterviewApi, submitFeedbackApi, Interview } from "@/lib/api";
import { getVapi } from "@/utils/vapi";
import { VAPI_ASSISTANT_ID } from "@/utils/env";
import {
  Mic,
  PhoneOff,
  Loader2,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

function extractMessage(err: any): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err.message === "string") return err.message;
  if (err.error) {
    if (typeof err.error === "string") return err.error;
    if (typeof err.error.message === "string") return err.error.message;
    try {
      return JSON.stringify(err.error);
    } catch {}
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function InterviewRoomContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "speaking">(
    "idle"
  );
  const [transcripts, setTranscripts] = useState<Array<{ role: string; content: string }>>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getInterviewById(id);
      setInterview(data);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    let vapi: any = null;
    try {
      vapi = getVapi();

      const onCallStart = () => {
        setCallStatus("active");
        setError(null);
      };

      const onCallEnd = () => {
        setCallStatus("idle");
      };

      const onSpeechStart = () => {
        setCallStatus("speaking");
      };

      const onSpeechEnd = () => {
        setCallStatus("active");
      };

      const onMessage = (msg: any) => {
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          setTranscripts((prev) => [
            ...prev,
            { role: msg.role === "assistant" ? "AI Interviewer" : "Candidate", content: msg.transcript },
          ]);
        }
      };

      const onError = (e: any) => {
        console.error("Vapi Error:", e);
        const rawMsg = extractMessage(e);

        const isKeyError =
          rawMsg.toLowerCase().includes("invalid key") ||
          rawMsg.toLowerCase().includes("private key") ||
          rawMsg.toLowerCase().includes("unauthorized") ||
          e?.status === 401 ||
          e?.statusCode === 401 ||
          e?.error?.statusCode === 401;

        if (isKeyError) {
          setError(
            "Vapi Key Notice: Your .env has the Vapi Private Key instead of the Public Key. Please copy your Vapi Public Key (from Vapi Dashboard -> Account -> API Keys -> Public Key) into NEXT_PUBLIC_VAPI_PUBLIC_KEY in frontend/.env."
          );
        } else if (rawMsg.toLowerCase().includes("permission") || rawMsg.toLowerCase().includes("notallowederror")) {
          setError("Microphone permission was denied in your browser. Please allow microphone access in your browser address bar.");
        } else if (rawMsg) {
          setError(`Voice session error: ${rawMsg}`);
        } else {
          setError(
            "Voice session notice: Voice stream or mic interrupted. Please ensure your microphone permissions are granted."
          );
        }
        setCallStatus("idle");
      };

      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("message", onMessage);
      vapi.on("error", onError);

      return () => {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("message", onMessage);
        vapi.off("error", onError);
      };
    } catch (e) {
      console.warn("Vapi initialization warning:", e);
    }
  }, []);

  async function handleToggleCall() {
    setError(null);
    try {
      const vapi = getVapi();
      if (callStatus === "idle") {
        setCallStatus("connecting");

        const questionsList = interview?.questions?.join("\n") || "";
        const systemPrompt = `You are an AI interviewer conducting a technical mock interview for the position: ${interview?.role} (${interview?.level}).
Ask these questions in order, one by one. Listen attentively to candidate answers and ask short follow-ups if needed:
${questionsList}`;

        try {
          if (VAPI_ASSISTANT_ID) {
            await vapi.start(VAPI_ASSISTANT_ID, {
              model: {
                provider: "openai",
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: systemPrompt }],
              },
            });
          } else {
            throw new Error("No assistant ID");
          }
        } catch (startErr: any) {
          console.warn("Could not start with assistant ID, falling back to inline assistant...", startErr);
          await vapi.start({
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              messages: [{ role: "system", content: systemPrompt }],
            },
            voice: {
              provider: "vapi",
              voiceId: "Elliot",
            },
          });
        }
      } else {
        await vapi.stop();
        setCallStatus("idle");
      }
    } catch (err: any) {
      console.error("Call toggle failed:", err);
      const rawMsg = extractMessage(err);

      const isKeyError =
        rawMsg.toLowerCase().includes("invalid key") ||
        rawMsg.toLowerCase().includes("private key") ||
        rawMsg.toLowerCase().includes("unauthorized") ||
        err?.status === 401 ||
        err?.statusCode === 401 ||
        err?.error?.statusCode === 401;

      if (isKeyError) {
        setError(
          "Vapi Key Notice: Your .env has the Vapi Private Key instead of the Public Key. Please copy your Vapi Public Key (from Vapi Dashboard -> Account -> API Keys -> Public Key) into NEXT_PUBLIC_VAPI_PUBLIC_KEY in frontend/.env."
        );
      } else if (rawMsg.toLowerCase().includes("permission") || rawMsg.toLowerCase().includes("notallowederror")) {
        setError("Microphone permission was denied in your browser. Please allow microphone access in your browser address bar.");
      } else if (rawMsg) {
        setError(`Microphone / Vapi error: ${rawMsg}`);
      } else {
        setError(
          "Could not connect to microphone/Vapi. Please check your browser microphone permissions."
        );
      }
      setCallStatus("idle");
    }
  }

  async function handleFinishInterview() {
    setSubmittingFeedback(true);
    setError(null);

    try {
      try {
        const vapi = getVapi();
        await vapi.stop();
      } catch {}

      await endInterviewApi(id);

      const transcriptToSend =
        transcripts.length > 0
          ? transcripts.map((t) => ({ role: t.role, content: t.content }))
          : [
              {
                role: "AI Interviewer",
                content: interview?.questions[0] || "Explain your technical background.",
              },
              {
                role: "Candidate",
                content:
                  "I use TypeScript and Node.js for backend API design, focusing on type safety and structured error handling.",
              },
            ];

      await submitFeedbackApi({
        interviewId: id,
        transcript: transcriptToSend,
      });

      router.push(`/interviews/${id}/feedback`);
    } catch (err: any) {
      console.error(err);
      router.push(`/interviews/${id}/feedback`);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h2 className="text-xl font-bold">Interview Not Found</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          This interview session could not be found in the database.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
      <Navbar />

      <div className="mx-auto flex-1 w-full max-w-6xl px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Interview Details & Questions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {interview?.level}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-foreground">{interview?.role}</h1>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {interview?.techstack?.map((tech, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Questions Checklist */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Interview Questions
                </h3>
                <span className="text-xs text-primary font-semibold">
                  {interview?.questions?.length} Target Questions
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {interview?.questions?.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`cursor-pointer rounded-xl p-3 text-xs leading-relaxed transition-all ${
                      currentQuestionIndex === idx
                        ? "border border-primary/40 bg-primary/10 text-foreground font-medium shadow-sm"
                        : "border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                        Question {idx + 1}
                      </span>
                    </div>
                    <p className="pl-7">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Voice Call Console */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm overflow-hidden min-h-[300px]">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    callStatus === "active" || callStatus === "speaking"
                      ? "bg-emerald-500 animate-pulse"
                      : callStatus === "connecting"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <span className="text-xs font-semibold capitalize text-muted-foreground">
                  {callStatus === "speaking"
                    ? "AI Interviewer Speaking..."
                    : callStatus === "active"
                    ? "Live: Listening to Candidate"
                    : callStatus === "connecting"
                    ? "Connecting Call..."
                    : "Ready to Start"}
                </span>
              </div>

              <div className="relative my-6 flex items-center justify-center">
                {(callStatus === "active" || callStatus === "speaking") && (
                  <div className="absolute h-40 w-40 rounded-full bg-primary/20 animate-ping opacity-75" />
                )}
                <button
                  onClick={handleToggleCall}
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
                    callStatus === "active" || callStatus === "speaking"
                      ? "bg-destructive text-destructive-foreground hover:opacity-90"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {callStatus === "connecting" ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Mic className="h-9 w-9" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                {callStatus === "idle"
                  ? "Click the microphone to begin your voice session."
                  : "Microphone active. Speak naturally as in a real interview."}
              </p>

              <div className="mt-6 flex items-center gap-3">
                {callStatus !== "idle" && (
                  <button
                    onClick={handleToggleCall}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <PhoneOff className="h-3.5 w-3.5" />
                    <span>Mute / Pause</span>
                  </button>
                )}

                <button
                  onClick={handleFinishInterview}
                  disabled={submittingFeedback}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Evaluating Feedback with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Finish & Get Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Transcript Stream */}
            <div className="flex-1 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Live Conversation Transcript
                </h3>
              </div>

              <div className="mt-4 flex-1 space-y-3 min-h-[160px] max-h-[300px] overflow-y-auto pr-1">
                {transcripts.length > 0 ? (
                  transcripts.map((t, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-1 p-3 rounded-xl text-xs ${
                        t.role === "AI Interviewer"
                          ? "bg-muted/50 border border-border"
                          : "bg-primary/10 border border-primary/20 text-foreground ml-4"
                      }`}
                    >
                      <span className="font-bold text-[11px] text-muted-foreground">{t.role}</span>
                      <p>{t.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    Speech transcripts will appear here in real time as you speak with the assistant.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewRoomPage(props: {
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
      <InterviewRoomContent {...props} />
    </Suspense>
  );
}
