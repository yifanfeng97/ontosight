import { memo } from "react";
import { List, Link2, Layers } from "lucide-react";
import { cn } from "@/utils";
import { BACKDROP_BLUR_CONFIG } from "@/theme/visual-config";

interface FloatingNavProps {
  vizType: "graph" | "hypergraph" | "nodes";
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
    nodes: [
      { value: "nodes", label: "Nodes", icon: List },
    ],
  };

  const options = viewOptions[vizType];

  return (
    <div className={cn(
      "flex items-center gap-1 px-2.5 py-2.5 rounded-[2rem] bg-white/70 border border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-[40px] overflow-hidden",
      "transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)]"
    )}>
      <div className="flex items-center gap-2 min-w-max">
        {options.map(({ value, label, icon: Icon }) => {
          const isActive = activeView === value;
          return (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 shrink-0",
                isActive
                  ? "bg-slate-900 text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] scale-105"
                  : "text-slate-400 hover:text-slate-600 hover:bg-black/5"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-indigo-400" : "text-slate-300")} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default FloatingNav;
