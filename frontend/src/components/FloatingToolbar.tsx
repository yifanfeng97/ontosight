import { useState, memo } from "react";
import { Search, MessageSquare, X } from "lucide-react";
import { cn } from "@/utils";
import SearchPanel from "@/components/SearchPanel";
import ChatPanel from "@/components/ChatPanel";
import { ScrollArea } from "@/components/ui";

interface FloatingToolbarProps {
  hasSearch?: boolean;
  hasChat?: boolean;
}

type DrawerType = "search" | "chat" | null;

/**
 * FloatingToolbar - 右侧悬浮工具栏
 * 包含搜索和聊天按钮，点击展开对应的抽屉
 */
const FloatingToolbar = memo(function FloatingToolbar({
  hasSearch = true,
  hasChat = true,
}: FloatingToolbarProps) {
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
      {/* 右侧悬浮工具栏 */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
        {hasSearch && (
          <button
            onClick={() => toggleDrawer("search")}
            className={cn(
              "p-3 rounded-full shadow-lg transition-all duration-200",
              openDrawer === "search"
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-background/80 backdrop-blur-md border border-border hover:scale-110 hover:shadow-xl"
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
              "p-3 rounded-full shadow-lg transition-all duration-200",
              openDrawer === "chat"
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-background/80 backdrop-blur-md border border-border hover:scale-110 hover:shadow-xl"
            )}
            title="Chat Assistant"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 搜索抽屉 */}
      {openDrawer === "search" && hasSearch && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-background/95 backdrop-blur-md border-l border-border shadow-2xl z-40 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-lg font-semibold">Search</h2>
              <button
                onClick={() => setOpenDrawer(null)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                <SearchPanel />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* 聊天抽屉 */}
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

export default FloatingToolbar;
