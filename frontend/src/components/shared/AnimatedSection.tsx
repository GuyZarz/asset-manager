import { useScrollAnimation, type ScrollAnimationOptions } from '@/hooks/useScrollAnimation';

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Animation options */
  animationOptions?: ScrollAnimationOptions;
  /** Use faster animation (for list items) */
  fast?: boolean;
  /** Component to render (default: 'div') */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wrapper component that adds scroll-triggered slide-up + fade animation
 *
 * @example
 * <AnimatedSection>
 *   <MyCard />
 * </AnimatedSection>
 *
 * @example
 * <AnimatedSection fast delay={100}>
 *   <ListItem />
 * </AnimatedSection>
 */
export function AnimatedSection({
  children,
  className = '',
  animationOptions,
  fast = false,
  as: Component = 'div',
  ...props
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation(animationOptions);

  const animationClass = fast
    ? `scroll-animate-fast ${isVisible ? 'scroll-animate-fast-visible' : ''}`
    : `scroll-animate ${isVisible ? 'scroll-animate-visible' : ''}`;

  return (
    <Component
      ref={ref}
      className={`${animationClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
