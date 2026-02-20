import { useState, ReactNode } from "react";

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Collapsible component for progressive disclosure of content
 *
 * @example
 * ```tsx
 * <Collapsible title="Advanced Options">
 *   <div>Optional fields...</div>
 * </Collapsible>
 * ```
 */
export function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-medium text-text-primary transition hover:text-accent focus:text-accent"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="text-lg text-text-muted" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
}
