import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, ArrowRight, Sparkles, Command } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useVisualization } from "@/hooks/useVisualization";
import { cn } from "@/utils";

interface SearchPanelProps {
  onClose?: () => void;
}

export default function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading, search, clear } = useSearch();
  const { setData, refreshView } = useVisualization();

  // Auto-focus logic
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    if (query.trim() && !loading) {
      const result = await search({ query: query.trim() });
      
      // Update main visualization with search results data
      if (result) {
        setData(result);
        refreshView(); // Rebuild graph with new data (clears old positions)
        onClose?.();   // Close HUD on successful search
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    clear();
  };

  return (
    <div className="flex flex-col gap-0 w-full relative">
      <div className="flex flex-col px-10 py-10 gap-8">
        {/* Header - Jelly Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-widest text-slate-900 uppercase">Semantic Search</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">AI Linkage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-black/5 text-slate-300 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Jelly Capsule Input */}
        <div className="relative group">
          <div className={cn(
            "flex items-center gap-6 px-10 py-8 rounded-[2.5rem] bg-white transition-all duration-500",
            "border border-white shadow-[0_15px_40px_rgba(0,0,0,0.03)]",
            "group-focus-within:shadow-[0_25px_60px_rgba(0,0,0,0.08)] group-focus-within:scale-[1.02] group-focus-within:-translate-y-1",
            "ring-8 ring-transparent group-focus-within:ring-indigo-500/5"
          )}>
            {/* Morphing Search Icon */}
            <div className="flex-shrink-0">
              {loading ? (
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <Search className={cn(
                  "w-8 h-8 transition-all duration-500",
                  query ? "text-indigo-600 scale-110" : "text-slate-200"
                )} />
              )}
            </div>

            {/* Cinematic Large Input */}
            <input
              ref={inputRef}
              placeholder="What would you like to explore?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") onClose?.();
              }}
              className="flex-1 bg-transparent border-none outline-none text-2xl font-bold tracking-tight text-slate-800 placeholder:text-slate-200"
            />

            {/* Jelly Action Button - Float in */}
            <div className={cn(
              "flex items-center transition-all duration-500 origin-right",
              query ? "opacity-100 scale-100 w-auto" : "opacity-0 scale-90 w-0 overflow-hidden"
            )}>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] active:scale-95"
              >
                Go
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hints Layer - Minimalist */}
        <div className="flex justify-between items-center px-4">
          <div className="flex gap-4">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Engine Stable
            </span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                <Command className="w-3 h-3 text-slate-400" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Semantic Analysis Ready</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-black/5 rounded-md border border-black/5 font-sans normal-case">Enter</kbd>
                  to search
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
