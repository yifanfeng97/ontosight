import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
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
    if (query.trim()) {
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
    <div className="flex flex-col gap-0 w-full relative group p-2">
      {/* HUD Accent - Amber Glow when focusing */}
      <div className={cn(
        "absolute inset-0 bg-amber-500/5 transition-opacity duration-500 rounded-[2.2rem] pointer-events-none opacity-0 group-focus-within:opacity-100"
      )} />
      
      <div className="flex items-center gap-5 px-8 py-8 relative z-10">
        {/* Large Modern Search Icon */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="relative">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <div className="absolute inset-0 blur-md bg-amber-500/30 rounded-full animate-pulse" />
            </div>
          ) : (
            <Search className={cn(
              "w-8 h-8 transition-all duration-300",
              query ? "text-amber-500" : "text-white/30"
            )} />
          )}
        </div>

        {/* Cinematic Input Field */}
        <input
          ref={inputRef}
          placeholder="What would you like to explore?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") onClose?.();
          }}
          className="flex-1 bg-transparent border-none outline-none text-2xl font-medium tracking-tight placeholder:text-white/20 text-white placeholder:font-light"
        />

        {/* Action Button - Shows when query exists */}
        <div className="flex items-center gap-3">
          {query && (
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Close Action */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all text-white/30 hover:text-white/80"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Meta/Keyboard Hints Layer - Precision Grids style */}
      <div className="px-8 pb-6 flex justify-between items-center relative z-10">
        <div className="flex gap-4">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
            Graph Intelligence Active
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-white/30 font-medium select-none flex items-center gap-1.5 uppercase tracking-[0.15em]">
            <kbd className="font-sans px-2 py-0.5 bg-white/10 rounded-md border border-white/10 shadow-sm text-white/60 normal-case tracking-normal">Esc</kbd>
            Cancel
          </span>
          <span className="text-[10px] text-white/30 font-medium select-none flex items-center gap-1.5 uppercase tracking-[0.15em]">
            <kbd className="font-sans px-2 py-0.5 bg-white/10 rounded-md border border-white/10 shadow-sm text-white/60 normal-case tracking-normal">↵ Enter</kbd>
            Confirm
          </span>
        </div>
      </div>
    </div>
  );
}
