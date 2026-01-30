import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SchemaProperty {
  title?: string;
  type?: string;
  description?: string;
  properties?: Record<string, any>;
}

const renderSchemaProperties = (schema: any) => {
  if (!schema || !schema.properties) {
    return <div className="text-sm text-muted-foreground p-4">暂无属性定义</div>;
  }

  const properties = schema.properties;
  return (
    <div className="space-y-2 p-4">
      {Object.entries(properties).map(([key, prop]: [string, any]) => (
        <div key={key} className="space-y-1 p-2 bg-muted/50 rounded border border-border/50">
          <div className="font-mono text-sm font-medium text-foreground">{key}</div>
          <div className="text-xs text-muted-foreground">
            {prop.type || "any"}
            {prop.description && ` - ${prop.description}`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MetaPanel({ meta }: { meta: any }) {
  if (!meta || !meta.schemas) {
    return <div className="text-sm text-muted-foreground p-4">暂无 Schema 信息</div>;
  }

  const schemas = meta.schemas;

  // For graph and hypergraph: show nodes and edges schemas
  if ((meta.type === "graph" || meta.type === "hypergraph") && ("nodes" in schemas || "edges" in schemas)) {
    const tabItems = [];

    if (schemas.nodes) {
      tabItems.push({
        id: "nodes",
        label: "节点结构 (Nodes)",
        content: renderSchemaProperties(schemas.nodes),
      });
    }

    if (schemas.edges) {
      tabItems.push({
        id: "edges",
        label: "边结构 (Edges)",
        content: renderSchemaProperties(schemas.edges),
      });
    }

    if (meta.type === "hypergraph" && schemas.hyperedges) {
      tabItems.push({
        id: "hyperedges",
        label: "超边结构 (Hyperedges)",
        content: renderSchemaProperties(schemas.hyperedges),
      });
    }

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Schema 定义</h3>
        {tabItems.length > 0 ? (
          <Tabs defaultValue={tabItems[0].id}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabItems.length}, 1fr)` }}>
              {tabItems.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="text-xs">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabItems.map((item) => (
              <TabsContent key={item.id} value={item.id}>
                {item.content}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-sm text-muted-foreground p-4">暂无 Schema</div>
        )}
      </div>
    );
  }

  // For list: show items schema
  if (meta.type === "list" && schemas.items) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Schema 定义</h3>
        {renderSchemaProperties(schemas.items)}
      </div>
    );
  }

  return <div className="text-sm text-muted-foreground p-4">未知的可视化类型</div>;
}
