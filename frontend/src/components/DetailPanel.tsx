import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useVisualization } from "@/hooks/useVisualization";
import { X } from "lucide-react";

export default function DetailPanel() {
  const { selectedItems, data, meta, deselectItem, clearSelection } = useVisualization();

  const selectedItemsList = useMemo(() => {
    return Array.from(selectedItems.values());
  }, [selectedItems]);

  if (selectedItemsList.length === 0) {
    return null;
  }

  const getItemData = (itemId: string, itemType: string): any => {
    if (!data) return null;

    switch (itemType) {
      case "node":
        return data.nodes?.find((n: any) => n.id === itemId);
      case "edge":
        return data.edges?.find((e: any) => e.id === itemId);
      case "item":
        return data.items?.find((i: any) => i.id === itemId);
      case "hyperedge":
        return data.hyperedges?.find((he: any) => he.id === itemId);
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      node: "Node",
      edge: "Edge",
      item: "Item",
      hyperedge: "Hyperedge",
    };
    return labels[type] || type;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0 px-3 py-2">
        <h3 className="text-sm font-semibold text-foreground">Details</h3>
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Clear all selections"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-3">
        {selectedItemsList.map((item) => {
          const itemData = getItemData(item.id, item.type);
          if (!itemData) return null;

          const rawData = itemData.data?.raw || itemData.data || {};

          return (
            <Card
              key={item.id}
              className="p-3 space-y-2"
            >
              {/* Header with type and close button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    {getTypeLabel(item.type)}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {itemData.data?.label || item.id}
                  </p>
                </div>
                <button
                  onClick={() => deselectItem(item.id)}
                  className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                  title="Remove selection"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>

              {/* Data Table */}
              {Object.keys(rawData).length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <DataTable data={rawData} />
                </div>
              )}
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
}

interface DataTableProps {
  data: Record<string, any>;
}

function DataTable({ data }: DataTableProps) {
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex gap-2 text-xs">
          <span className="font-mono font-semibold text-muted-foreground min-w-20 flex-shrink-0">
            {key}:
          </span>
          <span className="text-foreground break-words flex-1">
            {formatValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
