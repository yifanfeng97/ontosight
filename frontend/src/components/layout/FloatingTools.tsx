import { useState, memo } from "react";
import { Search, MessageSquare, X, RotateCcw } from "lucide-react";
import { cn } from "@/utils";
import { useVisualization } from "@/hooks/useVisualization";
import SearchPanel from "@/components/panels/SearchPanel";
import ChatPanel from "@/components/panels/ChatPanel";
import { BACKDROP_BLUR_CONFIG } from "@/theme/visual-config";

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
      <div className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 p-2 rounded-full bg-background/20 border-l border-t border-white/60 ring-1 ring-black/5 shadow-[0_0_25px_rgba(0,0,0,0.1)]",
        BACKDROP_BLUR_CONFIG.STRONG
      )}>
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
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[15vh]">
          {/* Deep Focus Backdrop Mask */}
          <div 
            className={cn(
              "absolute inset-0 bg-slate-900/40 animate-in fade-in duration-500",
              BACKDROP_BLUR_CONFIG.BASE
            )}
            onClick={() => toggleDrawer(null)}
          />

          <div className="relative w-[650px] max-w-[95vw] animate-in zoom-in-95 slide-in-from-top-8 duration-300">
            <div className={cn(
              "bg-white/10 rounded-[2.5rem] border border-white/20 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.4)] ring-1 ring-white/10 overflow-hidden relative",
              BACKDROP_BLUR_CONFIG.STRONG
            )}>
              {/* Grain Texture Overlay */}
              <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative z-10">
                <SearchPanel onClose={() => toggleDrawer(null)} />
              </div>
            </div>
            
            {/* Minimalist Footnote info */}
            <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
              <span className="text-[10px] text-white/40 font-medium tracking-[0.2em] uppercase">
                OntoSight Engine • Semantic Search v1.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer - Keep sidebar for vertical reading flow */}
      {openDrawer === "chat" && hasChat && (
        <div className={cn(
          "fixed right-0 top-0 h-full w-[400px] bg-background/95 border-l border-border shadow-2xl z-40 animate-in slide-in-from-right duration-300",
          BACKDROP_BLUR_CONFIG.BASE
        )}>
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
