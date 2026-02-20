import { formatCurrency, formatPercent } from "@/utils/formatters";

interface MoneyDisplayProps {
  value: number;
  gainLoss?: number;
  gainLossPercent?: number;
  currency?: string;
  abbreviated?: boolean;
  className?: string;
}

export function MoneyDisplay({
  value,
  gainLoss,
  gainLossPercent,
  currency = "USD",
  abbreviated = false,
  className = "",
}: MoneyDisplayProps) {
  const colorClass =
    gainLoss !== undefined
      ? gainLoss > 0
        ? "text-gain"
        : gainLoss < 0
          ? "text-loss"
          : "text-neutral"
      : "";

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      <span className="text-text-primary">
        {formatCurrency(value, currency, abbreviated)}
      </span>
      {gainLoss !== undefined && gainLossPercent !== undefined && (
        <span className={`ml-2 text-sm ${colorClass}`}>
          {gainLoss >= 0 ? "+" : ""}
          {formatCurrency(gainLoss, currency)} ({formatPercent(gainLossPercent)})
        </span>
      )}
    </span>
  );
}
