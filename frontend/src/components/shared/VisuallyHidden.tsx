import { ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
}

/**
 * Component that hides content visually but keeps it accessible to screen readers
 * Useful for providing additional context that doesn't need to be displayed
 * but is important for accessibility
 *
 * @example
 * ```tsx
 * <VisuallyHidden>Gain</VisuallyHidden>
 * <span className="text-gain">+$1,234.56</span>
 * ```
 */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span
      className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
      style={{ clip: "rect(0, 0, 0, 0)" }}
    >
      {children}
    </span>
  );
}
