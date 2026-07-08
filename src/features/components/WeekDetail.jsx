import { useState } from "react";
import { AlertTriangle, CircleCheck } from "lucide-react";
import { phaseColors, weekTabs } from "../constants";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { DayRow } from "./DayRow";
import { Checkbox, CircleProgress, LinearProgress, StatusPill } from "./ui";

function DailyPlan({
  week,
  progress,
  completedDays,
  onToggleDay,
  activeExplanation,
  onOpenExplanation,
  onCloseExplanation,
  onNextExplanation,
}) {
  const { getWeekLessons } = useRoadmapData();
  const lessons = getWeekLessons(week.id);

  return (
    <div className="flex flex-col gap-2.5">
      {lessons.map((lesson, index) => (
        <DayRow
          key={lesson.id}
          lesson={lesson}
          weekNumber={week.weekNo}
          checked={!!progress[`w${week.weekNo}_d${index}`]}
          onCheck={(value) => onToggleDay(week.weekNo, index, value)}
          activeExplanation={activeExplanation}
          onOpenExplanation={onOpenExplanation}
          onCloseExplanation={onCloseExplanation}
          onNextExplanation={onNextExplanation}
        />
      ))}

      {completedDays === lessons.length ? (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3">
          <CircleCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-700">
            All 5 days complete - move on to the weekend project.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ProjectPlan({ week, projectDone, onToggleProject }) {
  const { getWeekendProject, getWeekendProjectMilestones } = useRoadmapData();
  const project = getWeekendProject(week.id);
  const milestones = project ? getWeekendProjectMilestones(project.id) : [];

  if (!project) return null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="mb-1 text-base font-semibold text-gray-900">
          {project.title}
        </h4>
        <p className="text-sm text-gray-600">
          {project.description}
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          Milestones
        </p>
        <div className="flex flex-col gap-1.5">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-start gap-2 py-1 text-sm text-gray-700"
            >
              <span className="mt-0.5 flex-shrink-0 text-gray-400">-</span>
              {milestone.title}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex w-fit items-center gap-3">
          <Checkbox
            checked={projectDone}
            onChange={(value) => onToggleProject(week.weekNo, value)}
            stopPropagation={false}
          />
          <span
            className={`text-sm font-medium transition-colors ${
              projectDone ? "text-gray-400 line-through" : "text-gray-700"
            }`}
          >
            Mark weekend project as complete
          </span>
        </div>
      </div>
    </div>
  );
}

function MockInterview({ week, mockDone, onToggleMock }) {
  const { getMockInterview, getMockInterviewQuestions } = useRoadmapData();
  const mockInterview = getMockInterview(week.id);
  const questions = mockInterview ? getMockInterviewQuestions(mockInterview.id) : [];

  if (!mockInterview) return null;

  return (
    <div className="flex flex-col gap-5">
      <StatusPill dot="#7C3AED">{mockInterview.format}</StatusPill>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          Practice Questions
        </p>
        <div className="flex flex-col gap-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600">
                  {index + 1}
                </span>
                <p className="text-sm italic text-gray-700">
                  "{question.question}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex w-fit items-center gap-3">
          <Checkbox
            checked={mockDone}
            onChange={(value) => onToggleMock(week.weekNo, value)}
            stopPropagation={false}
          />
          <span
            className={`text-sm font-medium transition-colors ${
              mockDone ? "text-gray-400 line-through" : "text-gray-700"
            }`}
          >
            Mark mock interview session as done
          </span>
        </div>
      </div>
    </div>
  );
}

function Checkpoint({ week }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Revision Checkpoint
        </p>
        <p className="text-sm leading-relaxed text-gray-800">
          {week.revisionCheckpoint}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          Do not skip this
        </p>
        <p className="text-sm text-amber-800">
          Pass this checkpoint <strong>without notes</strong> before moving to
          the next week. If you cannot, spend one more day reviewing.
        </p>
      </div>
    </div>
  );
}

export function WeekDetail({
  week,
  progress,
  onToggleDay,
  onToggleProject,
  onToggleMock,
  activeExplanation,
  onOpenExplanation,
  onCloseExplanation,
  onNextExplanation,
}) {
  const [activeTab, setActiveTab] = useState("daily");
  const { getCompletedDaysForWeek, getWeekLessons } = useRoadmapData();
  const colors = phaseColors[week.phaseNo];
  const completedDays = getCompletedDaysForWeek(week, progress);
  const lessonCount = getWeekLessons(week.id).length;
  const projectDone = !!progress[`w${week.weekNo}_project`];
  const mockDone = !!progress[`w${week.weekNo}_mock`];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              W{week.weekNo}
            </span>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {week.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">{week.focus}</p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Days done</p>
              <p className="text-sm font-semibold text-gray-900">
                {completedDays}/{lessonCount}
              </p>
            </div>
            <CircleProgress
              value={completedDays}
              max={lessonCount}
              color={colors.dot}
            />
          </div>
        </div>

        <div className="mt-3">
          <LinearProgress
            value={completedDays}
            max={lessonCount}
            color={colors.dot}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 px-6">
        {weekTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`mr-6 flex-shrink-0 border-b-2 py-3 text-sm transition-colors duration-150 focus-visible:outline-none ${
              activeTab === tab.id
                ? "-mb-[1px] border-blue-600 font-medium text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.id === "daily" && completedDays > 0 ? (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {completedDays}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "daily" ? (
          <DailyPlan
            week={week}
            progress={progress}
            completedDays={completedDays}
            onToggleDay={onToggleDay}
            activeExplanation={activeExplanation}
            onOpenExplanation={onOpenExplanation}
            onCloseExplanation={onCloseExplanation}
            onNextExplanation={onNextExplanation}
          />
        ) : null}

        {activeTab === "project" ? (
          <ProjectPlan
            week={week}
            projectDone={projectDone}
            onToggleProject={onToggleProject}
          />
        ) : null}

        {activeTab === "mock" ? (
          <MockInterview
            week={week}
            mockDone={mockDone}
            onToggleMock={onToggleMock}
          />
        ) : null}

        {activeTab === "checkpoint" ? <Checkpoint week={week} /> : null}
      </div>
    </div>
  );
}
