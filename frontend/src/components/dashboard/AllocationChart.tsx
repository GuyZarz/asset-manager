import { useMemo, memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AssetType } from "@/types/asset";
import { formatCurrency } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

interface AllocationData {
  type: AssetType;
  value: number;
  allocationPercent: number;
}

const typeColors: Record<AssetType, string> = {
  Crypto: "var(--color-crypto)",
  Stock: "var(--color-stock)",
  RealEstate: "var(--color-real-estate)",
};

const typeLabels: Record<AssetType, string> = {
  Crypto: "Crypto",
  Stock: "Stocks",
  RealEstate: "Real Estate",
};

interface AllocationChartProps {
  data: AllocationData[];
  loading: boolean;
}

// Memoize tooltip formatter to prevent recreation on every render
const tooltipFormatter = (value: number, name: string) => [
  formatCurrency(value),
  name,
];

export const AllocationChart = memo(function AllocationChart({ data, loading }: AllocationChartProps) {
  // Memoize chart data transformation
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: typeLabels[d.type],
        value: d.value,
        percent: d.allocationPercent,
        color: typeColors[d.type],
      })),
    [data]
  );

  if (loading) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <SkeletonLoader className="mx-auto h-48 w-48 rounded-full" />
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
      <h3 className="mb-4 font-semibold text-text-primary">Allocation</h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-text-primary)",
                fontSize: "13px",
              }}
              formatter={tooltipFormatter as never}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.type} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: typeColors[d.type] }}
              />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {typeLabels[d.type]}
                </p>
                <p className="font-mono text-xs tabular-nums text-text-muted">
                  {formatCurrency(d.value, "USD", true)} ({d.allocationPercent}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
