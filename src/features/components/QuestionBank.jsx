import { useMemo, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { phaseColors } from "../constants";
import { useBookmarks } from "../hooks/useBookmarks";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { SoftPill, StatusPill } from "./ui";

function buildQuestionList(
  unlockedPhaseIds,
  weeks,
  phases,
  getMockInterview,
  getWeekLessons,
  getMockInterviewQuestions,
) {
  const questions = [];

  weeks.forEach((week) => {
    if (!unlockedPhaseIds.includes(week.phaseNo)) return;

    const colors = phaseColors[week.phaseNo];
    const phaseTitle = phases.find((phase) => phase.id === week.phaseNo)?.title;
    const mockInterview = getMockInterview(week.id);

    getWeekLessons(week.id).forEach((lesson, lessonIndex) => {
      questions.push({
        id: `w${week.weekNo}_d${lessonIndex}_iq`,
        type: "daily",
        typeLabel: "Daily Q",
        week: week.weekNo,
        phase: week.phaseNo,
        phaseTitle,
        weekTitle: week.title,
        day: `Lesson ${lesson.lessonNo}`,
        question: lesson.interviewQuestion,
        topic: lesson.title,
        colors,
      });
    });

    if (!mockInterview) return;

    getMockInterviewQuestions(mockInterview.id).forEach(
      (question, questionIndex) => {
        questions.push({
          id: `w${week.weekNo}_mock${questionIndex}`,
          type: "mock",
          typeLabel: "Mock Interview",
          week: week.weekNo,
          phase: week.phaseNo,
          phaseTitle,
          weekTitle: week.title,
          day: "Mock Session",
          question: question.question,
          topic: mockInterview.format,
          colors,
        });
      },
    );
  });

  return questions;
}

function QuestionFilters({
  search,
  onSearchChange,
  phaseFilter,
  onPhaseFilterChange,
  typeFilter,
  onTypeFilterChange,
  unlockedPhaseIds,
  bookmarks,
  resultCount,
  phases,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search questions, topics, weeks..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={phaseFilter}
          onChange={(event) => onPhaseFilterChange(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All Phases</option>
          {phases.map((phase) => {
            const locked = !unlockedPhaseIds.includes(phase.id);

            return (
              <option key={phase.id} value={phase.id} disabled={locked}>
                {locked ? "[locked] " : ""}Phase {phase.id}: {phase.title}
              </option>
            );
          })}
        </select>

        <select
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">All Types</option>
          <option value="daily">Daily Questions</option>
          <option value="mock">Mock Interview</option>
          <option value="bookmarked">Bookmarked ({bookmarks.length})</option>
        </select>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1 text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{resultCount}</span>
        questions
      </div>
    </div>
  );
}

function QuestionCard({ question, isBookmarked, onToggleBookmark }) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-colors duration-150 ${
        isBookmarked ? "border-amber-300 bg-amber-50/20" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <SoftPill color={question.colors.dot}>
              Phase {question.phase}: {question.phaseTitle}
            </SoftPill>
            <StatusPill dot={question.type === "mock" ? "#7C3AED" : "#2563EB"}>
              {question.typeLabel}
            </StatusPill>
            <span className="text-xs text-gray-400">
              Week {question.week} - {question.day}
            </span>
          </div>

          <p className="mb-1.5 text-xs font-medium text-gray-500">
            {question.topic}
          </p>
          <p className="text-sm font-medium leading-relaxed text-gray-800">
            "{question.question}"
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleBookmark(question.id)}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 ${
            isBookmarked
              ? "bg-amber-100 text-amber-500"
              : "bg-gray-50 text-gray-300 hover:bg-amber-50 hover:text-amber-400"
          }`}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
        >
          <Bookmark
            className="h-4 w-4"
            fill={isBookmarked ? "currentColor" : "none"}
          />
        </button>
      </div>
    </div>
  );
}

export function QuestionBank({ unlockedPhaseIds }) {
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { bookmarks, toggleBookmark } = useBookmarks();
  const {
    phases,
    weeks,
    getMockInterview,
    getWeekLessons,
    getMockInterviewQuestions,
  } = useRoadmapData();

  const questions = useMemo(
    () =>
      buildQuestionList(
        unlockedPhaseIds,
        weeks,
        phases,
        getMockInterview,
        getWeekLessons,
        getMockInterviewQuestions,
      ),
    [
      unlockedPhaseIds,
      weeks,
      phases,
      getMockInterview,
      getWeekLessons,
      getMockInterviewQuestions,
    ],
  );

  const filteredQuestions = useMemo(() => {
    const query = search.toLowerCase();

    return questions.filter((question) => {
      const matchesPhase =
        phaseFilter === "all" || String(question.phase) === phaseFilter;
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "bookmarked" && bookmarks.includes(question.id)) ||
        question.type === typeFilter;
      const matchesSearch =
        !query ||
        question.question.toLowerCase().includes(query) ||
        question.topic.toLowerCase().includes(query) ||
        question.weekTitle.toLowerCase().includes(query);

      return matchesPhase && matchesType && matchesSearch;
    });
  }, [bookmarks, phaseFilter, questions, search, typeFilter]);

  return (
    <div className="flex flex-col gap-5">
      <QuestionFilters
        search={search}
        onSearchChange={setSearch}
        phaseFilter={phaseFilter}
        onPhaseFilterChange={setPhaseFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        unlockedPhaseIds={unlockedPhaseIds}
        bookmarks={bookmarks}
        resultCount={filteredQuestions.length}
        phases={phases}
      />

      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
          <p className="text-sm text-gray-400">
            No questions match your filters.
          </p>
          {typeFilter === "bookmarked" ? (
            <p className="mt-1 text-xs text-gray-400">
              Bookmark questions on the roadmap to save them here.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isBookmarked={bookmarks.includes(question.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
