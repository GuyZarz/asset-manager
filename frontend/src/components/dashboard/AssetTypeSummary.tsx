import type { Asset, AssetType } from "@/types/asset";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

const typeConfig: Record<AssetType, { label: string; color: string }> = {
  Crypto: { label: "Crypto", color: "#F59E0B" },
  Stock: { label: "Stocks", color: "#3B82F6" },
  RealEstate: { label: "Real Estate", color: "#8B5CF6" },
};

interface AssetTypeSummaryProps {
  assets: Asset[];
  loading: boolean;
}

export function AssetTypeSummary({ assets, loading }: AssetTypeSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SkeletonLoader className="h-24" count={3} />
      </div>
    );
  }

  const types: AssetType[] = ["Crypto", "Stock", "RealEstate"];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {types.map((type) => {
        const config = typeConfig[type];
        const typeAssets = assets.filter((a) => a.type === type);
        const totalValue = typeAssets.reduce((s, a) => s + a.totalValue, 0);
        const totalCost = typeAssets.reduce((s, a) => s + a.totalCost, 0);
        const gainLossPercent =
          totalCost !== 0
            ? ((totalValue - totalCost) / totalCost) * 100
            : 0;

        return (
          <div
            key={type}
            className="card-shadow rounded-lg border-l-4 border border-border bg-surface-card p-4"
            style={{ borderLeftColor: config.color }}
          >
            <p className="text-sm font-medium text-text-secondary">{config.label}</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-text-primary">
              {formatCurrency(totalValue, "USD", true)}
            </p>
            <p
              className={`mt-0.5 font-mono text-xs tabular-nums ${
                gainLossPercent > 0
                  ? "text-gain"
                  : gainLossPercent < 0
                    ? "text-loss"
                    : "text-neutral"
              }`}
            >
              {formatPercent(gainLossPercent)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
