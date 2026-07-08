import { useState, useEffect } from "react";
import { useRoadmapData } from "@/features/hooks/useRoadmapData";
import { AdminRoute } from "@/features/auth/AdminRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { Link } from "react-router";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Save,
  Layers,
  Calendar,
  BookOpen,
  FileText,
  CheckSquare,
  HelpCircle,
  Eye,
  Users,
  Search,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import logoUrl from "@/assets/logo.png";
import {
  upsertPhase,
  deletePhase,
  upsertWeek,
  deleteWeek,
  upsertLesson,
  deleteLesson,
  upsertWeekendProject,
  deleteWeekendProject,
  upsertMockInterview,
  deleteMockInterview,
  getProfiles,
  updateProfileRole,
} from "@/lib/api/admin";

export default function AdminPageWrapper() {
  return (
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  );
}

function AdminPage() {
  const {
    phases,
    weeks,
    lessons,
    explanations,
    weekendProjects,
    weekendProjectMilestones,
    mockInterviews,
    mockInterviewQuestions,
    refresh,
  } = useRoadmapData();

  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState("phases");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile state
  const [profilesData, setProfilesData] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState(null); // { type, data }

  // New item templates
  const initialPhase = {
    id: "",
    label: "",
    title: "",
    weeks: "",
    color: "#2563EB",
  };
  const initialWeek = {
    id: "",
    phaseNo: 1,
    weekNo: "",
    title: "",
    slug: "",
    focus: "",
    revisionCheckpoint: "",
  };
  const initialLesson = {
    id: "",
    weekId: "",
    lessonNo: "",
    slug: "",
    title: "",
    estimatedMinutes: 90,
    difficulty: "Beginner",
    exercise: "",
    interviewQuestion: "",
  };
  const initialProject = {
    id: "",
    weekId: "",
    slug: "",
    title: "",
    description: "",
    milestones: "",
  };
  const initialInterview = { id: "", weekId: "", format: "", questions: "" };

  const tabs = [
    { id: "phases", label: "Phases", icon: Layers },
    { id: "weeks", label: "Weeks", icon: Calendar },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "explanations", label: "Explanations", icon: FileText },
    { id: "projects", label: "Projects & Milestones", icon: CheckSquare },
    { id: "mocks", label: "Mock Interviews", icon: HelpCircle },
  ];

  const profileTabs = [{ id: "profiles", label: "Profiles", icon: Users }];

  useEffect(() => {
    if (activeTab === "profiles") {
      loadProfiles();
    }
  }, [activeTab]);

  async function loadProfiles() {
    setProfilesLoading(true);
    try {
      const data = await getProfiles();
      setProfilesData(data || []);
    } catch (err) {
      showError("Failed to load profiles.");
    } finally {
      setProfilesLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateProfileRole(userId, newRole);
      showSuccess("User role updated successfully!");
      loadProfiles();
    } catch (err) {
      showError("Failed to update user role.");
    }
  }

  function showSuccess(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 5000);
  }

  function showError(msg) {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 5000);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    setErrorMessage("");

    try {
      if (editingItem.type === "phase") {
        await upsertPhase(editingItem.data);
        showSuccess("Phase saved successfully!");
      } else if (editingItem.type === "week") {
        await upsertWeek(editingItem.data);
        showSuccess("Week saved successfully!");
      } else if (editingItem.type === "lesson") {
        // Find existing sections if editing
        const explanation = explanations.find(
          (exp) => exp.slug === editingItem.data.slug,
        );
        const sections = explanation?.sections ?? [];
        await upsertLesson(editingItem.data, sections);
        showSuccess("Lesson saved successfully!");
      } else if (editingItem.type === "project") {
        const milestoneArray = editingItem.data.milestones
          .split("\n")
          .filter((t) => t.trim() !== "")
          .map((title, i) => ({ order: i + 1, title: title.trim() }));
        await upsertWeekendProject(editingItem.data, milestoneArray);
        showSuccess("Project and milestones saved successfully!");
      } else if (editingItem.type === "mock") {
        const questionArray = editingItem.data.questions
          .split("\n")
          .filter((q) => q.trim() !== "")
          .map((question, i) => ({ order: i + 1, question: question.trim() }));
        await upsertMockInterview(editingItem.data, questionArray);
        showSuccess("Mock interview saved successfully!");
      } else if (editingItem.type === "explanation") {
        // Parse section edits
        const lesson = lessons.find((l) => l.slug === editingItem.data.slug);
        await upsertLesson(lesson, editingItem.data.sections);
        showSuccess("Explanation sections saved successfully!");
      }

      setEditingItem(null);
      await refresh();
    } catch (err) {
      showError(err.message || "Failed to save data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(type, id) {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action is irreversible.",
      )
    )
      return;
    setLoading(true);
    try {
      if (type === "phase") await deletePhase(id);
      else if (type === "week") await deleteWeek(id);
      else if (type === "lesson") await deleteLesson(id);
      else if (type === "project") await deleteWeekendProject(id);
      else if (type === "mock") await deleteMockInterview(id);

      showSuccess("Item deleted successfully!");
      await refresh();
    } catch (err) {
      showError(err.message || "Failed to delete item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <img
                src={logoUrl}
                alt="Knowledge Arena"
                className="h-8 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Knowledge Arena Admin
                </h1>
                <p className="text-xs text-gray-500">
                  Manage roadmap syllabus and lesson contents
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl bg-gray-150 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Eye className="h-4 w-4" /> View Live Site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Status notifications */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {/* CMS Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation */}
          <div className="lg:col-span-1 space-y-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Content Sections
              </p>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setEditingItem(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}

              <div className="mt-4 border-t border-gray-150 pt-2">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Profile Sections
                </p>
                {profileTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setEditingItem(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main workspace */}
          <div className="lg:col-span-3 space-y-6">
            {/* Forms section */}
            {editingItem ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-150 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingItem.data.id ? "Edit" : "Add"} {editingItem.type}
                  </h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* DYNAMIC FORM ACCORDING TO ITEM TYPE */}
                  {editingItem.type === "phase" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Phase ID (Number)
                        </label>
                        <input
                          type="number"
                          required
                          disabled={!!editingItem.data.id}
                          value={editingItem.data.id}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                id: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Label (e.g. Phase 1)
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.label}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, label: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Weeks Duration (e.g. Weeks 1–3)
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.weeks}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, weeks: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Color Hex
                        </label>
                        <input
                          type="color"
                          required
                          value={editingItem.data.color}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, color: e.target.value },
                            }))
                          }
                          className="mt-1 h-10 w-full rounded-xl border border-gray-200 p-1"
                        />
                      </div>
                    </div>
                  )}

                  {editingItem.type === "week" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Week ID (Unique Number)
                        </label>
                        <input
                          type="number"
                          required
                          disabled={!!editingItem.data.id}
                          value={editingItem.data.id}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                id: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Phase Number
                        </label>
                        <select
                          value={editingItem.data.phaseNo}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                phaseNo: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
                        >
                          {phases.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}: {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Week Number (Syllabus Order)
                        </label>
                        <input
                          type="number"
                          required
                          value={editingItem.data.weekNo}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                weekNo: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Week Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Slug
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.slug}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, slug: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Focus description
                        </label>
                        <textarea
                          required
                          value={editingItem.data.focus}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, focus: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-20"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Revision Checkpoint
                        </label>
                        <textarea
                          required
                          value={editingItem.data.revisionCheckpoint}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                revisionCheckpoint: e.target.value,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-20"
                        />
                      </div>
                    </div>
                  )}

                  {editingItem.type === "lesson" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Lesson ID (Unique Number)
                        </label>
                        <input
                          type="number"
                          required
                          disabled={!!editingItem.data.id}
                          value={editingItem.data.id}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                id: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Target Week
                        </label>
                        <select
                          value={editingItem.data.weekId}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                weekId: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
                        >
                          <option value="">Select Week</option>
                          {weeks.map((w) => (
                            <option key={w.id} value={w.id}>
                              Week {w.weekNo}: {w.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Lesson No (1 to 5)
                        </label>
                        <input
                          type="number"
                          required
                          value={editingItem.data.lessonNo}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                lessonNo: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Lesson Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Slug
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.slug}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, slug: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Difficulty
                        </label>
                        <select
                          value={editingItem.data.difficulty}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                difficulty: e.target.value,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Practical Exercise
                        </label>
                        <textarea
                          required
                          value={editingItem.data.exercise}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, exercise: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-20"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Interview Question
                        </label>
                        <textarea
                          required
                          value={editingItem.data.interviewQuestion}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                interviewQuestion: e.target.value,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-20"
                        />
                      </div>
                    </div>
                  )}

                  {editingItem.type === "project" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Project ID (Unique Number)
                        </label>
                        <input
                          type="number"
                          required
                          disabled={!!editingItem.data.id}
                          value={editingItem.data.id}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                id: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Associated Week
                        </label>
                        <select
                          value={editingItem.data.weekId}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                weekId: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
                        >
                          <option value="">Select Week</option>
                          {weeks.map((w) => (
                            <option key={w.id} value={w.id}>
                              Week {w.weekNo}: {w.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Project Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.title}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Slug
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.slug}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, slug: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Description
                        </label>
                        <textarea
                          required
                          value={editingItem.data.description}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                description: e.target.value,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-24"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Milestones (One per line)
                        </label>
                        <textarea
                          value={editingItem.data.milestones}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                milestones: e.target.value,
                              },
                            }))
                          }
                          placeholder="Milestone step 1&#10;Milestone step 2&#10;Milestone step 3"
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-32"
                        />
                      </div>
                    </div>
                  )}

                  {editingItem.type === "mock" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Mock ID (Unique Number)
                        </label>
                        <input
                          type="number"
                          required
                          disabled={!!editingItem.data.id}
                          value={editingItem.data.id}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                id: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Associated Week
                        </label>
                        <select
                          value={editingItem.data.weekId}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                weekId: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
                        >
                          <option value="">Select Week</option>
                          {weeks.map((w) => (
                            <option key={w.id} value={w.id}>
                              Week {w.weekNo}: {w.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Format Description (e.g. 15-min concept drill)
                        </label>
                        <input
                          type="text"
                          required
                          value={editingItem.data.format}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, format: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold uppercase text-gray-400">
                          Interview Questions (One per line)
                        </label>
                        <textarea
                          value={editingItem.data.questions}
                          onChange={(e) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              data: { ...prev.data, questions: e.target.value },
                            }))
                          }
                          placeholder="Question 1&#10;Question 2&#10;Question 3"
                          className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm h-32"
                        />
                      </div>
                    </div>
                  )}

                  {editingItem.type === "explanation" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">
                          Lesson: {editingItem.data.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Add, edit, or delete teaching sections for this
                          lesson.
                        </p>
                      </div>

                      {editingItem.data.sections.map((section, index) => (
                        <div
                          key={index}
                          className="border border-gray-150 rounded-xl p-4 bg-gray-50/50 space-y-3 relative"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const newSections = [
                                ...editingItem.data.sections,
                              ];
                              newSections.splice(index, 1);
                              setEditingItem((prev) => ({
                                ...prev,
                                data: { ...prev.data, sections: newSections },
                              }));
                            }}
                            className="absolute top-4 right-4 text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            Remove Section
                          </button>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold uppercase text-gray-400">
                                Heading
                              </label>
                              <input
                                type="text"
                                required
                                value={section.heading}
                                onChange={(e) => {
                                  const newSections = [
                                    ...editingItem.data.sections,
                                  ];
                                  newSections[index].heading = e.target.value;
                                  setEditingItem((prev) => ({
                                    ...prev,
                                    data: {
                                      ...prev.data,
                                      sections: newSections,
                                    },
                                  }));
                                }}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm bg-white"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold uppercase text-gray-400">
                                Body Content (Markdown Supported)
                              </label>
                              <textarea
                                required
                                value={section.body}
                                onChange={(e) => {
                                  const newSections = [
                                    ...editingItem.data.sections,
                                  ];
                                  newSections[index].body = e.target.value;
                                  setEditingItem((prev) => ({
                                    ...prev,
                                    data: {
                                      ...prev.data,
                                      sections: newSections,
                                    },
                                  }));
                                }}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm h-32 bg-white"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold uppercase text-gray-400">
                                Example Code Block / Analogy (Optional)
                              </label>
                              <textarea
                                value={section.example || ""}
                                onChange={(e) => {
                                  const newSections = [
                                    ...editingItem.data.sections,
                                  ];
                                  newSections[index].example = e.target.value;
                                  setEditingItem((prev) => ({
                                    ...prev,
                                    data: {
                                      ...prev.data,
                                      sections: newSections,
                                    },
                                  }));
                                }}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm h-24 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const newSections = [
                            ...editingItem.data.sections,
                            {
                              order: editingItem.data.sections.length + 1,
                              heading: "",
                              body: "",
                              example: "",
                            },
                          ];
                          setEditingItem((prev) => ({
                            ...prev,
                            data: { ...prev.data, sections: newSections },
                          }));
                        }}
                        className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 hover:border-blue-500 py-3 justify-center w-full text-sm font-semibold text-gray-600 hover:text-blue-600 bg-white transition-colors"
                      >
                        <Plus className="h-4.5 w-4.5" /> Add Section
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-gray-150 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />{" "}
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* List and Tables depending on tab */}
            {!editingItem && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-150 pb-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 capitalize">
                      {activeTab} Manager
                    </h2>
                    <p className="text-xs text-gray-500">
                      Manage all content listings under the {activeTab}{" "}
                      collection.
                    </p>
                  </div>
                  {activeTab !== "explanations" && (
                    <button
                      onClick={() => {
                        if (activeTab === "phases")
                          setEditingItem({
                            type: "phase",
                            data: { ...initialPhase },
                          });
                        if (activeTab === "weeks")
                          setEditingItem({
                            type: "week",
                            data: { ...initialWeek },
                          });
                        if (activeTab === "lessons")
                          setEditingItem({
                            type: "lesson",
                            data: { ...initialLesson },
                          });
                        if (activeTab === "projects")
                          setEditingItem({
                            type: "project",
                            data: { ...initialProject },
                          });
                        if (activeTab === "mocks")
                          setEditingItem({
                            type: "mock",
                            data: { ...initialInterview },
                          });
                      }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${["admin", "staff"].includes(profile?.role) && activeTab !== "profiles" ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-400 cursor-not-allowed opacity-60"}`}
                      disabled={
                        !["admin", "staff"].includes(profile?.role) ||
                        activeTab === "profiles"
                      }
                      title={
                        !["admin", "staff"].includes(profile?.role)
                          ? "Admin/Staff access required"
                          : activeTab === "profiles"
                            ? "Admin access required"
                            : "Add New"
                      }
                    >
                      <Plus className="h-4.5 w-4.5" /> Add New
                    </button>
                  )}
                </div>

                {/* PHASES LIST */}
                {activeTab === "phases" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase text-xs">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Label</th>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Weeks</th>
                          <th className="py-3 px-4">Color</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phases.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-gray-100 hover:bg-gray-50/50"
                          >
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              {p.id}
                            </td>
                            <td className="py-3.5 px-4 text-gray-600">
                              {p.label}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-gray-800">
                              {p.title}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500">
                              {p.weeks}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className="inline-block h-6 w-12 rounded-lg border border-gray-200"
                                style={{ backgroundColor: p.color }}
                              />
                            </td>
                            <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    type: "phase",
                                    data: { ...p },
                                  })
                                }
                                className={`p-2 rounded-lg transition-colors ${["admin", "staff"].includes(profile?.role) ? "text-gray-400 hover:text-blue-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                disabled={
                                  !["admin", "staff"].includes(profile?.role)
                                }
                                title={
                                  !["admin", "staff"].includes(profile?.role)
                                    ? "Admin/Staff access required"
                                    : "Edit"
                                }
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <div className="group relative flex items-center">
                                <button
                                  onClick={() =>
                                    profile?.role === "admin" &&
                                    handleDelete("phase", p.id)
                                  }
                                  className={`p-2 rounded-lg transition-colors ${profile?.role === "admin" ? "text-gray-400 hover:text-red-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                  disabled={
                                    !["admin", "staff"].includes(profile?.role)
                                  }
                                  title={
                                    !["admin", "staff"].includes(profile?.role)
                                      ? "Admin/Staff access required"
                                      : "Delete"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* WEEKS LIST */}
                {activeTab === "weeks" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase text-xs">
                          <th className="py-3 px-4">ID</th>
                          <th className="">Phase</th>
                          <th className="">Week No</th>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Focus</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeks.map((w) => (
                          <tr
                            key={w.id}
                            className="border-b border-gray-100 hover:bg-gray-50/50"
                          >
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              {w.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                Phase {w.phaseNo}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-800">
                              Week {w.weekNo}
                            </td>
                            <td className="py-3.5 px-4 text-gray-700 font-medium">
                              {w.title}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                              {w.focus}
                            </td>
                            <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    type: "week",
                                    data: { ...w },
                                  })
                                }
                                className={`p-2 rounded-lg transition-colors ${["admin", "staff"].includes(profile?.role) ? "text-gray-400 hover:text-blue-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                disabled={
                                  !["admin", "staff"].includes(profile?.role)
                                }
                                title={
                                  !["admin", "staff"].includes(profile?.role)
                                    ? "Admin/Staff access required"
                                    : "Edit"
                                }
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <div className="group relative flex items-center">
                                <button
                                  onClick={() =>
                                    profile?.role === "admin" &&
                                    handleDelete("week", w.id)
                                  }
                                  className={`p-2 rounded-lg transition-colors ${profile?.role === "admin" ? "text-gray-400 hover:text-red-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                  disabled={
                                    !["admin", "staff"].includes(profile?.role)
                                  }
                                  title={
                                    !["admin", "staff"].includes(profile?.role)
                                      ? "Admin/Staff access required"
                                      : "Delete"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* LESSONS LIST */}
                {activeTab === "lessons" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase text-xs">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Week</th>
                          <th className="py-3 px-4">No</th>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Diff</th>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons
                          .slice()
                          .sort((a, b) => {
                            const wA =
                              weeks.find((w) => w.id === a.weekId)?.weekNo || 0;
                            const wB =
                              weeks.find((w) => w.id === b.weekId)?.weekNo || 0;
                            if (wA !== wB) return wA - wB;
                            return a.lessonNo - b.lessonNo;
                          })
                          .map((l) => {
                            const week = weeks.find((w) => w.id === l.weekId);
                            return (
                              <tr
                                key={l.id}
                                className="border-b border-gray-100 hover:bg-gray-50/50"
                              >
                                <td className="py-3.5 px-4 font-semibold text-gray-900">
                                  {l.id}
                                </td>
                                <td className="py-3.5 px-4 text-gray-500 font-medium">
                                  Week {week?.weekNo || "?"}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-gray-800">
                                  {l.lessonNo}
                                </td>
                                <td className="py-3.5 px-4 text-gray-700 font-semibold">
                                  {l.title}
                                </td>
                                <td className="py-3.5 px-4 text-xs font-bold uppercase text-gray-500">
                                  {l.difficulty}
                                </td>
                                <td className="py-3.5 px-4 text-gray-400">
                                  {l.estimatedMinutes}m
                                </td>
                                <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      setEditingItem({
                                        type: "lesson",
                                        data: { ...l },
                                      })
                                    }
                                    className={`p-2 rounded-lg transition-colors ${["admin", "staff"].includes(profile?.role) ? "text-gray-400 hover:text-blue-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                    disabled={
                                      !["admin", "staff"].includes(
                                        profile?.role,
                                      )
                                    }
                                    title={
                                      profile?.role !== "admin"
                                        ? "Admin access required"
                                        : "Edit"
                                    }
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <div className="group relative flex items-center">
                                    <button
                                      onClick={() =>
                                        profile?.role === "admin" &&
                                        handleDelete("lesson", l.id)
                                      }
                                      className={`p-2 rounded-lg transition-colors ${profile?.role === "admin" ? "text-gray-400 hover:text-red-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                      disabled={
                                        !["admin", "staff"].includes(
                                          profile?.role,
                                        )
                                      }
                                      title={
                                        !["admin", "staff"].includes(
                                          profile?.role,
                                        )
                                          ? "Admin/Staff access required"
                                          : "Delete"
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* EXPLANATIONS LIST */}
                {activeTab === "explanations" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lessons
                        .slice()
                        .sort((a, b) => {
                          const wA =
                            weeks.find((w) => w.id === a.weekId)?.weekNo || 0;
                          const wB =
                            weeks.find((w) => w.id === b.weekId)?.weekNo || 0;
                          if (wA !== wB) return wA - wB;
                          return a.lessonNo - b.lessonNo;
                        })
                        .map((l) => {
                          const week = weeks.find((w) => w.id === l.weekId);
                          const exp = explanations.find(
                            (e) => e.slug === l.slug,
                          );
                          return (
                            <div
                              key={l.id}
                              className="rounded-xl border border-gray-200 p-4 bg-white hover:border-blue-300 transition-all flex items-start justify-between gap-4"
                            >
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Week {week?.weekNo || "?"} - Lesson{" "}
                                  {l.lessonNo}
                                </span>
                                <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                                  {l.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                  {exp?.sections?.length || 0} explanations
                                  sections
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    type: "explanation",
                                    data: { ...exp, title: l.title },
                                  })
                                }
                                className={`flex items-center gap-1 text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${["admin", "staff"].includes(profile?.role) ? "text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100" : "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"}`}
                                disabled={
                                  !["admin", "staff"].includes(profile?.role)
                                }
                                title={
                                  !["admin", "staff"].includes(profile?.role)
                                    ? "Admin/Staff access required"
                                    : "Edit"
                                }
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* PROJECTS LIST */}
                {activeTab === "projects" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase text-xs">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Week</th>
                          <th className="py-3 px-4">Project Title</th>
                          <th className="py-3 px-4">Milestones</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekendProjects.map((wp) => {
                          const week = weeks.find((w) => w.id === wp.weekId);
                          const milestones = weekendProjectMilestones.filter(
                            (m) => m.weekendProjectId === wp.id,
                          );
                          return (
                            <tr
                              key={wp.id}
                              className="border-b border-gray-100 hover:bg-gray-50/50"
                            >
                              <td className="py-3.5 px-4 font-semibold text-gray-900">
                                {wp.id}
                              </td>
                              <td className="py-3.5 px-4 text-gray-500">
                                Week {week?.weekNo || "?"}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-gray-800">
                                {wp.title}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600">
                                <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                  {milestones.length} milestones
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    setEditingItem({
                                      type: "project",
                                      data: {
                                        ...wp,
                                        milestones: milestones
                                          .map((m) => m.title)
                                          .join("\n"),
                                      },
                                    })
                                  }
                                  className={`p-2 rounded-lg transition-colors ${["admin", "staff"].includes(profile?.role) ? "text-gray-400 hover:text-blue-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                  disabled={
                                    !["admin", "staff"].includes(profile?.role)
                                  }
                                  title={
                                    !["admin", "staff"].includes(profile?.role)
                                      ? "Admin/Staff access required"
                                      : "Edit"
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <div className="group relative flex items-center">
                                  <button
                                    onClick={() =>
                                      profile?.role === "admin" &&
                                      handleDelete("project", wp.id)
                                    }
                                    className={`p-2 rounded-lg transition-colors ${profile?.role === "admin" ? "text-gray-400 hover:text-red-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                    disabled={
                                      !["admin", "staff"].includes(
                                        profile?.role,
                                      )
                                    }
                                    title={
                                      !["admin", "staff"].includes(
                                        profile?.role,
                                      )
                                        ? "Admin/Staff access required"
                                        : "Delete"
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* MOCK INTERVIEWS LIST */}
                {activeTab === "mocks" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase text-xs">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Week</th>
                          <th className="py-3 px-4">Format</th>
                          <th className="py-3 px-4">Questions</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockInterviews.map((mi) => {
                          const week = weeks.find((w) => w.id === mi.weekId);
                          const questions = mockInterviewQuestions.filter(
                            (q) => q.mockInterviewId === mi.id,
                          );
                          return (
                            <tr
                              key={mi.id}
                              className="border-b border-gray-100 hover:bg-gray-50/50"
                            >
                              <td className="py-3.5 px-4 font-semibold text-gray-900">
                                {mi.id}
                              </td>
                              <td className="py-3.5 px-4 text-gray-500">
                                Week {week?.weekNo || "?"}
                              </td>
                              <td className="py-3.5 px-4 text-gray-700 font-medium">
                                {mi.format}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600">
                                <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
                                  {questions.length} questions
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    setEditingItem({
                                      type: "mock",
                                      data: {
                                        ...mi,
                                        questions: questions
                                          .map((q) => q.question)
                                          .join("\n"),
                                      },
                                    })
                                  }
                                  className={`p-2 rounded-lg transition-colors ${["admin", "staff"].includes(profile?.role) ? "text-gray-400 hover:text-blue-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                  disabled={
                                    !["admin", "staff"].includes(profile?.role)
                                  }
                                  title={
                                    !["admin", "staff"].includes(profile?.role)
                                      ? "Admin/Staff access required"
                                      : "Edit"
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <div className="group relative flex items-center">
                                  <button
                                    onClick={() =>
                                      profile?.role === "admin" &&
                                      handleDelete("mock", mi.id)
                                    }
                                    className={`p-2 rounded-lg transition-colors ${profile?.role === "admin" ? "text-gray-400 hover:text-red-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed opacity-60"}`}
                                    disabled={profile?.role !== "admin"}
                                    title={
                                      profile?.role !== "admin"
                                        ? "Admin access required"
                                        : "Delete"
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* PROFILES LIST */}
                {activeTab === "profiles" && (
                  <ProfilesTable
                    data={profilesData}
                    loading={profilesLoading}
                    onRoleChange={handleRoleChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfilesTable({ data, loading, onRoleChange }) {
  const { profile: currentUser, user } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

  console.log("currentUser", { currentUser, user, data });

  const columns = [
    {
      id: "index",
      header: "#",
      cell: (info) => (
        <span className="font-semibold text-gray-500">
          {info.row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: (info) => {
        const { firstName, lastName, fullName } = info.row.original;
        const displayName =
          fullName || [firstName, lastName].filter(Boolean).join(" ");
        return (
          <span className="font-bold text-gray-900">{displayName || "-"}</span>
        );
      },
    },
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: (info) => (
        <span className="font-medium text-gray-800">
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      cell: (info) => (
        <span className="font-medium text-gray-800">
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => (
        <span className="font-medium text-gray-800">
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span>Role</span>
          <select
            value={column.getFilterValue() ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-normal text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="user">User</option>
          </select>
        </div>
      ),
      cell: (info) => {
        const role = info.getValue();
        const roleColors = {
          admin: "bg-red-100 text-red-700",
          staff: "bg-purple-100 text-purple-700",
          user: "bg-blue-100 text-blue-700",
        };
        const color = roleColors[role] || "bg-gray-100 text-gray-700";
        return (
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${color} uppercase tracking-wider`}
          >
            {role || "user"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const user = info.row.original;
        const currentRole = user.role || "user";

        return (
          <div className="flex justify-end">
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(user.id, e.target.value)}
              disabled={!isAdmin}
              title={!isAdmin ? "Admin access required" : "Change role"}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm font-medium text-gray-500">
        Loading profiles...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm font-medium text-gray-500">
        No profiles found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold uppercase text-gray-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-150 pt-4">
        <div className="text-xs font-medium text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-900">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-gray-900">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              data.length,
            )}
          </span>{" "}
          of <span className="font-bold text-gray-900">{data.length}</span>{" "}
          results
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              Rows per page
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-gray-200 text-xs py-1 px-2 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              {[2, 5, 10, 15, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
              (pageIndex) => (
                <button
                  key={pageIndex}
                  onClick={() => table.setPageIndex(pageIndex)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    table.getState().pagination.pageIndex === pageIndex
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageIndex + 1}
                </button>
              ),
            )}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
