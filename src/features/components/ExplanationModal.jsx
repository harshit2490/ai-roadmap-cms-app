import { useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useRoadmapData } from "../hooks/useRoadmapData";

const bulletPrefixPattern = /^(?:\u2022|\u00e2\u20ac\u00a2)\s*/;

function renderRichLine(line, index) {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  const isBullet = bulletPrefixPattern.test(trimmedLine);
  const text = trimmedLine.replace(bulletPrefixPattern, "");
  const parts = text.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });

  return (
    <p
      key={index}
      className={`text-sm leading-relaxed text-gray-700 ${
        index > 0 ? "mt-2" : ""
      } ${isBullet ? "pl-2" : ""}`}
    >
      {isBullet ? <span className="mr-2 text-gray-400">-</span> : null}
      {parts}
    </p>
  );
}

function ExplanationBody({ sections }) {
  return (
    <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto px-6 py-5">
      {sections.map((section, sectionIndex) => (
        <div key={section.heading}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {sectionIndex + 1}
            </span>
            <h3 className="text-sm font-semibold text-gray-900">
              {section.heading}
            </h3>
          </div>

          <div className="pl-8">
            {section.body.split("\n").map(renderRichLine)}

            {section.example ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Example
                </p>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-blue-900">
                  {section.example}
                </pre>
              </div>
            ) : null}
          </div>

          {sectionIndex < sections.length - 1 ? (
            <div className="mt-5 border-t border-gray-100" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ExplanationModal({ lessonNo, weekNumber, onClose, onNext }) {
  const { explanations, getWeekByWeekNo } = useRoadmapData();

  const data = useMemo(
    () =>
      explanations.find(
        (exp) =>
          exp.weekNo === Number(weekNumber) &&
          exp.lessonNo === Number(lessonNo),
      ) ?? null,
    [explanations, weekNumber, lessonNo],
  );

  const currentIndex = useMemo(
    () =>
      explanations.findIndex(
        (exp) =>
          exp.weekNo === Number(weekNumber) &&
          exp.lessonNo === Number(lessonNo),
      ),
    [explanations, weekNumber, lessonNo],
  );

  const nextData = currentIndex >= 0 && currentIndex < explanations.length - 1
    ? explanations[currentIndex + 1]
    : null;

  const previousData = currentIndex > 0
    ? explanations[currentIndex - 1]
    : null;

  const week = getWeekByWeekNo(weekNumber);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!data || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 pb-4 pt-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Phase {data.phaseNo ?? week?.phaseNo ?? "?"} - Week{" "}
                {data.weekNo} - Lesson {data.lessonNo}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              {data.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-150 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Close explanation"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <ExplanationBody sections={data.sections} />

        <div className="flex justify-center gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (previousData && onNext) {
                onNext(previousData.weekNo, previousData.lessonNo);
              }
            }}
            disabled={!previousData}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={() => {
              if (nextData && onNext) {
                onNext(nextData.weekNo, nextData.lessonNo);
                return;
              }

              onClose();
            }}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
