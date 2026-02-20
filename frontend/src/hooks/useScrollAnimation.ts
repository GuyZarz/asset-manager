import { useEffect, useRef, useState } from 'react';

export interface ScrollAnimationOptions {
  /** Threshold percentage of visibility before triggering (0-1) */
  threshold?: number;
  /** Root margin for early/late triggering (e.g., "0px 0px -100px 0px") */
  rootMargin?: string;
  /** Only trigger animation once */
  triggerOnce?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
}

/**
 * Hook for scroll-triggered animations using Intersection Observer
 * Elements fade in and slide up when they enter the viewport
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, show immediately
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply delay if specified
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }

          // Disconnect if triggerOnce is true
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, delay]);

  return { ref, isVisible };
}

/**
 * Hook for staggered animations in lists
 * Returns a ref and visibility state for each item with incremental delay
 */
export function useStaggeredAnimation(index: number, baseDelay = 50) {
  return useScrollAnimation({
    delay: index * baseDelay,
    triggerOnce: true,
    threshold: 0.1,
  });
}
