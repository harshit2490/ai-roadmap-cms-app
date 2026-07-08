import { Lock } from "lucide-react";
import { phaseColors } from "../constants";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { CircleProgress, LinearProgress } from "./ui";

export function PhaseCard({ phase, isActive, onClick, progress, isUnlocked }) {
  const { phases, getPhaseProgress } = useRoadmapData();
  const colors = phaseColors[phase.id];
  const { totalDays, doneDays } = getPhaseProgress(phase.id, progress);

  if (!isUnlocked) {
    const previousPhaseTitle =
      phase.id > 1 ? phases.find((item) => item.id === phase.id - 1)?.title : "";

    return (
      <div className="w-full cursor-not-allowed select-none rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 opacity-70">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400">{phase.label}</p>
            <p className="mt-0.5 text-sm font-semibold leading-tight text-gray-400">
              {phase.title}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{phase.weeks}</p>
          </div>

          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Complete{" "}
          <span className="font-medium">
            Phase {phase.id - 1}: {previousPhaseTitle}
          </span>{" "}
          to unlock
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
        isActive
          ? "border-gray-400 bg-gray-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500">{phase.label}</p>
          <p className="mt-0.5 text-sm font-semibold leading-tight text-gray-900">
            {phase.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{phase.weeks}</p>
        </div>
        <CircleProgress value={doneDays} max={totalDays} color={colors.dot} />
      </div>

      <div className="mt-3">
        <LinearProgress value={doneDays} max={totalDays} color={colors.dot} />
        <p className="mt-1 text-xs text-gray-400">
          {doneDays}/{totalDays} days complete
        </p>
      </div>
    </button>
  );
}
