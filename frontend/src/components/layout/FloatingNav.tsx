import { memo } from "react";
import { List, Link2, Layers } from "lucide-react";
import { cn } from "@/utils";
import { BACKDROP_BLUR_CONFIG } from "@/theme/visual-config";

interface FloatingNavProps {
  vizType: "graph" | "hypergraph";
  activeView: string;
  onViewChange: (view: string) => void;
}

/**
 * FloatingNav - 悬浮胶囊样式的视图切换器
 * 使用玻璃拟态效果，悬浮在画布上方
 */
const FloatingNav = memo(function FloatingNav({
  vizType,
  activeView,
  onViewChange,
}: FloatingNavProps) {
  // 根据 vizType 决定显示哪些按钮
  const viewOptions = {
    graph: [
      { value: "nodes", label: "Nodes", icon: List },
      { value: "edges", label: "Edges", icon: Link2 },
    ],
    hypergraph: [
      { value: "nodes", label: "Nodes", icon: List },
      { value: "hyperedges", label: "Hyperedges", icon: Layers },
    ],
  };

  const options = viewOptions[vizType];

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1.5 rounded-full bg-background/80 border border-border shadow-lg",
      BACKDROP_BLUR_CONFIG.BASE
    )}>
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
  );
});

export default FloatingNav;
