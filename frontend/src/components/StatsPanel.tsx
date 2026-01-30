import { Card } from "@/components/ui/card";
import { NodeIndexOutlined, BranchesOutlined, UnorderedListOutlined } from "@ant-design/icons";

interface StatsPanelProps {
  data: any;
  vizType: "graph" | "list" | "hypergraph";
}

export default function StatsPanel({ data, vizType }: StatsPanelProps) {
  const getStats = () => {
    if (!data) {
      return null;
    }

    const StatItem = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => (
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    );

    if (vizType === "graph" && data.nodes && data.edges) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">基础信息</h3>
          <Card className="p-4 space-y-4">
            <StatItem label="节点数" value={data.nodes?.length || 0} icon={NodeIndexOutlined} />
            <StatItem label="边数" value={data.edges?.length || 0} icon={BranchesOutlined} />
          </Card>
        </div>
      );
    } else if (vizType === "hypergraph" && data.nodes && data.edges && data.hyperedges) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">基础信息</h3>
          <Card className="p-4 space-y-4">
            <StatItem label="节点数" value={data.nodes?.length || 0} icon={NodeIndexOutlined} />
            <StatItem label="超边数" value={data.hyperedges?.length || 0} icon={BranchesOutlined} />
          </Card>
        </div>
      );
    } else if (vizType === "list" && data.items) {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">基础信息</h3>
          <Card className="p-4 space-y-4">
            <StatItem label="项目数" value={data.items?.length || 0} icon={UnorderedListOutlined} />
          </Card>
        </div>
      );
    }

    return null;
  };

  return getStats();
}
