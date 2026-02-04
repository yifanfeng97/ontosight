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
        "p-3 cursor-pointer transition-all duration-300 rounded-lg bg-background/40 backdrop-blur-md border border-border/40 hover:border-border/70 hover:bg-background/55 hover:shadow-xl hover:-translate-y-1",
        isSelected && "ring-2 ring-indigo-500 ring-offset-2 bg-background/60",
        isHighlighted && "ring-2 ring-amber-400 ring-offset-2 bg-amber-500/15",
        className
      )}
    >
      <div className="space-y-2">
        {/* Label */}
        <div className="font-semibold text-sm truncate text-foreground">{label}</div>

        {/* Type Badge - unified indigo color */}
        <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          {type}
        </span>

        {/* Metadata preview - show 2 key-value pairs from raw data */}
        {displayEntries.length > 0 && (
          <div className="text-xs text-muted-foreground pt-1.5 border-t border-border/30 space-y-0.5">
            {displayEntries.map(([key, value], idx) => (
              <div key={key} className="truncate flex justify-between gap-2">
                <span className="font-medium text-muted-foreground">{key}:</span>
                <span className="font-semibold text-foreground text-right flex-1 truncate">{formatMetadataValue(value)}</span>
              </div>
            ))}
            {displayEntries.length > 0 && metadata && Object.keys(metadata).length > displayEntries.length && (
              <div className="text-muted-foreground text-right text-xs opacity-60">+{Object.keys(metadata).length - displayEntries.length} more</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
