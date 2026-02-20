import type { AssetType } from "@/types/asset";

const typeConfig: Record<AssetType, { label: string; className: string }> = {
  Crypto: { label: "Crypto", className: "bg-crypto/10 text-crypto" },
  Stock: { label: "Stock", className: "bg-stock/10 text-stock" },
  RealEstate: {
    label: "Real Estate",
    className: "bg-real-estate/10 text-real-estate",
  },
};

export function AssetTypeBadge({ type }: { type: AssetType }) {
  const config = typeConfig[type];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
