import { useEffect, useState } from "react";
import type { Asset } from "@/types/asset";
import { formatCurrency, getAssetDisplayName } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

interface GainLossChartProps {
  assets: Asset[];
  loading: boolean;
}

export function GainLossChart({ assets, loading }: GainLossChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <SkeletonLoader className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (assets.length === 0) return null;

  const chartData = assets
    .map((a) => ({
      name: getAssetDisplayName(a),
      gainLoss: a.totalValue - a.totalCost,
      gainLossPercent:
        a.totalCost !== 0
          ? ((a.totalValue - a.totalCost) / a.totalCost) * 100
          : 0,
    }))
    .sort((a, b) => Math.abs(b.gainLoss) - Math.abs(a.gainLoss))
    .slice(0, 8); // Show top 8 by absolute value

  const maxAbsValue = Math.max(...chartData.map((d) => Math.abs(d.gainLoss)));

  return (
    <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
      <h3 className="mb-4 font-semibold text-text-primary">
        Gain / Loss by Asset
      </h3>

      <div className="space-y-3">
        {chartData.map((item, i) => {
          const isGain = item.gainLoss >= 0;
          const widthPercent = (Math.abs(item.gainLoss) / maxAbsValue) * 100;
          const sign = isGain ? "+" : "";

          return (
            <div
              key={i}
              className="group animate-in fade-in slide-in-from-left-4"
              style={{
                animationDelay: `${i * 50}ms`,
                animationDuration: "400ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="truncate font-medium text-text-primary">
                  {item.name}
                </span>
                <span
                  className={`ml-2 font-mono text-xs tabular-nums ${
                    isGain ? "text-gain" : "text-loss"
                  }`}
                >
                  {sign}
                  {formatCurrency(item.gainLoss)} ({sign}
                  {item.gainLossPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isGain ? "bg-gain" : "bg-loss"
                  }`}
                  style={{
                    width: animated ? `${widthPercent}%` : "0%",
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {assets.length > 8 && (
        <p className="mt-4 text-center text-xs text-text-muted">
          Showing top 8 assets by gain/loss magnitude
        </p>
      )}
    </div>
  );
}
