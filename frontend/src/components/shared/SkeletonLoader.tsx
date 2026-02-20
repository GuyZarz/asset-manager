export function SkeletonLoader({
  className = "",
  count = 1,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded bg-surface-hover ${className}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
