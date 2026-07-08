import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { ArrowLeft, Lock, Mail, Chrome, AlertCircle, User } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const from = location.state?.from?.pathname || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");

    if (isSignUp && password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email, password, firstName, lastName);
        setSuccessMsg("Registration successful! Please check your email inbox to verify your account.");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to initialize Google login.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 py-12 sm:px-6 lg:px-8">
      {/* Visual background decorations */}
      <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -right-48 -bottom-48 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"></div>

      <div className="relative w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to roadmap
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl px-8 py-10 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {isSignUp ? "Create account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isSignUp ? "Sign up to track your learning journey" : "Sign in to resume where you left off"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-xs font-medium text-green-400">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>{successMsg}</p>
              </div>
            )}

            <div className="space-y-4">
              {isSignUp && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      First Name
                    </label>
                    <div className="relative mt-1">
                      <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Name
                    </label>
                    <div className="relative mt-1">
                      <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/60 px-2 tracking-wider text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-950/70 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-slate-700"
          >
            <Chrome className="h-4.5 w-4.5 text-red-400" />
            Google Workspace
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            {isSignUp ? "Already have an account? " : "New to the platform? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMsg("");
              }}
              className="font-semibold text-blue-500 hover:text-blue-400 transition-colors focus:outline-none"
            >
              {isSignUp ? "Sign in instead" : "Sign up free"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
