import { formatCurrency, formatPercent } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Sparkline } from "@/components/shared/Sparkline";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { VisuallyHidden } from "@/components/shared/VisuallyHidden";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

interface PortfolioHeroProps {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  currency?: string;
  loading: boolean;
}

export function PortfolioHero({
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  currency = "USD",
  loading,
}: PortfolioHeroProps) {
  // Fetch 7-day history for sparkline
  const { data: historyData, loading: historyLoading } = usePortfolioHistory(7);

  // Calculate 24h change
  const dayChange = historyData.length >= 2
    ? totalValue - historyData[historyData.length - 2].totalValue
    : 0;
  const dayChangePercent = historyData.length >= 2 && historyData[historyData.length - 2].totalValue !== 0
    ? (dayChange / historyData[historyData.length - 2].totalValue) * 100
    : 0;

  // Prepare sparkline data (last 7 days of portfolio values)
  const sparklineData = historyData.map(d => d.totalValue);

  if (loading) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <SkeletonLoader className="mb-2 h-4 w-32" />
        <SkeletonLoader className="mb-2 h-12 w-72" />
        <SkeletonLoader className="h-5 w-48" />
      </div>
    );
  }

  const isPositive = totalGainLoss >= 0;
  const isDayPositive = dayChange >= 0;

  return (
    <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary">Total Portfolio Value</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-text-primary">
            <AnimatedNumber
              value={totalValue}
              formatFn={(n) => formatCurrency(n, currency)}
              duration={750}
            />
          </p>
          <div className="mt-2 flex items-center gap-4">
            <p className={`font-mono text-sm tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
              <VisuallyHidden>{isPositive ? "Gain" : "Loss"}:</VisuallyHidden>
              {isPositive ? "+" : ""}
              <AnimatedNumber
                value={totalGainLoss}
                formatFn={(n) => formatCurrency(n, currency)}
                duration={750}
              />
              {" "}({formatPercent(totalGainLossPercent)})
            </p>
            {historyData.length >= 2 && (
              <p className={`font-mono text-xs tabular-nums ${isDayPositive ? "text-gain" : "text-loss"}`}>
                <VisuallyHidden>24 hour change, {isDayPositive ? "gain" : "loss"}:</VisuallyHidden>
                24h: {isDayPositive ? "+" : ""}
                {formatCurrency(dayChange, currency)} ({isDayPositive ? "+" : ""}{dayChangePercent.toFixed(2)}%)
              </p>
            )}
          </div>
        </div>
        {sparklineData.length > 0 && (
          <Sparkline data={sparklineData} width={120} height={48} className="ml-4" />
        )}
      </div>
    </div>
  );
}
