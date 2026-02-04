import { memo } from "react";
import { ItemCard, DataGridContainer } from "@/components/display";
import { useVisualization } from "@/hooks/useVisualization";

interface ListViewProps {
  data: any;
  meta: any;
}

const ListView = memo(function ListView({ data }: ListViewProps) {
  const { selectedItems, selectItem } = useVisualization();
  const items = data?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <DataGridContainer isEmpty={isEmpty} emptyMessage="No items available">
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
          </DataGridContainer>
        </div>
      </div>
    </div>
  );
});

export default ListView;
