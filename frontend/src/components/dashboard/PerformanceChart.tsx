import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { formatCurrency } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { daysBetween, getYearToDate } from "@/utils/dateHelpers";

const RANGE_OPTIONS = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "YTD", days: "ytd" as const },
  { label: "All", days: 9999 }, // Max value to fetch all history
] as const;

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PerformanceChart() {
  // Get initial days from localStorage or default to 30
  const getInitialDays = (): number => {
    const stored = localStorage.getItem('chart-period');
    if (stored === 'ytd') {
      const ytdStart = getYearToDate();
      return daysBetween(ytdStart, new Date());
    }
    return stored ? Number(stored) : 30;
  };

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    return localStorage.getItem('chart-period') || '1M';
  });

  const { data, loading, days, setDays } = usePortfolioHistory(getInitialDays());

  // Handle period selection
  const handlePeriodChange = (option: typeof RANGE_OPTIONS[number]) => {
    setSelectedPeriod(option.label);
    localStorage.setItem('chart-period', option.label);

    if (option.days === 'ytd') {
      const ytdStart = getYearToDate();
      const daysFromYtd = daysBetween(ytdStart, new Date());
      setDays(daysFromYtd);
    } else {
      setDays(option.days as number);
    }
  };

  if (loading) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <SkeletonLoader className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <h3 className="mb-2 font-semibold text-text-primary">
          Portfolio Performance
        </h3>
        <p className="text-sm text-text-muted">
          No history yet. Check back tomorrow for your first data point.
        </p>
      </div>
    );
  }

  return (
    <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">
          Portfolio Performance
        </h3>
        <div className="inline-flex rounded-lg bg-surface-hover p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handlePeriodChange(opt)}
              aria-pressed={selectedPeriod === opt.label}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                selectedPeriod === opt.label
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrency(v, "USD", true)}
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text-primary)",
              fontSize: "13px",
            }}
            labelFormatter={(label) => formatDateLabel(String(label))}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any) => [formatCurrency(Number(value) || 0, "USD"), "Value"]) as never}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill="url(#valueGradient)"
            animationDuration={750}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
