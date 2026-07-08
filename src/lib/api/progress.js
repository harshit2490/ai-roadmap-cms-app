import { supabase } from "../supabaseClient";

/**
 * Fetch all user progress keys and map to a key-value object
 */
export async function fetchUserProgress(userId) {
  if (!userId) return {};

  const { data, error } = await supabase
    .from("user_progress")
    .select("key, value")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user progress:", error.message);
    return {};
  }

  const progress = {};
  data.forEach((row) => {
    progress[row.key] = row.value;
  });
  return progress;
}

/**
 * Save or update user progress key
 */
export async function saveUserProgress(userId, key, value) {
  if (!userId) return;

  const { error } = await supabase
    .from("user_progress")
    .upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" }
    );

  if (error) {
    console.error(`Error saving progress for ${key}:`, error.message);
    throw error;
  }
}

/**
 * Delete all progress entries for the user
 */
export async function resetUserProgress(userId) {
  if (!userId) return;

  const { error } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error resetting user progress:", error.message);
    throw error;
  }
}

/**
 * Fetch all bookmarks for a user as an array of IDs
 */
export async function fetchUserBookmarks(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("user_bookmarks")
    .select("question_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user bookmarks:", error.message);
    return [];
  }

  return data.map((row) => row.question_id);
}

/**
 * Add a bookmark
 */
export async function addUserBookmark(userId, questionId) {
  if (!userId) return;

  const { error } = await supabase
    .from("user_bookmarks")
    .insert({ user_id: userId, question_id: questionId });

  if (error) {
    // If it's a unique constraint violation, ignore it as it means it's already bookmarked
    if (error.code !== "23505") {
      console.error(`Error adding bookmark for ${questionId}:`, error.message);
      throw error;
    }
  }
}

/**
 * Remove a bookmark
 */
export async function removeUserBookmark(userId, questionId) {
  if (!userId) return;

  const { error } = await supabase
    .from("user_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);

  if (error) {
    console.error(`Error removing bookmark for ${questionId}:`, error.message);
    throw error;
  }
}
