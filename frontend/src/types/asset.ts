export type AssetType = "Crypto" | "Stock" | "RealEstate";
export type PropertyType = "House" | "Apartment" | "Commercial" | "Land";

export interface CryptoDetails {
  symbol: string;
  network?: string | null;
  walletAddress?: string | null;
  exchange?: string | null;
  staking: boolean;
}

export interface StockDetails {
  symbol: string;
  exchange?: string | null;
  sector?: string | null;
  dividendYield: number;
}

export interface RealEstateDetails {
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode?: string | null;
  country?: string | null;
  purchasePrice: number;
  currentValue: number;
  mortgageBalance: number;
  monthlyRent: number;
  monthlyExpenses: number;
  squareFeet?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  yearBuilt?: number | null;
}

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currency: string;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  cryptoDetails?: CryptoDetails | null;
  stockDetails?: StockDetails | null;
  realEstateDetails?: RealEstateDetails | null;
}

export interface AssetListResponse {
  items: Asset[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
