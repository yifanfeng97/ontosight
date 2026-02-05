/**
 * Standard ItemCard UI component for displaying items in grid/list layouts.
 * Displays label, type badge, and metadata preview from raw data.
 * 
 * This is a pure UI component - parent components handle selection logic via onClick.
 */

import React, { useMemo } from "react";
import { cn, extractDisplayMetadata, formatMetadataValue } from "@/utils";
import { getCardStateClasses, UI_CARD_TYPE_COLORS, UI_CARD_TYPE_BORDERS } from "@/theme/visual-config";

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
  /** Additional CSS classes */
  className?: string;
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
  className,
}) => {
  // Extract metadata entries to display from raw data
  const displayEntries = useMemo(() => {
    return extractDisplayMetadata(metadata);
  }, [metadata]);

  // Get state classes from global visual config
  const stateClasses = getCardStateClasses(isSelected, isHighlighted);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 cursor-pointer transition-all duration-500 rounded-[1.5rem] bg-white/30 backdrop-blur-xl border border-white shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] hover:ring-black/[0.08] hover:bg-white/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden",
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

      <div className="relative z-10 space-y-3">
        {/* Label */}
        <div className="font-bold text-[15px] leading-tight truncate text-foreground group-hover:text-indigo-600 transition-colors">{label}</div>

        {/* Type Badge - unified indigo color, shown only if showTypeBadge is true */}
        {showTypeBadge && (
          <div className="flex">
            <span className="inline-block text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/10">
              {type}
            </span>
          </div>
        )}

        {/* Metadata preview - show 2 key-value pairs from raw data */}
        {displayEntries.length > 0 && (
          <div className="text-[11px] text-muted-foreground/80 pt-3 border-t border-black/[0.04] space-y-1.5">
            {displayEntries.map(([key, value], idx) => (
              <div key={key} className="truncate flex justify-between items-baseline gap-2">
                <span className="font-semibold opacity-50 uppercase text-[8px] tracking-wider">{key}</span>
                <span className="font-bold text-foreground/90 text-right flex-1 truncate">{formatMetadataValue(value)}</span>
              </div>
            ))}
            {displayEntries.length > 0 && metadata && Object.keys(metadata).length > displayEntries.length && (
              <div className="text-[9px] font-bold text-indigo-500/60 text-right pt-1 tracking-tighter">+{Object.keys(metadata).length - displayEntries.length} MORE</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
