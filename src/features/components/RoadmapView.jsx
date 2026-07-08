import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import {
  phaseColors,
  roadmapSummaryCards,
  seniorAdviceItems,
} from "../constants";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { PhaseCard } from "./PhaseCard";
import { WeekDetail } from "./WeekDetail";
import { CircleProgress, SoftPill, StatusPill, Switch } from "./ui";

function SummaryGrid() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {roadmapSummaryCards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {card.label}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

function PhaseSidebar({
  activePhase,
  progress,
  availablePhaseIds,
  onPhaseClick,
}) {
  const { phases } = useRoadmapData();
  return (
    <aside className="flex flex-shrink-0 flex-col gap-3 lg:w-64">
      {phases.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          isActive={activePhase === phase.id}
          onClick={() => onPhaseClick(phase.id)}
          progress={progress}
          isUnlocked={availablePhaseIds.includes(phase.id)}
        />
      ))}
    </aside>
  );
}

function WeekSelector({
  activePhase,
  activeWeek,
  progress,
  currentWeek,
  onWeekClick,
}) {
  const { getPhaseWeeks, phases, getCompletedDaysForWeek, getWeekLessons } =
    useRoadmapData();
  const visibleWeeks = getPhaseWeeks(activePhase);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 pb-0 pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          {phases.find((phase) => phase.id === activePhase)?.title}
        </p>
        <div className="flex overflow-x-auto">
          {visibleWeeks.map((week) => {
            const completedDays = getCompletedDaysForWeek(week, progress);
            const complete = completedDays === getWeekLessons(week.id).length;

            return (
              <button
                key={week.id}
                type="button"
                onClick={() => onWeekClick(week.weekNo)}
                className={`mr-5 flex flex-shrink-0 items-center gap-1.5 border-b-2 pb-3 text-sm transition-colors duration-150 focus-visible:outline-none ${
                  activeWeek === week.weekNo
                    ? "-mb-[1px] border-blue-600 font-medium text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Week {week.weekNo}
                {complete ? (
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-5 py-3">
        {currentWeek ? (
          <>
            <StatusPill dot={phaseColors[currentWeek.phaseNo].dot}>
              5 daily sessions
            </StatusPill>
            <StatusPill dot="#059669">1 weekend project</StatusPill>
            <StatusPill dot="#7C3AED">mock interview</StatusPill>
            <StatusPill dot="#EA580C">checkpoint</StatusPill>
          </>
        ) : null}
      </div>
    </div>
  );
}

function WeekNavigation({
  activeWeek,
  nextWeekLocked,
  onPreviousWeek,
  onNextWeek,
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPreviousWeek}
        disabled={activeWeek === 1}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <span className="text-xs text-gray-500">Week {activeWeek} of 12</span>

      <button
        type="button"
        onClick={onNextWeek}
        disabled={activeWeek === 12 || nextWeekLocked}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function LockedPhaseHint({ nextWeek }) {
  const { getPhaseWeeks, getWeekLessons } = useRoadmapData();
  if (!nextWeek) return null;

  const requiredDays = getPhaseWeeks(nextWeek.phaseNo - 1).reduce(
    (sum, week) => sum + getWeekLessons(week.id).length,
    0,
  );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Lock className="h-4 w-4 text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">
          Phase {nextWeek.phaseNo} is locked
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Check off all {requiredDays} days in Phase {nextWeek.phaseNo - 1} to
          unlock the next phase.
        </p>
      </div>
    </div>
  );
}

function AdviceCard() {
  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-1">
          <SoftPill color="#DC2626">Senior Advice</SoftPill>
          <h3 className="mb-1 mt-3 text-base font-semibold text-gray-900">
            Build one excellent system - not ten similar demos
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Every RAG chatbot variant is fundamentally the same pipeline with a
            different source adapter. Interviewers can tell the difference
            between ten demos and one production-quality system.
          </p>

          <div className="flex flex-col gap-1.5">
            {seniorAdviceItems.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="flex-shrink-0 text-gray-400">-</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 rounded-xl border border-gray-200 p-4 text-center sm:w-36">
          <CircleProgress value={1} max={1} color="#2563EB" size={60} />
          <p className="mt-2 text-xs font-semibold text-gray-900">1 Capstone</p>
          <p className="mt-0.5 text-xs text-gray-500">
            beats 10 demos every time
          </p>
        </div>
      </div>
    </div>
  );
}

export function RoadmapView({
  activePhase,
  activeWeek,
  progress,
  availablePhaseIds,
  currentWeek,
  nextWeek,
  nextWeekLocked,
  phaseLocksEnabled,
  onPhaseLocksChange,
  onPhaseClick,
  onWeekClick,
  onPreviousWeek,
  onNextWeek,
  onToggleDay,
  onToggleProject,
  onToggleMock,
  activeExplanation,
  onOpenExplanation,
  onCloseExplanation,
  onNextExplanation,
}) {
  return (
    <>
      <SummaryGrid />

      <div className="flex flex-col gap-6 lg:flex-row">
        <PhaseSidebar
          activePhase={activePhase}
          progress={progress}
          availablePhaseIds={availablePhaseIds}
          onPhaseClick={onPhaseClick}
          phaseLocksEnabled={phaseLocksEnabled}
          onPhaseLocksChange={onPhaseLocksChange}
        />

        <section className="flex min-w-0 flex-1 flex-col gap-6">
          <WeekSelector
            activePhase={activePhase}
            activeWeek={activeWeek}
            progress={progress}
            currentWeek={currentWeek}
            onWeekClick={onWeekClick}
          />

          {currentWeek ? (
            <WeekDetail
              week={currentWeek}
              progress={progress}
              onToggleDay={onToggleDay}
              onToggleProject={onToggleProject}
              onToggleMock={onToggleMock}
              activeExplanation={activeExplanation}
              onOpenExplanation={onOpenExplanation}
              onCloseExplanation={onCloseExplanation}
              onNextExplanation={onNextExplanation}
            />
          ) : null}

          <WeekNavigation
            activeWeek={activeWeek}
            nextWeekLocked={nextWeekLocked}
            onPreviousWeek={onPreviousWeek}
            onNextWeek={onNextWeek}
          />

          {nextWeekLocked ? <LockedPhaseHint nextWeek={nextWeek} /> : null}
        </section>
      </div>

      <AdviceCard />
    </>
  );
}
