import { memo, useState, useMemo } from "react";
import { ItemCard } from "@/components/ui";
import { useVisualization } from "@/hooks/useVisualization";

interface ListViewProps {
  data: any;
  meta: any;
}

const ListView = memo(function ListView({ data }: ListViewProps) {
  const { selectedItems, selectItem, deselectItem, resetTrigger } = useVisualization();

  // Shuffle items when reset is triggered
  const shuffledItems = useMemo(() => {
    if (!data.items || data.items.length === 0) return [];
    // Create a copy and shuffle it
    const items = [...data.items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [data.items, resetTrigger]);

  if (!shuffledItems || shuffledItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No items to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Grid of cards */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {shuffledItems.map((item: any) => {
            const itemId = item.id;
            // Extract label from nested data structure
            const itemData = item.data || item;
            const label = itemData.label || item.label || "Unknown";
            // Use raw data if available, otherwise use item data
            const itemMetadata = itemData.raw || itemData || item;
            const isHighlighted = item.highlighted === true;
            
            return (
              <ItemCard
                key={itemId}
                id={itemId}
                label={label}
                type="item"
                metadata={{ raw: itemMetadata }}
                isSelected={selectedItems.has(itemId)}
                isHighlighted={isHighlighted}
                onClick={() => {
                  selectItem(itemId, "item");
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default ListView;
