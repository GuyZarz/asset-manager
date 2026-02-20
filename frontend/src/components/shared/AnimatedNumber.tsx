import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  formatFn?: (n: number) => string;
  duration?: number;
}

/**
 * AnimatedNumber component that smoothly counts from old value to new value
 *
 * @example
 * ```tsx
 * <AnimatedNumber
 *   value={totalValue}
 *   formatFn={(n) => formatCurrency(n, "USD", true)}
 *   duration={750}
 * />
 * ```
 */
export function AnimatedNumber({
  value,
  formatFn = (n) => n.toFixed(2),
  duration = 750,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(value);

  useEffect(() => {
    // If value hasn't changed, don't animate
    if (value === displayValue) return;

    startValueRef.current = displayValue;
    startTimeRef.current = undefined;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic easing function
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = startValueRef.current + (value - startValueRef.current) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // Ensure final value is exact
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value, duration, displayValue]);

  return <>{formatFn(displayValue)}</>;
}
