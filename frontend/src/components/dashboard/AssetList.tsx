import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Asset, AssetType } from "@/types/asset";
import { AssetTypeBadge } from "@/components/shared/AssetTypeBadge";
import { formatCurrency, formatPercent, getAssetDisplayName } from "@/utils/formatters";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSwipe } from "@/hooks/useSwipe";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";

type SortColumn = "name" | "type" | "price" | "value" | "gainLoss" | "gainLossPercent";
type SortDirection = "asc" | "desc";

interface AssetListProps {
  assets: Asset[];
  loading: boolean;
  onDelete: (id: number) => void;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
  onSort?: (column: SortColumn) => void;
}

const borderColors: Record<AssetType, string> = {
  Crypto: "#F59E0B",
  Stock: "#3B82F6",
  RealEstate: "#8B5CF6",
};

interface SortableHeaderProps {
  column: SortColumn;
  currentColumn?: SortColumn;
  currentDirection?: SortDirection;
  onSort?: (column: SortColumn) => void;
  children: React.ReactNode;
  align?: "left" | "right";
}

function SortableHeader({
  column,
  currentColumn,
  currentDirection,
  onSort,
  children,
  align = "left",
}: SortableHeaderProps) {
  const isActive = currentColumn === column;
  const isAsc = isActive && currentDirection === "asc";
  const isDesc = isActive && currentDirection === "desc";

  return (
    <th
      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        onClick={() => onSort?.(column)}
        className={`group inline-flex items-center gap-1 transition-colors ${
          isActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
        }`}
        disabled={!onSort}
      >
        <span>{children}</span>
        {onSort && (
          <span className="inline-flex flex-col text-xs leading-none">
            {isActive ? (
              <>
                {isAsc && <span className="text-accent">↑</span>}
                {isDesc && <span className="text-accent">↓</span>}
              </>
            ) : (
              <span className="text-text-muted/50 group-hover:text-text-muted">⇅</span>
            )}
          </span>
        )}
      </button>
    </th>
  );
}

interface MobileAssetCardProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

interface DesktopAssetRowProps {
  asset: Asset;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function DesktopAssetRow({ asset, index, onEdit, onDelete }: DesktopAssetRowProps) {
  const animation = useStaggeredAnimation(index, 40);

  return (
    <tr
      ref={animation.ref as React.RefObject<HTMLTableRowElement>}
      className={`border-l-4 transition hover:bg-surface-hover/30 scroll-animate-fast ${animation.isVisible ? 'scroll-animate-fast-visible' : ''}`}
      style={{ borderLeftColor: borderColors[asset.type] }}
    >
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-text-primary">{getAssetDisplayName(asset)}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <AssetTypeBadge type={asset.type} />
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-text-primary">
        {formatCurrency(asset.currentPrice)}
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-text-secondary">
        {asset.type === "Crypto"
          ? asset.quantity.toFixed(8)
          : asset.quantity}
      </td>
      <td className="px-6 py-4 text-right font-mono text-sm font-medium tabular-nums text-text-primary">
        {formatCurrency(asset.totalValue)}
      </td>
      <td
        className={`px-6 py-4 text-right font-mono text-sm tabular-nums ${
          asset.gainLoss > 0
            ? "text-gain"
            : asset.gainLoss < 0
              ? "text-loss"
              : "text-neutral"
        }`}
      >
        {formatPercent(asset.gainLossPercent)}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={onEdit}
            aria-label="Edit asset"
            title="Edit"
            className="group flex items-center justify-center rounded border border-accent/10 bg-accent/5 p-1.5 text-accent transition-all hover:border-accent/20 hover:bg-accent/10"
          >
            <svg className="h-3.5 w-3.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete asset"
            title="Delete"
            className="group flex items-center justify-center rounded border border-loss/10 bg-loss/5 p-1.5 text-loss transition-all hover:border-loss/20 hover:bg-loss/10"
          >
            <svg className="h-3.5 w-3.5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileAssetCard({ asset, onEdit, onDelete, index }: MobileAssetCardProps) {
  const { ref, isVisible } = useStaggeredAnimation(index, 50);
  const [swipedAction, setSwipedAction] = useState<"edit" | "delete" | null>(null);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => setSwipedAction("delete"),
    onSwipeRight: () => setSwipedAction("edit"),
  });

  const handleAction = (action: "edit" | "delete") => {
    if (action === "edit") {
      onEdit();
    } else {
      onDelete();
    }
    setSwipedAction(null);
  };

  return (
    <div
      ref={ref}
      className={`card-shadow card-shadow-hover relative overflow-hidden rounded-lg border border-border bg-surface-card scroll-animate-fast ${isVisible ? 'scroll-animate-fast-visible' : ''}`}
      style={{ borderLeftWidth: "4px", borderLeftColor: borderColors[asset.type] }}
      {...swipeHandlers}
    >
      {/* Background action buttons (revealed on swipe) */}
      {swipedAction && (
        <div
          className={`absolute inset-0 flex items-center justify-${swipedAction === "edit" ? "start" : "end"} px-6 ${
            swipedAction === "edit" ? "bg-accent/20" : "bg-loss/20"
          }`}
        >
          <button
            onClick={() => handleAction(swipedAction)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              swipedAction === "edit"
                ? "bg-accent text-white"
                : "bg-loss text-white"
            }`}
          >
            {swipedAction === "edit" ? "Edit" : "Delete"}
          </button>
        </div>
      )}

      {/* Card content */}
      <div
        className={`relative bg-surface-card p-4 transition-transform duration-200 ${
          swipedAction === "edit" ? "translate-x-20" : swipedAction === "delete" ? "-translate-x-20" : ""
        }`}
        onClick={() => swipedAction && setSwipedAction(null)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-text-primary">{getAssetDisplayName(asset)}</p>
            <div className="mt-1">
              <AssetTypeBadge type={asset.type} />
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-medium tabular-nums text-text-primary">
              {formatCurrency(asset.totalValue)}
            </p>
            <p
              className={`font-mono text-xs tabular-nums ${
                asset.gainLoss > 0
                  ? "text-gain"
                  : asset.gainLoss < 0
                    ? "text-loss"
                    : "text-neutral"
              }`}
            >
              {formatPercent(asset.gainLossPercent)}
            </p>
          </div>
        </div>

        {/* Action buttons (tap targets - always visible but less prominent) */}
        {!swipedAction && (
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={onEdit}
              aria-label="Edit asset"
              title="Edit"
              className="group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-accent/10 bg-accent/5 p-3 text-accent transition-all active:scale-95 active:bg-accent/15"
            >
              <svg className="h-5 w-5 transition-transform group-active:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete asset"
              title="Delete"
              className="group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-loss/10 bg-loss/5 p-3 text-loss transition-all active:scale-95 active:bg-loss/15"
            >
              <svg className="h-5 w-5 transition-transform group-active:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AssetList({
  assets,
  loading,
  onDelete,
  sortColumn,
  sortDirection,
  onSort,
}: AssetListProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <SkeletonLoader className="mb-3 h-12 w-full" count={5} />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="card-shadow rounded-xl border border-border bg-surface-card">
        <EmptyState onAction={() => navigate("/assets/new")} />
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface-card pb-24 md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <SortableHeader
                column="name"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
                onSort={onSort}
              >
                Asset
              </SortableHeader>
              <SortableHeader
                column="type"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
                onSort={onSort}
              >
                Type
              </SortableHeader>
              <SortableHeader
                column="price"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
                onSort={onSort}
                align="right"
              >
                Price
              </SortableHeader>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                Holdings
              </th>
              <SortableHeader
                column="value"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
                onSort={onSort}
                align="right"
              >
                Value
              </SortableHeader>
              <SortableHeader
                column="gainLossPercent"
                currentColumn={sortColumn}
                currentDirection={sortDirection}
                onSort={onSort}
                align="right"
              >
                Gain/Loss
              </SortableHeader>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assets.map((asset, index) => (
              <DesktopAssetRow
                key={asset.id}
                asset={asset}
                index={index}
                onEdit={() => navigate(`/assets/${asset.id}/edit`)}
                onDelete={() => onDelete(asset.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 pb-24 md:hidden">
        {assets.map((asset, index) => (
          <MobileAssetCard
            key={asset.id}
            asset={asset}
            index={index}
            onEdit={() => navigate(`/assets/${asset.id}/edit`)}
            onDelete={() => onDelete(asset.id)}
          />
        ))}
      </div>
    </>
  );
}
