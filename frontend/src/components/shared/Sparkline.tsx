import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, width = 100, height = 24, className = "" }: SparklineProps) {
  // Determine color based on trend (first vs last value)
  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0];
  const color = isPositive ? "var(--color-gain)" : "var(--color-loss)";

  // Transform data into format Recharts expects
  const chartData = data.map((value, index) => ({ index, value }));

  if (data.length === 0) return null;

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            animationDuration={500}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
