/**
 * Standard ItemCard UI component for displaying items in grid/list layouts.
 * Displays label, type badge, and metadata preview from raw data.
 * 
 * This is a pure UI component - parent components handle selection logic via onClick.
 */

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  onClick,
  className,
}) => {
  const typeColors: Record<string, string> = {
    node: "bg-blue-100 text-blue-800",
    edge: "bg-green-100 text-green-800",
    hyperedge: "bg-purple-100 text-purple-800",
    item: "bg-gray-100 text-gray-800",
  };

  const typeBorders: Record<string, string> = {
    node: "border-blue-300 hover:border-blue-500",
    edge: "border-green-300 hover:border-green-500",
    hyperedge: "border-purple-300 hover:border-purple-500",
    item: "border-gray-300 hover:border-gray-500",
  };

  // Extract metadata entries to display from raw data
  const displayEntries = useMemo(() => {
    if (!metadata) return [];
    
    const rawData = metadata.raw;
    
    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
      return Object.entries(rawData).slice(0, 2);
    }
    
    // Fallback: show other metadata fields
    return Object.entries(metadata)
      .filter(([key]) => !['raw', 'data'].includes(key))
      .slice(0, 2);
  }, [metadata]);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 transform hover:scale-105",
        "border-2",
        typeBorders[type],
        isSelected
          ? "shadow-lg ring-2 ring-offset-2 ring-primary"
          : "shadow hover:shadow-md",
        className
      )}
    >
      <div className="space-y-2">
        {/* Label */}
        <div className="font-semibold text-sm truncate text-foreground">{label}</div>

        {/* Type Badge */}
        <Badge variant="secondary" className={cn("inline-block text-xs", typeColors[type])}>
          {type}
        </Badge>

        {/* Metadata preview - show 2 key-value pairs from raw data */}
        {displayEntries.length > 0 && (
          <div className="text-xs text-muted-foreground pt-1 border-t border-border">
            <div className="space-y-1">
              {displayEntries.map(([key, value], idx) => (
                <div key={key} className="truncate">
                  <span className="font-semibold">{key}:</span>{" "}
                  {typeof value === "string"
                    ? value.length > 15 ? value.substring(0, 15) + "..." : value
                    : typeof value === "object"
                    ? JSON.stringify(value).substring(0, 15) + "..."
                    : String(value)}
                  {idx === 1 && displayEntries.length === 2 && metadata && Object.keys(metadata).length > 2 ? "..." : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ItemCard;
