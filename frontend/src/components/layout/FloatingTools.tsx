import { useState, memo } from "react";
import { Search, MessageSquare, X, RotateCcw } from "lucide-react";
import { cn } from "@/utils";
import { useVisualization } from "@/hooks/useVisualization";
import SearchPanel from "@/components/panels/SearchPanel";
import ChatPanel from "@/components/panels/ChatPanel";

interface FloatingToolsProps {
  hasSearch?: boolean;
  hasChat?: boolean;
}

type DrawerType = "search" | "chat" | null;

/**
 * FloatingTools - 右侧中间浮动工具栏（玻璃长刃风格）
 * 采用超轻态的垂直玻璃设计，强调纵向延伸感和通透性
 */
const FloatingTools = memo(function FloatingTools({
  hasSearch = true,
  hasChat = true,
}: FloatingToolsProps) {
  const { loading, triggerLayoutReset } = useVisualization();
  const [openDrawer, setOpenDrawer] = useState<DrawerType>(null);

  const toggleDrawer = (type: DrawerType) => {
    setOpenDrawer(openDrawer === type ? null : type);
  };

  // 如果没有任何功能启用，不显示工具栏
  if (!hasSearch && !hasChat) {
    return null;
  }

  return (
    <>
      {/* 右侧中间浮动工具组 - 玻璃长刃风格 */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 p-2 rounded-full bg-background/20 backdrop-blur-3xl border-l border-t border-white/60 ring-1 ring-black/5 shadow-[0_0_25px_rgba(0,0,0,0.1)]"
      >
        {hasSearch && (
          <button
            onClick={() => toggleDrawer("search")}
            className={cn(
              "p-3 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900",
              openDrawer === "search"
                ? "bg-primary/20 text-primary shadow-sm"
                : "hover:bg-background/40"
            )}
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        {hasChat && (
          <button
            onClick={() => toggleDrawer("chat")}
            className={cn(
              "p-3 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900",
              openDrawer === "chat"
                ? "bg-primary/20 text-primary shadow-sm"
                : "hover:bg-background/40"
            )}
            title="Chat Assistant"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
        {/* 分隔线 */}
        <div className="h-px bg-background/40 mx-1" />
        {/* 重置按钮 - 集成到工具组 */}
        <button
          onClick={() => triggerLayoutReset()}
          disabled={loading}
          className="p-3 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-background/40 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Reset view layout and fetch fresh data"
        >
          <RotateCcw className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Capsule - Modern Raycast-style HUD */}
      {openDrawer === "search" && hasSearch && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-[550px] max-w-[90vw] z-[120] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white/[0.03] backdrop-blur-[64px] rounded-[2rem] border-t border-l border-white/40 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.02] overflow-hidden relative">
            {/* Grain Texture Overlay */}
            <div 
              className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative z-10">
              <SearchPanel />
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer - Keep sidebar for vertical reading flow */}
      {openDrawer === "chat" && hasChat && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-background/95 backdrop-blur-md border-l border-border shadow-2xl z-40 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-lg font-semibold">Chat Assistant</h2>
              <button
                onClick={() => setOpenDrawer(null)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ChatPanel />
            </div>
          </div>
        </div>
      )}

      {/* 点击画布关闭抽屉的蒙层（可选，半透明） */}
      {openDrawer && (
        <div
          className="fixed inset-0 bg-black/20 z-35 animate-in fade-in duration-300"
          onClick={() => setOpenDrawer(null)}
        />
      )}
    </>
  );
});

export default FloatingTools;
