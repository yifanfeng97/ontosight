import { memo } from "react";
import { Eye, List, Link2, Layers } from "lucide-react";
import { cn } from "@/utils";

interface FloatingViewSwitcherProps {
  vizType: "graph" | "hypergraph" | "list";
  activeView: string;
  onViewChange: (view: string) => void;
}

/**
 * FloatingViewSwitcher - 悬浮胶囊样式的视图切换器
 * 使用玻璃拟态效果，悬浮在画布上方
 */
const FloatingViewSwitcher = memo(function FloatingViewSwitcher({
  vizType,
  activeView,
  onViewChange,
}: FloatingViewSwitcherProps) {
  // 根据 vizType 决定显示哪些按钮
  const viewOptions = {
    graph: [
      { value: "graph", label: "Graph", icon: Eye },
      { value: "nodes", label: "Nodes", icon: List },
      { value: "edges", label: "Edges", icon: Link2 },
    ],
    hypergraph: [
      { value: "graph", label: "Hypergraph", icon: Eye },
      { value: "nodes", label: "Nodes", icon: List },
      { value: "hyperedges", label: "Hyperedges", icon: Layers },
    ],
    list: [
      { value: "list", label: "Sample", icon: Eye },
      { value: "items", label: "All Items", icon: List },
    ],
  };

  const options = viewOptions[vizType] || viewOptions.list;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg">
        {options.map(({ value, label, icon: Icon }) => {
          const isActive = activeView === value;
          return (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default FloatingViewSwitcher;
