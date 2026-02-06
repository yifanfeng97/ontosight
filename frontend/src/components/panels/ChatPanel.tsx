import { useState, useRef, useEffect } from "react";
import { Send, X, Fingerprint, Sparkles, Loader2, BrainCircuit, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useVisualization } from "@/hooks/useVisualization";
import { cn } from "@/utils";

interface ChatPanelProps {
  onClose?: () => void;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { history, loading, send, clear } = useChat();
  const { setData } = useVisualization();

  // Auto-scroll to bottom of history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async () => {
    if (message.trim() && !loading) {
      const response = await send({ query: message.trim() });
      if (response?.data) {
        const hasContent = 
          (response.data as any).nodes?.length > 0 ||
          (response.data as any).edges?.length > 0 ||
          (response.data as any).hyperedges?.length > 0 ||
          (response.data as any).items?.length > 0;
        
        if (hasContent) {
          setData(response.data);
        }
      }
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-800">
      {/* Pure Mica Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-500/10 flex items-center justify-center border border-white shadow-[0_4px_15px_rgba(0,0,0,0.04)]">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-slate-900">Intelligence Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-white/40 text-slate-400 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Message History */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-8 space-y-10 scroll-smooth scrollbar-none"
      >
        {history.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
            <div className="p-6 rounded-[2rem] bg-white/40 border border-white shadow-sm">
              <Sparkles className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-[11px] font-black tracking-[0.3em] uppercase text-indigo-400">Stream Initialized</p>
          </div>
        )}
        
        {history.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
              item.role === "user" ? "items-end" : "items-start"
            )}
          >
            {/* Minimalist Avatar/Label */}
            <div className={cn(
              "flex items-center gap-2.5",
              item.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "w-7 h-7 rounded-[0.6rem] flex items-center justify-center shadow-sm border border-white",
                item.role === "user" 
                  ? "bg-indigo-500 text-white" 
                  : "bg-white/80 text-indigo-500"
              )}>
                {item.role === "user" ? <Fingerprint className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase opacity-30">
                {item.role === "user" ? "Client" : "Assistant"}
              </span>
            </div>

            {/* Jelly Glass Bubble */}
            <div className={cn(
              "relative px-5 py-4 rounded-[1.6rem] text-[14px] leading-relaxed shadow-[0_8px_30px_rgba(0,0,0,0.04)] border transition-all duration-300",
              item.role === "user" 
                ? "bg-indigo-500 border-indigo-400 text-white rounded-tr-none shadow-indigo-500/10 hover:shadow-indigo-500/20" 
                : "bg-white/60 border-white text-slate-800 rounded-tl-none hover:bg-white/80"
            )}>
              <span className="whitespace-pre-wrap font-medium">{item.content}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-4 py-2 opacity-60">
            <div className="flex gap-1.5 items-center">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-duration:0.8s]" />
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400/80">Processing...</span>
          </div>
        )}
      </div>

      {/* Pure White Capsule Input */}
      <div className="p-8 shrink-0">
        <div className="relative group">
          <div className={cn(
            "bg-white/70 border border-white rounded-[2.2rem] p-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "group-focus-within:bg-white group-focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-focus-within:scale-[1.02]",
            "shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
          )}>
            <textarea
              placeholder="Ask anything about the data..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-full bg-transparent border-none outline-none text-[15px] px-5 py-4 placeholder:text-slate-300 text-slate-800 resize-none scrollbar-none font-medium"
            />
            
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-3 pl-2">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/40 animate-pulse" />
                  Ready
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={clear}
                  className="p-3 rounded-2xl hover:bg-black/5 text-slate-300 hover:text-slate-500 transition-all active:scale-90"
                  title="Clear context"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500",
                    loading || !message.trim()
                      ? "bg-slate-100 text-slate-300"
                      : "bg-indigo-500 text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:scale-110 active:scale-95 hover:bg-indigo-600"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
