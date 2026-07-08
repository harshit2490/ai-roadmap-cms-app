import { Link } from "react-router";
import { useAuth } from "./AuthContext";

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Verifying administrative privileges...</p>
        </div>
      </div>
    );
  }

  if (!user || !["admin", "staff"].includes(profile?.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            You do not have administrative privileges to access this dashboard. If you believe this is an error, please check your user account configuration.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Back to Roadmap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
