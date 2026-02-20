import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook that triggers page transition animations on route changes
 * Returns a ref to attach to the page container element
 */
export function usePageTransition() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove animation class
    container.classList.remove("page-transition");

    // Force reflow to restart animation
    void container.offsetHeight;

    // Add animation class back
    requestAnimationFrame(() => {
      container.classList.add("page-transition");
    });
  }, [location.pathname]);

  return containerRef;
}
