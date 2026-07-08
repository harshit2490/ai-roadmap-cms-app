import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchFullRoadmapData } from "@/lib/api/roadmap";

const RoadmapDataContext = createContext({
  phases: [],
  weeks: [],
  lessons: [],
  explanations: [],
  weekendProjects: [],
  weekendProjectMilestones: [],
  mockInterviews: [],
  mockInterviewQuestions: [],
  loading: true,
  error: null,
  refresh: async () => {},
  getWeekByWeekNo: () => null,
  getPhaseWeeks: () => [],
  getWeekLessons: () => [],
  getWeekendProject: () => null,
  getWeekendProjectMilestones: () => [],
  getMockInterview: () => null,
  getMockInterviewQuestions: () => [],
  getCompletedDaysForWeek: () => 0,
  getPhaseProgress: () => ({ phaseWeeks: [], totalDays: 0, doneDays: 0 }),
  getOverallProgress: () => ({ totalDays: 0, doneDays: 0, pct: 0 }),
  getCompletedProjects: () => 0,
  getCompletedMocks: () => 0,
  getUnlockedPhaseIds: () => [1],
});

export function RoadmapDataProvider({ children }) {
  const [data, setData] = useState({
    phases: [],
    weeks: [],
    lessons: [],
    explanations: [],
    weekendProjects: [],
    weekendProjectMilestones: [],
    mockInterviews: [],
    mockInterviewQuestions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchFullRoadmapData();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Failed to load roadmap data from Supabase:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronous getters over snapshot state
  const getWeekByWeekNo = useCallback(
    (weekNo) => {
      const normalized = Number(weekNo);
      return data.weeks.find((w) => w.weekNo === normalized) ?? null;
    },
    [data.weeks]
  );

  const getPhaseWeeks = useCallback(
    (phaseNo) => {
      const normalized = Number(phaseNo);
      return data.weeks.filter((w) => w.phaseNo === normalized);
    },
    [data.weeks]
  );

  const getWeekLessons = useCallback(
    (weekId) => {
      const normalized = Number(weekId);
      return data.lessons.filter((l) => l.weekId === normalized);
    },
    [data.lessons]
  );

  const getWeekendProject = useCallback(
    (weekId) => {
      const normalized = Number(weekId);
      return data.weekendProjects.find((wp) => wp.weekId === normalized) ?? null;
    },
    [data.weekendProjects]
  );

  const getWeekendProjectMilestones = useCallback(
    (weekendProjectId) => {
      const normalized = Number(weekendProjectId);
      return data.weekendProjectMilestones.filter(
        (m) => m.weekendProjectId === normalized
      );
    },
    [data.weekendProjectMilestones]
  );

  const getMockInterview = useCallback(
    (weekId) => {
      const normalized = Number(weekId);
      return data.mockInterviews.find((mi) => mi.weekId === normalized) ?? null;
    },
    [data.mockInterviews]
  );

  const getMockInterviewQuestions = useCallback(
    (mockInterviewId) => {
      const normalized = Number(mockInterviewId);
      return data.mockInterviewQuestions.filter(
        (q) => q.mockInterviewId === normalized
      );
    },
    [data.mockInterviewQuestions]
  );

  // Dynamic progress helpers that react to database updates
  const getCompletedDaysForWeek = useCallback(
    (week, progress) => {
      return getWeekLessons(week.id).filter(
        (_, index) => progress[`w${week.weekNo}_d${index}`]
      ).length;
    },
    [getWeekLessons]
  );

  const getPhaseProgress = useCallback(
    (phaseId, progress) => {
      const phaseWeeks = getPhaseWeeks(phaseId);
      const totalDays = phaseWeeks.reduce(
        (sum, week) => sum + getWeekLessons(week.id).length,
        0
      );
      const doneDays = phaseWeeks.reduce(
        (sum, week) => sum + getCompletedDaysForWeek(week, progress),
        0
      );

      return { phaseWeeks, totalDays, doneDays };
    },
    [getPhaseWeeks, getWeekLessons, getCompletedDaysForWeek]
  );

  const getOverallProgress = useCallback(
    (progress) => {
      const totalDays = data.weeks.reduce(
        (sum, week) => sum + getWeekLessons(week.id).length,
        0
      );
      const doneDays = data.weeks.reduce(
        (sum, week) => sum + getCompletedDaysForWeek(week, progress),
        0
      );
      const pct = totalDays === 0 ? 0 : Math.round((doneDays / totalDays) * 100);

      return { totalDays, doneDays, pct };
    },
    [data.weeks, getWeekLessons, getCompletedDaysForWeek]
  );

  const getCompletedProjects = useCallback(
    (progress) => {
      return data.weeks.filter((week) => progress[`w${week.weekNo}_project`]).length;
    },
    [data.weeks]
  );

  const getCompletedMocks = useCallback(
    (progress) => {
      return data.weeks.filter((week) => progress[`w${week.weekNo}_mock`]).length;
    },
    [data.weeks]
  );

  const getUnlockedPhaseIds = useCallback(
    (progress) => {
      return data.phases.filter((phase) => {
        if (phase.id === 1) return true;
        const { totalDays, doneDays } = getPhaseProgress(phase.id - 1, progress);
        return doneDays >= totalDays;
      }).map((phase) => phase.id);
    },
    [data.phases, getPhaseProgress]
  );

  const value = {
    ...data,
    loading,
    error,
    refresh: loadData,
    getWeekByWeekNo,
    getPhaseWeeks,
    getWeekLessons,
    getWeekendProject,
    getWeekendProjectMilestones,
    getMockInterview,
    getMockInterviewQuestions,
    getCompletedDaysForWeek,
    getPhaseProgress,
    getOverallProgress,
    getCompletedProjects,
    getCompletedMocks,
    getUnlockedPhaseIds,
  };

  return (
    <RoadmapDataContext.Provider value={value}>
      {children}
    </RoadmapDataContext.Provider>
  );
}

export function useRoadmapData() {
  return useContext(RoadmapDataContext);
}
