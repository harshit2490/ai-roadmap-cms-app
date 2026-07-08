import { Check } from "lucide-react";

function getPercent(value, max) {
  if (max === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / max) * 100)));
}

export function CircleProgress({ value, max, color, size = 52, fontSize = 11 }) {
  const center = size / 2;
  const radius = center - 6;
  const circumference = 2 * Math.PI * radius;
  const percent = getPercent(value, max);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#F3F4F6"
        strokeWidth="3"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center + 4}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="600"
        fill="#111827"
        fontFamily="Inter, sans-serif"
      >
        {percent}%
      </text>
    </svg>
  );
}

export function LinearProgress({ value, max, color }) {
  const percent = getPercent(value, max);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function StatusPill({ dot, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
      {dot ? (
        <span
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
        />
      ) : null}
      {children}
    </span>
  );
}

export function SoftPill({ children, color = "#2563EB" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {children}
    </span>
  );
}

export function Checkbox({ checked, onChange, stopPropagation = true }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        onChange(!checked);
      }}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
        checked
          ? "border-blue-600 bg-blue-600"
          : "border-gray-300 bg-white hover:border-blue-400"
      }`}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      aria-pressed={checked}
    >
      {checked ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  ariaLabel,
  className = "",
  size = "default",
}) {
  const trackSize =
    size === "compact" ? "h-5 w-9" : "h-6 w-11";
  const thumbSize =
    size === "compact"
      ? `h-4 w-4 ${checked ? "translate-x-[1.125rem]" : "translate-x-0.5"}`
      : `h-5 w-5 ${checked ? "translate-x-5" : "translate-x-0.5"}`;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${trackSize} ${className} ${
        checked ? "bg-gray-900" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ${thumbSize}`}
      />
    </button>
  );
}
