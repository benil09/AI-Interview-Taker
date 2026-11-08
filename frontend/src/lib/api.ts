import { API_BASE_URL } from "@/utils/env";

export interface Interview {
  id: string;
  role: string;
  level: string;
  techstack: string[];
  type: string;
  finalized?: boolean;
  questions: string[];
  coverImage?: string;
  createdAt: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  feedback?: string;
  comment?: string;
}

export interface FeedbackData {
  id?: string;
  interviewId: string;
  totalScore: number;
  categoryScores?: CategoryScore[];
  categoryScore?: CategoryScore[];
  strengths?: string[];
  strength?: string[] | string;
  areasForImprovement?: string[];
  improvementAreas?: string[];
  finalAssessment?: string | string[];
  recommendations?: string[];
  recommendation?: string | string[];
  createdAt?: string;
}

export async function getInterviews(): Promise<Interview[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch interviews");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("Could not reach backend API, using local state/fallback", err);
    return [];
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch interview");
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Could not reach backend API for interview", err);
    return null;
  }
}

export async function createInterviewApi(input: {
  role: string;
  level: string;
  techstack: string;
  type: string;
  amount: number;
}): Promise<Interview> {
  const res = await fetch(`${API_BASE_URL}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create interview");
  }

  const json = await res.json();
  return json.data;
}

export async function endInterviewApi(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/interviews/${id}/end`, {
      method: "POST",
    });
  } catch (err) {
    console.warn("Could not end interview via API", err);
  }
}

export async function submitFeedbackApi(input: {
  interviewId: string;
  transcript: Array<{ role: string; content: string }>;
}): Promise<FeedbackData> {
  const res = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to generate feedback");
  }

  const json = await res.json();
  return json.data;
}

export async function getFeedbackByInterviewId(interviewId: string): Promise<FeedbackData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/feedback/${interviewId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch feedback");
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Could not fetch feedback", err);
    return null;
  }
}

