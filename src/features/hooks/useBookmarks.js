import { useCallback, useEffect, useState } from "react";
import { BOOKMARK_KEY } from "../constants";
import { loadData, saveData } from "../storage";
import { useAuth } from "../auth/AuthContext";
import { fetchUserBookmarks, addUserBookmark, removeUserBookmark } from "@/lib/api/progress";

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBookmarks() {
      setLoading(true);
      if (user) {
        const dbBookmarks = await fetchUserBookmarks(user.id);
        if (isMounted) {
          setBookmarks(dbBookmarks);
        }
      } else {
        const localBookmarks = loadData(BOOKMARK_KEY, []);
        if (isMounted) {
          setBookmarks(localBookmarks);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    loadBookmarks();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleBookmark = useCallback(
    async (id) => {
      const isBookmarked = bookmarks.includes(id);

      // Optimistically update UI state
      setBookmarks((prev) => {
        const next = isBookmarked
          ? prev.filter((b) => b !== id)
          : [...prev, id];

        if (!user) {
          saveData(BOOKMARK_KEY, next);
        }
        return next;
      });

      // Synchronize changes to database if logged in
      if (user) {
        try {
          if (isBookmarked) {
            await removeUserBookmark(user.id, id);
          } else {
            await addUserBookmark(user.id, id);
          }
        } catch (err) {
          console.error(`Failed to sync bookmark for ${id}:`, err);
          // Rollback state on error
          setBookmarks((prev) =>
            isBookmarked ? [...prev, id] : prev.filter((b) => b !== id)
          );
        }
      }
    },
    [bookmarks, user]
  );

  return { bookmarks, loading, toggleBookmark };
}
