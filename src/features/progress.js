import {
  getPhaseWeeks as selectPhaseWeeks,
  getWeekLessons,
  phases,
  weeks,
} from "@/data/roadmap";

export function getPhaseWeeks(phaseId) {
  return selectPhaseWeeks(phaseId);
}

export function getCompletedDaysForWeek(week, progress) {
  return getWeekLessons(week.id).filter(
    (_, index) => progress[`w${week.weekNo}_d${index}`],
  ).length;
}

export function getPhaseProgress(phaseId, progress) {
  const phaseWeeks = getPhaseWeeks(phaseId);
  const totalDays = phaseWeeks.reduce(
    (sum, week) => sum + getWeekLessons(week.id).length,
    0,
  );
  const doneDays = phaseWeeks.reduce(
    (sum, week) => sum + getCompletedDaysForWeek(week, progress),
    0,
  );

  return { phaseWeeks, totalDays, doneDays };
}

export function getOverallProgress(progress) {
  const totalDays = weeks.reduce(
    (sum, week) => sum + getWeekLessons(week.id).length,
    0,
  );
  const doneDays = weeks.reduce(
    (sum, week) => sum + getCompletedDaysForWeek(week, progress),
    0,
  );
  const pct = totalDays === 0 ? 0 : Math.round((doneDays / totalDays) * 100);

  return { totalDays, doneDays, pct };
}

export function getCompletedProjects(progress) {
  return weeks.filter((week) => progress[`w${week.weekNo}_project`]).length;
}

export function getCompletedMocks(progress) {
  return weeks.filter((week) => progress[`w${week.weekNo}_mock`]).length;
}

// Phase 1 is always open. Later phases unlock only when every day in the
// previous phase has been checked off.
export function isPhaseUnlocked(phaseId, progress) {
  if (phaseId === 1) return true;

  const { totalDays, doneDays } = getPhaseProgress(phaseId - 1, progress);
  return doneDays >= totalDays;
}

export function getUnlockedPhaseIds(progress) {
  return phases
    .filter((phase) => isPhaseUnlocked(phase.id, progress))
    .map((phase) => phase.id);
}
