import { useCallback, useEffect, useState } from "react";
import {
  getPortfolioHistory,
  type PortfolioSnapshot,
} from "@/api/portfolio";

export function usePortfolioHistory(initialDays = 30) {
  const [data, setData] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(initialDays);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPortfolioHistory(days);
      setData(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, days, setDays, refresh: fetch };
}
