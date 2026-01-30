import { memo } from "react";
import { List, Empty } from "antd";
import { useVisualization } from "@/hooks/useVisualization";

interface ListViewProps {
  data: any;
  meta: any;
}

const ListView = memo(function ListView({ data }: ListViewProps) {
  const { selectedNodes, selectNode } = useVisualization();

  if (!data.items || data.items.length === 0) {
    return <Empty description="No items to display" />;
  }

  return (
    <div className="list-view">
      <List
        dataSource={data.items}
        renderItem={(item: any) => (
          <List.Item
            key={item.id}
            className={`list-item ${selectedNodes.has(item.id) ? "selected" : ""}`}
            onClick={() => selectNode(item.id)}
            style={{ cursor: "pointer" }}
          >
            <List.Item.Meta
              title={item.data?.label || item.id}
              description={item.id}
            />
          </List.Item>
        )}
      />
    </div>
  );
});

export default ListView;
