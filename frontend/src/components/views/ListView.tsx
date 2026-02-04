import { memo } from "react";
import ItemGallery from "./components/ItemGallery";
import { useVisualization } from "@/hooks/useVisualization";

interface ListViewProps {
  data: any;
  meta: any;
}

const ListView = memo(function ListView({ data }: ListViewProps) {
  const { selectedItems, selectItem } = useVisualization();
  const items = data?.items || [];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <ItemGallery
            items={items}
            itemType="item"
            emptyMessage="No items available"
            selectedItems={selectedItems}
            onItemClick={(itemId) => selectItem(itemId, "item")}
          />
        </div>
      </div>
    </div>
  );
});

export default ListView;
