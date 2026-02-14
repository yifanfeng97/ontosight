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

  return (
    <>
      {/* Right Tool Blade - Mica Jelly Style */}
      <div className={cn(
        "fixed top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 p-2.5 rounded-[2rem] bg-white/70 border border-white/50 shadow-[0_15px_45px_rgba(0,0,0,0.06)] backdrop-blur-[40px] pointer-events-auto",
        "transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        openDrawer === "chat" ? "right-[420px]" : "right-8",
        "hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:scale-[1.03]"
      )}>
        {hasSearch && (
          <button
            onClick={() => toggleDrawer("search")}
            className={cn(
              "p-4 rounded-[1.5rem] transition-all duration-300 group relative",
              openDrawer === "search"
                ? "bg-slate-900 text-white shadow-lg scale-110"
                : "text-slate-400 hover:text-slate-900 hover:bg-black/5"
            )}
            title="Search (Universal Intelligence)"
          >
            <Search className={cn("w-5 h-5", openDrawer === "search" ? "animate-pulse" : "")} />
            {openDrawer !== "search" && (
              <div className="absolute right-full mr-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Search
              </div>
            )}
          </button>
        )}
        {hasChat && (
          <button
            onClick={() => toggleDrawer("chat")}
            className={cn(
              "p-4 rounded-[1.5rem] transition-all duration-300 group relative",
              openDrawer === "chat"
                ? "bg-slate-900 text-white shadow-lg scale-110"
                : "text-slate-400 hover:text-slate-900 hover:bg-black/5"
            )}
            title="Chat Assistant (Deep Memory)"
          >
            <MessageSquare className={cn("w-5 h-5", openDrawer === "chat" ? "animate-bounce" : "")} />
             {openDrawer !== "chat" && (
              <div className="absolute right-full mr-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Chat
              </div>
            )}
          </button>
        )}
        
        {(hasSearch || hasChat) && <div className="h-px bg-slate-100 mx-3 my-1" />}
        
        <button
          onClick={() => triggerLayoutReset()}
          disabled={loading}
          className="p-4 rounded-[1.5rem] transition-all duration-300 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 group relative disabled:opacity-30"
          title="Reset Visualization"
        >
          <RotateCcw className={cn("w-5 h-5 transition-transform duration-700 group-hover:rotate-180", loading ? "animate-spin" : "")} />
           <div className="absolute right-full mr-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Reset
          </div>
        </button>
      </div>

      {/* Search Capsule - Modern Pure Mica HUD */}
      {openDrawer === "search" && hasSearch && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[15vh]">
          {/* Airy Pure Mask */}
          <div 
            className={cn(
              "absolute inset-0 bg-white/10 backdrop-blur-[4px] animate-in fade-in duration-500",
            )}
            onClick={() => toggleDrawer(null)}
          />

          <div className="relative w-[680px] max-w-[95vw] animate-in zoom-in-95 slide-in-from-top-12 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <div className={cn(
              "bg-white/80 rounded-[3rem] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden relative",
              "backdrop-blur-[80px]"
            )}>
              {/* White Mica Grain Overlay */}
              <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-soft-light"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative z-10">
                <SearchPanel onClose={() => toggleDrawer(null)} />
              </div>
            </div>
            
            {/* Minimalist Footnote - Bright style */}
            <div className="mt-6 flex justify-center animate-in fade-in slide-in-from-top-2 duration-1000 delay-300">
              <span className="text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase">
                OntoSight Engine • Neural Search v2.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer - Pure Mica Jelly Sidebar */}
      {openDrawer === "chat" && hasChat && (
        <div className={cn(
          "fixed right-0 top-0 h-full w-[400px] max-w-full z-[110]",
          "bg-white/60 border-l border-white/60 shadow-[-20px_0_80px_rgba(0,0,0,0.08)]",
          "backdrop-blur-[60px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-in slide-in-from-right"
        )}>
          {/* White Mica Grain Overlay */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative z-10 h-full flex flex-col">
            <ChatPanel onClose={() => setOpenDrawer(null)} />
          </div>
        </div>
      )}

      {/* 点击画布关闭抽屉的蒙层 - 更加通透的果冻感 */}
      {openDrawer && (
        <div
          className="fixed inset-0 bg-white/10 dark:bg-black/5 z-35 backdrop-blur-[2px] animate-in fade-in duration-500"
          onClick={() => setOpenDrawer(null)}
        />
      )}
    </>
  );
});

export default FloatingTools;
