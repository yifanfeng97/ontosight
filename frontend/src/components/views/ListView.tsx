import { memo } from "react";
import { ItemCard } from "@/components/ui";
import { useVisualization } from "@/hooks/useVisualization";

interface ListViewProps {
  data: any;
  meta: any;
}

const ListView = memo(function ListView({ data }: ListViewProps) {
  const { selectedItems, selectItem } = useVisualization();
  const items = data?.items || [];

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No items available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {items.map((item: any) => {
            const itemId = item.id;
            const itemData = item.data || item;
            const label = itemData.label || item.label || "Unknown";
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
                onClick={() => selectItem(itemId, "item")}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default ListView;
