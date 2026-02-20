import { useCallback } from 'react';

export interface ScrollToOptions {
  /** Element to scroll to (CSS selector, element, or element ID) */
  target: string | HTMLElement;
  /** Offset from top in pixels (useful for sticky headers) */
  offset?: number;
  /** Behavior override (auto/smooth) */
  behavior?: ScrollBehavior;
}

/**
 * Hook for smooth scrolling to elements
 * Respects user's prefers-reduced-motion preference
 */
export function useSmoothScroll() {
  const scrollTo = useCallback((options: ScrollToOptions) => {
    const { target, offset = 0, behavior = 'smooth' } = options;

    // Get the target element
    let element: HTMLElement | null = null;

    if (typeof target === 'string') {
      // If target starts with #, treat as ID
      if (target.startsWith('#')) {
        element = document.getElementById(target.slice(1));
      } else {
        // Otherwise, treat as CSS selector
        element = document.querySelector(target);
      }
    } else {
      element = target;
    }

    if (!element) {
      console.warn(`Scroll target not found: ${target}`);
      return;
    }

    // Calculate scroll position
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: offsetPosition,
      behavior: prefersReducedMotion ? 'auto' : behavior,
    });
  }, []);

  const scrollToTop = useCallback(() => {
    scrollTo({ target: document.body, behavior: 'smooth' });
  }, [scrollTo]);

  return { scrollTo, scrollToTop };
}
