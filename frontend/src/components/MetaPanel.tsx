import { Collapse } from "antd";

export default function MetaPanel({ meta }: { meta: any }) {
  const items = [];

  if (meta.node_schema) {
    items.push({
      key: "node_schema",
      label: "Node Schema",
      children: <pre>{JSON.stringify(meta.node_schema, null, 2)}</pre>,
    });
  }

  if (meta.edge_schema) {
    items.push({
      key: "edge_schema",
      label: "Edge Schema",
      children: <pre>{JSON.stringify(meta.edge_schema, null, 2)}</pre>,
    });
  }

  return (
    <div className="meta-panel">
      <h3>Schema</h3>
      <Collapse items={items} size="small" />
    </div>
  );
}
