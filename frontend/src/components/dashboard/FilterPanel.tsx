import type { AssetType } from "@/types/asset";

type PerformanceFilter = "all" | "gains" | "losses";

interface FilterPanelProps {
  selectedType: AssetType | "all";
  onTypeChange: (type: AssetType | "all") => void;
  selectedPerformance: PerformanceFilter;
  onPerformanceChange: (filter: PerformanceFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterPanel({
  selectedType,
  onTypeChange,
  selectedPerformance,
  onPerformanceChange,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  const typeFilters: Array<{ value: AssetType | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "Crypto", label: "Crypto" },
    { value: "Stock", label: "Stocks" },
    { value: "RealEstate", label: "Real Estate" },
  ];

  const performanceFilters: Array<{ value: PerformanceFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "gains", label: "Gains" },
    { value: "losses", label: "Losses" },
  ];

  return (
    <div className="space-y-4">
      {/* Asset Type Filters */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
          Asset Type
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onTypeChange(filter.value)}
              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all md:px-4 md:py-2 ${
                selectedType === filter.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface-hover text-text-secondary hover:bg-surface-hover/80 hover:text-text-primary"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Filters */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
          Performance
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {performanceFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onPerformanceChange(filter.value)}
              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all md:px-4 md:py-2 ${
                selectedPerformance === filter.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface-hover text-text-secondary hover:bg-surface-hover/80 hover:text-text-primary"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm font-medium text-accent hover:text-cyan-300"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
