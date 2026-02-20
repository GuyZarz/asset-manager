import { useState, ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

/**
 * Tooltip component that displays helpful information on hover/focus
 *
 * @example
 * ```tsx
 * <Tooltip content="The price you paid per unit">
 *   <InfoIcon />
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="ml-1 inline-flex items-center text-text-muted transition hover:text-text-secondary focus:text-text-secondary"
        aria-label={content}
      >
        {children}
      </button>
      {isVisible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg border border-border bg-surface-card px-3 py-2 text-xs text-text-primary shadow-lg"
        >
          {content}
          {/* Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="border-4 border-transparent border-t-surface-card" style={{ marginTop: '-1px' }}></div>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 border-4 border-transparent border-t-border"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Info icon for use with Tooltip
 */
export function InfoIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
