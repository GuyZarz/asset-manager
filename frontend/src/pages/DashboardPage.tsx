import { useState, useMemo } from "react";
import { useAssets } from "@/hooks/useAssets";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/contexts/ToastContext";
import { usePageTransition } from "@/hooks/usePageTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { PortfolioHero } from "@/components/dashboard/PortfolioHero";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { AssetTypeSummary } from "@/components/dashboard/AssetTypeSummary";
import { AssetList } from "@/components/dashboard/AssetList";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GainLossChart } from "@/components/dashboard/GainLossChart";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import type { AssetType } from "@/types/asset";

type PerformanceFilter = "all" | "gains" | "losses";
type SortColumn = "name" | "type" | "price" | "value" | "gainLoss" | "gainLossPercent";
type SortDirection = "asc" | "desc";

export function DashboardPage() {
  const containerRef = usePageTransition();
  const { preferredCurrency } = useUserSettings();
  const {
    assets,
    loading,
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    deleteAsset,
  } = useAssets();
  const { addToast } = useToast();

  // Scroll animations for each section
  const heroAnimation = useScrollAnimation();
  const performanceAnimation = useScrollAnimation({ delay: 100 });
  const statsAnimation = useScrollAnimation({ delay: 150 });
  const chartsAnimation = useScrollAnimation({ delay: 200 });
  const summaryAnimation = useScrollAnimation({ delay: 250 });
  const assetsAnimation = useScrollAnimation({ delay: 300 });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter state
  const [selectedType, setSelectedType] = useState<AssetType | "all">("all");
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceFilter>("all");

  // Sort state (load from localStorage or default to value:desc)
  const [sortColumn, setSortColumn] = useState<SortColumn>(() => {
    const stored = localStorage.getItem("asset-sort-column");
    return (stored as SortColumn) || "value";
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const stored = localStorage.getItem("asset-sort-direction");
    return (stored as SortDirection) || "desc";
  });

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter((asset) => {
        // Search by name
        if (asset.name.toLowerCase().includes(query)) return true;

        // Search by symbol (crypto or stock)
        if (asset.cryptoDetails?.symbol.toLowerCase().includes(query)) return true;
        if (asset.stockDetails?.symbol.toLowerCase().includes(query)) return true;

        // Search by address (real estate)
        if (asset.realEstateDetails?.address.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    // Apply type filter
    if (selectedType !== "all") {
      result = result.filter((asset) => asset.type === selectedType);
    }

    // Apply performance filter
    if (selectedPerformance === "gains") {
      result = result.filter((asset) => asset.gainLoss > 0);
    } else if (selectedPerformance === "losses") {
      result = result.filter((asset) => asset.gainLoss < 0);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortColumn) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        case "price":
          aVal = a.currentPrice;
          bVal = b.currentPrice;
          break;
        case "value":
          aVal = a.totalValue;
          bVal = b.totalValue;
          break;
        case "gainLoss":
          aVal = a.gainLoss;
          bVal = b.gainLoss;
          break;
        case "gainLossPercent":
          aVal = a.gainLossPercent;
          bVal = b.gainLossPercent;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [assets, debouncedSearch, selectedType, selectedPerformance, sortColumn, sortDirection]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      await deleteAsset(id);
      addToast({
        type: "success",
        message: "Asset deleted successfully",
      });
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete asset",
      });
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
      localStorage.setItem("asset-sort-direction", newDirection);
    } else {
      // New column, default to descending
      setSortColumn(column);
      setSortDirection("desc");
      localStorage.setItem("asset-sort-column", column);
      localStorage.setItem("asset-sort-direction", "desc");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearFilters = () => {
    setSelectedType("all");
    setSelectedPerformance("all");
  };

  const hasActiveFilters = selectedType !== "all" || selectedPerformance !== "all";

  const types: AssetType[] = ["Crypto", "Stock", "RealEstate"];
  const allocationData = types
    .map((type) => {
      const typeAssets = assets.filter((a) => a.type === type);
      const value = typeAssets.reduce((s, a) => s + a.totalValue, 0);
      return {
        type,
        value,
        allocationPercent:
          totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      };
    })
    .filter((d) => d.value > 0);

  return (
    <div ref={containerRef} className="page-transition space-y-6">
      <h1 id="dashboard-top" className="text-2xl font-bold text-text-primary">Dashboard</h1>

      <section
        id="portfolio-overview"
        ref={heroAnimation.ref}
        className={`scroll-animate ${heroAnimation.isVisible ? 'scroll-animate-visible' : ''}`}
      >
        <PortfolioHero
          totalValue={totalValue}
          totalGainLoss={totalGainLoss}
          totalGainLossPercent={totalGainLossPercent}
          currency={preferredCurrency}
          loading={loading}
        />
      </section>

      <section
        id="performance"
        ref={performanceAnimation.ref}
        className={`scroll-animate ${performanceAnimation.isVisible ? 'scroll-animate-visible' : ''}`}
      >
        <PerformanceChart />
      </section>

      <section
        id="stats"
        ref={statsAnimation.ref}
        className={`scroll-animate ${statsAnimation.isVisible ? 'scroll-animate-visible' : ''}`}
      >
        <StatsRow
          assets={assets}
          totalGainLoss={totalGainLoss}
          loading={loading}
        />
      </section>

      <section
        id="charts"
        ref={chartsAnimation.ref}
        className={`grid gap-6 lg:grid-cols-2 scroll-animate ${chartsAnimation.isVisible ? 'scroll-animate-visible' : ''}`}
      >
        <AllocationChart data={allocationData} loading={loading} />
        <GainLossChart assets={assets} loading={loading} />
      </section>

      <section
        id="summary"
        ref={summaryAnimation.ref}
        className={`scroll-animate ${summaryAnimation.isVisible ? 'scroll-animate-visible' : ''}`}
      >
        <AssetTypeSummary assets={assets} loading={loading} />
      </section>

      <section
        id="assets"
        ref={assetsAnimation.ref}
        className={`scroll-animate ${assetsAnimation.isVisible ? 'scroll-animate-visible' : ''}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Assets</h2>
          {!loading && (
            <p className="text-sm text-text-muted">
              Showing {filteredAssets.length} of {assets.length} assets
            </p>
          )}
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={handleClearSearch}
            placeholder="Search by name, symbol, or address..."
          />
        </div>

        {/* Filter Panel */}
        <div className="mb-4">
          <FilterPanel
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedPerformance={selectedPerformance}
            onPerformanceChange={setSelectedPerformance}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Asset List */}
        <AssetList
          assets={filteredAssets}
          loading={loading}
          onDelete={handleDelete}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
