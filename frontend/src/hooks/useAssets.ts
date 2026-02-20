import { useCallback, useEffect, useState } from "react";
import { listAssets, deleteAsset as apiDeleteAsset } from "@/api/assets";
import type { Asset, AssetListResponse, AssetType } from "@/types/asset";

interface UseAssetsOptions {
  type?: AssetType;
  sort?: string;
}

export function useAssets(options: UseAssetsOptions = {}) {
  const [data, setData] = useState<AssetListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAssets({
        type: options.type,
        sort: options.sort,
        pageSize: 100,
      });
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [options.type, options.sort]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const deleteAsset = async (id: number) => {
    await apiDeleteAsset(id);
    await fetch();
  };

  const assets: Asset[] = data?.items ?? [];

  const totalValue = assets.reduce((sum, a) => sum + a.totalValue, 0);
  const totalCost = assets.reduce((sum, a) => sum + a.totalCost, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent =
    totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    assets,
    loading,
    error,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    refresh: fetch,
    deleteAsset,
  };
}
