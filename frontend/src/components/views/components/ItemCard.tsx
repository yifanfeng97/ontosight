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
  const typeBorderClasses = UI_CARD_TYPE_BORDERS[type];
  const typeColorClasses = UI_CARD_TYPE_COLORS[type];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 rounded-lg border-2 bg-card",
        typeBorderClasses,
        stateClasses,
        className
      )}
    >
      <div className="space-y-2">
        {/* Label */}
        <div className="font-semibold text-sm truncate text-foreground">{label}</div>

        {/* Type Badge */}
        <span className={cn("inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold bg-secondary text-secondary-foreground", typeColorClasses)}>
          {type}
        </span>

        {/* Metadata preview - show 2 key-value pairs from raw data */}
        {displayEntries.length > 0 && (
          <div className="text-xs text-muted-foreground pt-1 border-t border-border">
            <div className="space-y-1">
              {displayEntries.map(([key, value], idx) => (
                <div key={key} className="truncate">
                  <span className="font-semibold">{key}:</span>{" "}
                  {formatMetadataValue(value)}
                  {idx === 1 && displayEntries.length === 2 && metadata && Object.keys(metadata).length > 2 ? "..." : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
