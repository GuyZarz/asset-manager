import { apiFetch } from "./client";
import type { Asset, AssetListResponse, AssetType } from "@/types/asset";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface ListParams {
  type?: AssetType;
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export function listAssets(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set("type", params.type);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const qs = searchParams.toString();
  return apiFetch<ApiResponse<AssetListResponse>>(
    `/assets${qs ? `?${qs}` : ""}`
  );
}

export function getAsset(id: number) {
  return apiFetch<ApiResponse<Asset>>(`/assets/${id}`);
}

export function createAsset(data: Record<string, unknown>) {
  return apiFetch<ApiResponse<Asset>>("/assets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAsset(id: number, data: Record<string, unknown>) {
  return apiFetch<ApiResponse<Asset>>(`/assets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAsset(id: number) {
  return apiFetch<{ success: boolean }>(`/assets/${id}`, {
    method: "DELETE",
  });
}

export interface SymbolValidation {
  valid: boolean;
  name?: string;
  currentPrice?: number;
  currency?: string;
  exchange?: string;
}

export function validateSymbol(
  type: AssetType,
  symbol: string,
  exchange?: string
) {
  return apiFetch<ApiResponse<SymbolValidation>>("/assets/validate-symbol", {
    method: "POST",
    body: JSON.stringify({ type, symbol, exchange }),
  });
}
