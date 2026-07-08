export const phaseColors = {
  1: { bg: "#EFF6FF", text: "#2563EB", dot: "#2563EB" },
  2: { bg: "#F5F3FF", text: "#7C3AED", dot: "#7C3AED" },
  3: { bg: "#ECFDF5", text: "#059669", dot: "#059669" },
  4: { bg: "#FFF7ED", text: "#EA580C", dot: "#EA580C" },
  5: { bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626" },
};

export const STORAGE_KEY = "ai_roadmap_progress_v2";
export const BOOKMARK_KEY = "ai_roadmap_bookmarks_v2";

export const mainViews = [
  { id: "roadmap", label: "Roadmap" },
  { id: "progress", label: "Progress" },
  { id: "questions", label: "Question Bank" },
];

export const weekTabs = [
  { id: "daily", label: "Daily Plan" },
  { id: "project", label: "Weekend Project" },
  { id: "mock", label: "Mock Interview" },
  { id: "checkpoint", label: "Checkpoint" },
];

export const roadmapSummaryCards = [
  {
    value: "5",
    label: "Learning Phases",
    detail: "LLMs -> RAG -> Agents -> Prod -> Design",
  },
  {
    value: "12",
    label: "Weekend Projects",
    detail: "One flagship capstone at Week 12",
  },
  {
    value: "60",
    label: "Study Sessions",
    detail: "Daily topic + exercise + interview Q",
  },
  {
    value: "180+",
    label: "Interview Qs",
    detail: "Daily, mock, and system design",
  },
];

export const seniorAdviceItems = [
  "Multiple document types with a unified ingestion API",
  "Citations, metadata filtering, and streaming responses",
  "Conversation memory with RAGAS evaluation + LangSmith tracing",
  "Docker deployment with auth, rate limiting, and unit tests",
  "A live public URL and a polished GitHub README",
];
