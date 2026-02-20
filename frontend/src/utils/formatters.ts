export function formatCurrency(
  value: number,
  currency: string = "USD",
  abbreviated = false
): string {
  // Get currency symbol for abbreviated format
  const getCurrencySymbol = (curr: string): string => {
    switch (curr.toUpperCase()) {
      case "USD":
        return "$";
      case "ILS":
      case "NIS":
        return "₪";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "CAD":
        return "C$";
      default:
        return "$";
    }
  };

  if (abbreviated) {
    const symbol = getCurrencySymbol(currency);
    if (Math.abs(value) >= 1_000_000_000)
      return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(value) >= 1_000_000)
      return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000)
      return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }

  // Normalize currency codes
  const normalizedCurrency =
    currency.toUpperCase() === "NIS" ? "ILS" : currency.toUpperCase();

  // Get appropriate locale for currency
  const getLocale = (curr: string): string => {
    switch (curr) {
      case "ILS":
        return "he-IL";
      case "EUR":
        return "de-DE";
      case "GBP":
        return "en-GB";
      case "CAD":
        return "en-CA";
      default:
        return "en-US";
    }
  };

  return new Intl.NumberFormat(getLocale(normalizedCurrency), {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCryptoQuantity(value: number): string {
  return value.toFixed(8);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  const arrow = value > 0 ? "\u25B2" : value < 0 ? "\u25BC" : "";
  return `${arrow} ${sign}${value.toFixed(2)}%`;
}

export function formatGainLoss(value: number, currency: string = "USD"): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatCurrency(value, currency)}`;
}

export function getAssetDisplayName(asset: {
  name: string;
  cryptoDetails?: { symbol: string } | null;
  stockDetails?: { symbol: string } | null;
}): string {
  // For crypto and stocks, use the uppercase symbol
  if (asset.cryptoDetails) return asset.cryptoDetails.symbol.toUpperCase();
  if (asset.stockDetails) return asset.stockDetails.symbol.toUpperCase();
  // For real estate or other assets, use the name
  return asset.name;
}
