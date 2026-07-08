import { Link } from "react-router";
import { CircleProgress } from "./ui";
import logoUrl from "@/assets/logo.png";
import { mainViews } from "../constants";
import { useAuth } from "../auth/AuthContext";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, LogIn, Menu, CircleUserRound } from "lucide-react";

function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user?.user_metadata?.avatar_url}
              alt="user profile image"
              className="h-7 w-7 rounded-full"
            />
          ) : (
            <CircleUserRound />
          )}
        </div>
        <span className="hidden max-w-[120px] truncate sm:block font-bold text-blue-600">
          {user?.user_metadata?.full_name ||
            `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}`}
        </span>
        <Menu className="h-4 w-4 text-gray-700" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {profile?.role || "user"}
            </p>
          </div>

          {["admin", "staff"].includes(profile?.role) && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              Admin Dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function RoadmapHeader({
  activeView,
  onViewChange,
  doneDays,
  totalDays,
  progressPercent,
}) {
  const { phases, weeks } = useRoadmapData();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <img
              src={logoUrl}
              alt="Knowledge Arena Logo"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="truncate text-xl font-bold tracking-tight text-blue-600 sm:text-xl">
                Knowledge Arena
              </h1>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-xs text-gray-500">Overall</p>
                <p className="text-sm font-semibold text-gray-900">
                  {doneDays}/{totalDays} days
                </p>
              </div>
              <CircleProgress
                value={doneDays}
                max={totalDays}
                color="#2563EB"
                size={48}
                fontSize={10}
              />
            </div>

            <UserMenu />
          </div>
        </div>
        <div className="mb-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            AI Engineer Master Plan
          </h1>
          <p className="mt-0.5 text-xs text-blue-500 font-semibold">
            {weeks?.length || 12} Weeks - {phases?.length || 5} Phases -
            Beginner to Senior AI Engineer
          </p>
        </div>
        <div className="-mb-px flex overflow-x-auto border-b border-gray-200">
          {mainViews.map((view) => {
            const label =
              view.id === "progress" && progressPercent > 0
                ? `${view.label} (${progressPercent}%)`
                : view.label;

            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onViewChange(view.id)}
                className={`mr-7 flex-shrink-0 border-b-2 py-3 text-sm transition-colors duration-150 focus-visible:outline-none ${
                  activeView === view.id
                    ? "border-blue-600 font-medium text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
