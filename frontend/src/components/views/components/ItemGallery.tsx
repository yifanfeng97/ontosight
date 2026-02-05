import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import ItemCard, { ItemCardProps } from "./ItemCard";
import { cn } from "@/utils";

export interface ItemGalleryProps {
  /** Array of items to display */
  items: any[];
  /** Item type for ItemCard rendering */
  itemType: "node" | "edge" | "hyperedge" | "item";
  /** Whether data is loading */
  loading?: boolean;
  /** Error message if loading failed */
  error?: string | null;
  /** Loading message */
  loadingMessage?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Grid column classes */
  gridClassName?: string;
  /** Container height for empty/loading states */
  minHeight?: string;
  /** Selected items set for styling - can be Map or Set */
  selectedItems?: Map<string, any> | Set<string>;
  /** Click handler for item selection */
  onItemClick?: (id: string) => void;
  /** Custom render function for each item (overrides default ItemCard rendering) */
  renderItem?: (item: any, index: number) => React.ReactNode;
}

/**
 * ItemGallery - Beautiful gallery container for displaying items in a grid layout
 * 
 * Combines grid layout, state management (Loading/Error/Empty), and automatic ItemCard rendering.
 * Perfect for displaying collections of nodes, edges, hyperedges, or items in a visual gallery format.
 * 
 * @example
 * <ItemGallery
 *   items={nodes}
 *   itemType="node"
 *   selectedItems={selectedItems}
 *   onItemClick={selectItem}
 *   loading={isLoading}
 *   emptyMessage="No nodes found"
 * />
 */
const ItemGallery: React.FC<ItemGalleryProps> = ({
  items,
  itemType,
  loading = false,
  error = null,
  loadingMessage = "Loading...",
  emptyMessage = "No items found",
  gridClassName = "grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-max",
  minHeight = "h-96",
  selectedItems = new Set(),
  onItemClick,
  renderItem,
}) => {
  const isEmpty = items.length === 0;

  // Error state
  if (error) {
    return (
      <div className={cn("flex items-center justify-center w-full", minHeight)}>
        <div className="max-w-md p-6 rounded-lg border border-destructive/50 bg-destructive/10">
          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (when no items yet)
  if (loading && isEmpty) {
    return (
      <div className={cn("flex items-center justify-center w-full", minHeight)}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty && !loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full text-muted-foreground",
          minHeight
        )}
      >
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Gallery display
  return (
    <div className={gridClassName}>
      {items.map((item, index) => {
        // Use custom render function if provided
        if (renderItem) {
          return <React.Fragment key={item.id || index}>{renderItem(item, index)}</React.Fragment>;
        }

        // Default ItemCard rendering
        const itemId = item.id;
        const label = item.label || "Unknown";
        const isHighlighted = item.highlighted === true;
        
        // Handle both Map and Set for selectedItems
        const isSelected = selectedItems instanceof Map 
          ? selectedItems.has(itemId)
          : selectedItems instanceof Set
          ? selectedItems.has(itemId)
          : false;

        return (
          <ItemCard
            key={itemId}
            id={itemId}
            label={label}
            type={itemType}
            metadata={item}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            onClick={() => onItemClick?.(itemId)}
          />
        );
      })}
    </div>
  );
};

export default ItemGallery;
