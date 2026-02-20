import { apiFetch } from "./client";
import type { AssetType } from "@/types/asset";

export interface TypeBreakdown {
  type: AssetType;
  value: number;
  cost: number;
  gainLoss: number;
  gainLossPercent: number;
  allocationPercent: number;
  count: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  assetCount: number;
  displayCurrency: string;
  byType: TypeBreakdown[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export function getPortfolioSummary() {
  return apiFetch<ApiResponse<PortfolioSummary>>("/portfolio");
}

export function getPortfolioPerformance() {
  return apiFetch<
    ApiResponse<{
      totalGainLoss: number;
      totalGainLossPercent: number;
      allocation: TypeBreakdown[];
    }>
  >("/portfolio/performance");
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  cryptoValue: number;
  stockValue: number;
  realEstateValue: number;
  displayCurrency: string;
}

export function getPortfolioHistory(days = 30) {
  return apiFetch<ApiResponse<PortfolioSnapshot[]>>(
    `/portfolio/history?days=${days}`
  );
}
