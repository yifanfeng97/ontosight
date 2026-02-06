/**
 * Standard ItemCard UI component for displaying items in grid/list layouts.
 * Displays label, type badge, and metadata preview from raw data.
 * 
 * This is a pure UI component - parent components handle selection logic via onClick.
 */

import React, { useMemo } from "react";
import { cn, extractDisplayMetadata, formatMetadataValue } from "@/utils";
import { 
  getCardStateClasses, 
  UI_CARD_TYPE_COLORS, 
  UI_CARD_TYPE_BORDERS,
  BACKDROP_BLUR_CONFIG 
} from "@/theme/visual-config";

export interface ItemCardProps {
  /** Unique item identifier */
  id: string;
  /** Display label */
  label: string;
  /** Item type for badge and styling */
  type: "node" | "edge" | "hyperedge" | "item";
  /** Metadata for preview display */
  metadata?: Record<string, any>;
  /** Whether item is currently selected */
  isSelected?: boolean;
  /** Whether item is highlighted from search results */
  isHighlighted?: boolean;
  /** Click handler for selection/deselection */
  onClick?: () => void;
  /** Whether to show the type badge */
  showTypeBadge?: boolean;
  /** Max metadata items to show (default 2, -1 for all) */
  maxMetadata?: number;
  /** Whether to truncate metadata values (default true) */
  shouldTruncate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom children to render at bottom */
  children?: React.ReactNode;
}

/**
 * ItemCard component - displays a card with label, type badge, and metadata preview.
 * 
 * @example
 * <ItemCard
 *   id="node_1"
 *   label="Alice"
 *   type="node"
 *   metadata={{ raw: { name: "Alice", age: 30 }, category: "person" }}
 *   isSelected={true}
 *   onClick={() => handleSelect("node_1")}
 * />
 */
const ItemCard: React.FC<ItemCardProps> = ({
  id,
  label,
  type,
  metadata,
  isSelected = false,
  isHighlighted = false,
  onClick,
  showTypeBadge = true,
  maxMetadata = 2,
  shouldTruncate = true,
  className,
  children,
}) => {
  // Extract metadata entries to display from raw data
  const displayEntries = useMemo(() => {
    return extractDisplayMetadata(metadata, maxMetadata);
  }, [metadata, maxMetadata]);

  // Get state classes from global visual config
  const stateClasses = getCardStateClasses(isSelected, isHighlighted);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 cursor-pointer transition-all duration-500 rounded-[1.5rem] bg-white/30 border border-white shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] hover:ring-black/[0.08] hover:bg-white/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden",
        BACKDROP_BLUR_CONFIG.STRONG,
        isSelected && "ring-2 ring-indigo-500/50 bg-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)]",
        isHighlighted && "ring-2 ring-amber-400/50 bg-amber-500/5",
        className
      )}
    >
      {/* Subtle Grain for the Card - extremely light */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.01] mix-blend-overlay group-hover:opacity-[0.03] transition-opacity duration-500"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className={cn("relative z-10", !shouldTruncate ? "space-y-4" : "space-y-3")}>
        {/* Label */}
        <div className={cn(
          "font-bold leading-tight truncate text-foreground group-hover:text-indigo-600 transition-colors",
          !shouldTruncate ? "text-base tracking-tight" : "text-[15px]"
        )}>
          {label}
        </div>

        {/* Type Badge - unified indigo color, shown only if showTypeBadge is true */}
        {showTypeBadge && (
          <div className={cn("flex", !shouldTruncate ? "pb-2" : "pb-1")}>
            <span className="inline-block text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/10">
              {type}
            </span>
          </div>
        )}

        {/* Metadata preview - show key-value pairs from raw data */}
        {displayEntries.length > 0 && (
          <div className={cn(
            "text-[11px] text-muted-foreground/80",
            !shouldTruncate ? "space-y-2.5" : "space-y-1.5"
          )}>
            {displayEntries.map(([key, value], idx) => (
              <div key={key} className={cn(
                "flex justify-between items-baseline gap-2",
                !shouldTruncate ? "flex-col items-stretch" : "truncate"
              )}>
                <span className="font-semibold opacity-50 uppercase text-[8px] tracking-wider">{key}</span>
                <span className={cn(
                  "font-bold text-foreground/90 flex-1",
                  shouldTruncate ? "text-right truncate" : "text-left break-words"
                )}>
                  {formatMetadataValue(value, 15, shouldTruncate)}
                </span>
              </div>
            ))}
            {shouldTruncate && displayEntries.length > 0 && metadata && Object.keys(metadata).length > displayEntries.length && (
              <div className="text-[9px] font-bold text-indigo-500/60 text-right pt-1 tracking-tighter">+{Object.keys(metadata).length - displayEntries.length} MORE</div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default ItemCard;
