import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { useRoadmapData } from "../hooks/useRoadmapData";
import { Checkbox } from "./ui";
import { ExplanationModal } from "./ExplanationModal";

export function DayRow({
  lesson,
  weekNumber,
  checked,
  onCheck,
  activeExplanation,
  onOpenExplanation,
  onCloseExplanation,
  onNextExplanation,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { explanations } = useRoadmapData();
  const lessonNo = lesson.lessonNo;
  const canShowExplanation = explanations.some(
    (exp) => exp.weekNo === Number(weekNumber) && exp.lessonNo === Number(lessonNo) && exp.sections?.length > 0
  );
  const isHighlighted =
    activeExplanation?.weekNumber === weekNumber &&
    activeExplanation?.lessonNo === lessonNo;

  return (
    <>
      {isHighlighted ? (
        <ExplanationModal
          lessonNo={lessonNo}
          weekNumber={weekNumber}
          onClose={onCloseExplanation}
          onNext={onNextExplanation}
        />
      ) : null}

      <div
        className={`overflow-hidden rounded-xl border transition-colors duration-150 ${
          checked ? "border-blue-200 bg-blue-50/40" : "border-gray-200 bg-white"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen((current) => !current);
            }
          }}
          className={`flex w-full cursor-pointer items-center justify-between px-5 py-3.5 transition-colors duration-150 hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset ${
            isHighlighted ? "bg-blue-950 hover:bg-blue-950" : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Checkbox checked={checked} onChange={onCheck} />
            <span
              className={`flex-shrink-0 text-sm font-semibold ${
                isHighlighted
                  ? "text-white"
                  : checked
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
              }`}
            >
              Lesson {lesson.lessonNo}
            </span>
            <span
              className={`hidden max-w-xs truncate text-sm sm:block ${
                isHighlighted
                  ? "text-blue-100"
                  : checked
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              {lesson.title}
            </span>
          </div>

          <ChevronDown
            className={`ml-3 h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
              isHighlighted ? "text-blue-100" : "text-gray-400"
            } ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

        {isOpen ? (
          <div
            className={`border-t px-5 py-4 ${
              isHighlighted ? "border-blue-900 bg-blue-950" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <p
                  className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                    isHighlighted ? "text-blue-200" : "text-gray-500"
                  }`}
                >
                  Topic
                </p>
                <p className={`text-sm ${isHighlighted ? "text-white" : "text-gray-700"}`}>
                  {lesson.title}
                </p>
              </div>
              <div>
                <p
                  className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                    isHighlighted ? "text-blue-200" : "text-gray-500"
                  }`}
                >
                  Coding Exercise
                </p>
                <p className={`text-sm ${isHighlighted ? "text-white" : "text-gray-700"}`}>
                  {lesson.exercise}
                </p>
              </div>
              <div>
                <p
                  className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                    isHighlighted ? "text-blue-200" : "text-gray-500"
                  }`}
                >
                  Interview Question
                </p>
                <p className={`text-sm italic ${isHighlighted ? "text-blue-100" : "text-gray-700"}`}>
                  "{lesson.interviewQuestion}"
                </p>
              </div>
            </div>

            {canShowExplanation ? (
              <div
                className={`mt-4 border-t pt-4 ${
                  isHighlighted ? "border-blue-900" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onOpenExplanation(weekNumber, lessonNo);
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1 ${
                    isHighlighted
                      ? "border border-blue-300 bg-blue-900 text-white hover:bg-blue-800"
                      : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Explanation
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
