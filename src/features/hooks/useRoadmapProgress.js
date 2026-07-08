import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY } from "../constants";
import { loadData, saveData } from "../storage";
import { useAuth } from "../auth/AuthContext";
import { fetchUserProgress, saveUserProgress, resetUserProgress } from "@/lib/api/progress";

export function useRoadmapProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync progress based on auth state
  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      setLoading(true);
      if (user) {
        // Authenticated: Load from Supabase
        const dbProgress = await fetchUserProgress(user.id);
        if (isMounted) {
          setProgress(dbProgress);
        }
      } else {
        // Guest: Load from localStorage
        const localProgress = loadData(STORAGE_KEY, {});
        if (isMounted) {
          setProgress(localProgress);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle updates with local mutation & DB sync in background
  const mutateProgress = useCallback(
    async (key, value) => {
      // 1. Optimistically update local React state
      setProgress((prev) => {
        const next = { ...prev, [key]: value };
        if (!user) {
          // If guest, save to localStorage
          saveData(STORAGE_KEY, next);
        }
        return next;
      });

      // 2. Synchronize to Supabase if authenticated
      if (user) {
        try {
          await saveUserProgress(user.id, key, value);
        } catch (err) {
          console.error(`Failed to sync progress for ${key}:`, err);
          // Rollback on failure
          setProgress((prev) => ({ ...prev, [key]: !value }));
        }
      }
    },
    [user]
  );

  const toggleDay = useCallback(
    (week, dayIndex, value) => {
      mutateProgress(`w${week}_d${dayIndex}`, value);
    },
    [mutateProgress]
  );

  const toggleProject = useCallback(
    (week, value) => {
      mutateProgress(`w${week}_project`, value);
    },
    [mutateProgress]
  );

  const toggleMock = useCallback(
    (week, value) => {
      mutateProgress(`w${week}_mock`, value);
    },
    [mutateProgress]
  );

  const resetProgress = useCallback(async () => {
    setProgress({});
    if (user) {
      try {
        await resetUserProgress(user.id);
      } catch (err) {
        console.error("Failed to reset progress in Supabase:", err);
      }
    } else {
      saveData(STORAGE_KEY, {});
    }
  }, [user]);

  return {
    progress,
    loading,
    toggleDay,
    toggleProject,
    toggleMock,
    resetProgress,
  };
}
