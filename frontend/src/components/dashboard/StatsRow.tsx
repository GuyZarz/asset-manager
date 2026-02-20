import { useMemo } from "react";
import type { Asset } from "@/types/asset";
import { formatCurrency, formatPercent, getAssetDisplayName } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

interface StatsRowProps {
  assets: Asset[];
  totalGainLoss: number;
  loading: boolean;
}

export function StatsRow({ assets, totalGainLoss, loading }: StatsRowProps) {
  const { best, worst } = useMemo(() => {
    if (assets.length === 0) return { best: null, worst: null };
    const sorted = [...assets].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    return { best: sorted[0], worst: sorted[sorted.length - 1] };
  }, [assets]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SkeletonLoader className="h-20" count={4} />
      </div>
    );
  }

  const stats = [
    {
      key: "total-assets",
      label: "Total Assets",
      value: String(assets.length),
    },
    {
      key: "total-gain-loss",
      label: "Total Gain / Loss",
      value: formatCurrency(totalGainLoss),
      colored: true,
      positive: totalGainLoss >= 0,
    },
    {
      key: "best-performer",
      label: (
        <>
          Best
          <br />
          Performer
        </>
      ),
      value: best ? getAssetDisplayName(best) : "—",
      sub: best ? formatPercent(best.gainLossPercent) : undefined,
      colored: true,
      positive: best ? best.gainLossPercent >= 0 : true,
    },
    {
      key: "worst-performer",
      label: (
        <>
          Worst
          <br />
          Performer
        </>
      ),
      value: worst ? getAssetDisplayName(worst) : "—",
      sub: worst ? formatPercent(worst.gainLossPercent) : undefined,
      colored: true,
      positive: worst ? worst.gainLossPercent >= 0 : true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="card-shadow rounded-lg border border-border bg-surface-card p-4 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {stat.label}
          </p>
          <p
            className={`mt-2 text-lg font-semibold ${
              stat.colored
                ? stat.positive
                  ? "text-gain"
                  : "text-loss"
                : "text-text-primary"
            }`}
          >
            {stat.value}
          </p>
          {stat.sub && (
            <p
              className={`mt-0.5 font-mono text-xs tabular-nums ${
                stat.positive ? "text-gain" : "text-loss"
              }`}
            >
              {stat.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
