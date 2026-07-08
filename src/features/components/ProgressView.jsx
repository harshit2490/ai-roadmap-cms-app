import { useState } from "react";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { phaseColors } from "../constants";
import { CircleProgress, LinearProgress } from "./ui";

function SummaryCard({ card }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-900">
            {card.value}
            {card.unit}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{card.label}</p>
          <p className="text-xs text-gray-400">
            of {card.max}
            {card.unit}
          </p>
        </div>
        <CircleProgress value={card.value} max={card.max} color={card.color} />
      </div>

      <div className="mt-3">
        <LinearProgress value={card.value} max={card.max} color={card.color} />
      </div>
    </div>
  );
}

function PhaseBreakdown({ phase, progress }) {
  const { getPhaseProgress, getCompletedDaysForWeek, getWeekLessons } = useRoadmapData();
  const colors = phaseColors[phase.id];
  const { phaseWeeks, totalDays, doneDays } = getPhaseProgress(
    phase.id,
    progress,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            P{phase.id}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{phase.title}</p>
            <p className="text-xs text-gray-500">{phase.weeks}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {doneDays}/{totalDays} days
          </p>
          <CircleProgress
            value={doneDays}
            max={totalDays}
            color={colors.dot}
            size={44}
            fontSize={10}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        {phaseWeeks.map((week) => {
          const completedDays = getCompletedDaysForWeek(week, progress);
          const lessonCount = getWeekLessons(week.id).length;

          return (
            <div key={week.id} className="flex items-center gap-4">
              <span className="w-14 flex-shrink-0 text-xs font-medium text-gray-500">
                Week {week.weekNo}
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="max-w-[200px] truncate text-xs text-gray-700">
                    {week.title}
                  </span>
                  <span className="ml-2 flex-shrink-0 text-xs text-gray-400">
                    {completedDays}/{lessonCount}
                  </span>
                </div>
                <LinearProgress
                  value={completedDays}
                  max={lessonCount}
                  color={colors.dot}
                />
              </div>

              <div className="flex flex-shrink-0 gap-1.5">
                {progress[`w${week.weekNo}_project`] ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    project
                  </span>
                ) : null}
                {progress[`w${week.weekNo}_mock`] ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    mock
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResetPanel({ onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Reset All Progress
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Clear all completed days, projects, and mock sessions. This cannot be
          undone.
        </p>
      </div>

      {!confirmReset ? (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="flex-shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
        >
          Reset Progress
        </button>
      ) : (
        <div className="flex flex-shrink-0 items-center gap-2">
          <p className="text-sm text-gray-600">Are you sure?</p>
          <button
            type="button"
            onClick={() => {
              onReset();
              setConfirmReset(false);
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700"
          >
            Yes, reset
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export function ProgressView({ progress, onReset }) {
  const { phases, weeks, getOverallProgress, getCompletedProjects, getCompletedMocks } = useRoadmapData();
  const { totalDays, doneDays, pct } = getOverallProgress(progress);
  const summaryCards = [
    {
      label: "Days Completed",
      value: doneDays,
      max: totalDays,
      unit: "",
      color: "#2563EB",
    },
    {
      label: "Projects Done",
      value: getCompletedProjects(progress),
      max: weeks.length,
      unit: "",
      color: "#7C3AED",
    },
    {
      label: "Mock Sessions",
      value: getCompletedMocks(progress),
      max: weeks.length,
      unit: "",
      color: "#059669",
    },
    {
      label: "Overall Progress",
      value: pct,
      max: 100,
      unit: "%",
      color: "#EA580C",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} card={card} />
        ))}
      </div>

      {phases.map((phase) => (
        <PhaseBreakdown key={phase.id} phase={phase} progress={progress} />
      ))}

      <ResetPanel onReset={onReset} />
    </div>
  );
}
