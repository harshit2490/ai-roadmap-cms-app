import { useEffect, useState } from "react";
import { useRoadmapData } from "./hooks/useRoadmapData";
import { useRoadmapProgress } from "./hooks/useRoadmapProgress";
import { useAuth } from "./auth/AuthContext";
import { ProgressView } from "./components/ProgressView";
import { QuestionBank } from "./components/QuestionBank";
import { RoadmapHeader } from "./components/RoadmapHeader";
import { RoadmapView } from "./components/RoadmapView";

export default function RoadmapPage() {
  const [activeView, setActiveView] = useState("roadmap");
  const [activePhase, setActivePhase] = useState(1);
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeExplanation, setActiveExplanation] = useState(null);
  const [phaseLocksEnabled, setPhaseLocksEnabled] = useState(false);

  const { user } = useAuth();
  const {
    phases,
    loading: dataLoading,
    getWeekByWeekNo,
    getPhaseWeeks,
    getOverallProgress,
    getUnlockedPhaseIds,
  } = useRoadmapData();

  const {
    progress,
    loading: progressLoading,
    toggleDay,
    toggleProject,
    toggleMock,
    resetProgress,
  } = useRoadmapProgress();

  const unlockedPhaseIds = getUnlockedPhaseIds(progress);

  // Freemium: Phase 1 always available, Phases 2-5 require login
  const freemiumAvailableIds = user
    ? phases.map((p) => p.id)
    : [1];

  // Combine phase lock toggle + freemium gating
  const availablePhaseIds = phaseLocksEnabled
    ? unlockedPhaseIds.filter((id) => freemiumAvailableIds.includes(id))
    : freemiumAvailableIds;

  const currentWeek = getWeekByWeekNo(activeWeek);
  const nextWeek = getWeekByWeekNo(activeWeek + 1);
  const nextWeekLocked =
    (phaseLocksEnabled && nextWeek
      ? !unlockedPhaseIds.includes(nextWeek.phaseNo)
      : false) ||
    (!user && nextWeek && nextWeek.phaseNo > 1);
  const overallProgress = getOverallProgress(progress);

  useEffect(() => {
    if (!phaseLocksEnabled || unlockedPhaseIds.includes(activePhase)) return;

    const fallbackPhaseId = unlockedPhaseIds[unlockedPhaseIds.length - 1] ?? 1;
    const fallbackWeek = getPhaseWeeks(fallbackPhaseId).at(-1);

    setActivePhase(fallbackPhaseId);
    if (fallbackWeek) {
      setActiveWeek(fallbackWeek.weekNo);
    }
  }, [activePhase, phaseLocksEnabled, unlockedPhaseIds, getPhaseWeeks]);

  function selectPhase(phaseId) {
    if (!availablePhaseIds.includes(phaseId)) return;

    setActivePhase(phaseId);
    const firstWeek = getPhaseWeeks(phaseId)[0];
    if (firstWeek) setActiveWeek(firstWeek.weekNo);
  }

  function goToPreviousWeek() {
    if (activeWeek === 1) return;

    const previousWeek = getWeekByWeekNo(activeWeek - 1);
    if (!previousWeek) return;

    setActivePhase(previousWeek.phaseNo);
    setActiveWeek(previousWeek.weekNo);
  }

  function goToNextWeek() {
    if (activeWeek === 12 || nextWeekLocked || !nextWeek) return;

    setActivePhase(nextWeek.phaseNo);
    setActiveWeek(nextWeek.weekNo);
  }

  function openExplanation(weekNumber, lessonNo) {
    setActiveExplanation({ weekNumber, lessonNo });
  }

  function closeExplanation() {
    setActiveExplanation(null);
  }

  function goToExplanation(nextWeekNumber, nextLessonNo) {
    const targetWeek = getWeekByWeekNo(nextWeekNumber);
    if (targetWeek) {
      setActivePhase(targetWeek.phaseNo);
      setActiveWeek(targetWeek.weekNo);
    }

    setActiveExplanation({
      weekNumber: nextWeekNumber,
      lessonNo: nextLessonNo,
    });
  }

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Loading roadmap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <RoadmapHeader
        activeView={activeView}
        onViewChange={setActiveView}
        doneDays={overallProgress.doneDays}
        totalDays={overallProgress.totalDays}
        progressPercent={overallProgress.pct}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeView === "roadmap" ? (
          <RoadmapView
            activePhase={activePhase}
            activeWeek={activeWeek}
            progress={progress}
            availablePhaseIds={availablePhaseIds}
            currentWeek={currentWeek}
            nextWeek={nextWeek}
            nextWeekLocked={nextWeekLocked}
            phaseLocksEnabled={phaseLocksEnabled}
            onPhaseLocksChange={setPhaseLocksEnabled}
            onPhaseClick={selectPhase}
            onWeekClick={setActiveWeek}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onToggleDay={toggleDay}
            onToggleProject={toggleProject}
            onToggleMock={toggleMock}
            activeExplanation={activeExplanation}
            onOpenExplanation={openExplanation}
            onCloseExplanation={closeExplanation}
            onNextExplanation={goToExplanation}
          />
        ) : null}

        {activeView === "progress" ? (
          <ProgressView progress={progress} onReset={resetProgress} />
        ) : null}

        {activeView === "questions" ? (
          <QuestionBank unlockedPhaseIds={unlockedPhaseIds} />
        ) : null}
      </main>
    </div>
  );
}
