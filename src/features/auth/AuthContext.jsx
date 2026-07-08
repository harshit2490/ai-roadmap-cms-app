import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile
  async function fetchProfile(userObj) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userObj.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return null;
      }

      // Check if we need to extract name from user_metadata (e.g. Google Sign-In)
      if (!data.firstName && !data.lastName) {
        const fullName = userObj.user_metadata?.full_name || userObj.user_metadata?.name;
        if (fullName) {
          const parts = fullName.split(" ");
          const firstName = parts[0] || "";
          const lastName = parts.slice(1).join(" ") || "";

          // Save the extracted names to the profile
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({ firstName, lastName, fullName })
            .eq("id", userObj.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            return updatedProfile;
          } else {
            console.warn("Failed to update profile with extracted names. (Check RLS policies)", updateError);
            // Even if update fails (e.g. due to missing RLS policy), we should still return the fetched profile so the user can log in!
            return data;
          }
        }
      }

      return data;
    } catch (err) {
      console.error("Failed to load user profile:", err);
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    // Get active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user).then((userProfile) => {
          if (isMounted) {
            setProfile(userProfile);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        setLoading(true);
        const userProfile = await fetchProfile(currentSession.user);
        if (isMounted) {
          setProfile(userProfile);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email, password, firstName, lastName) {
    const fullName = `${firstName} ${lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
