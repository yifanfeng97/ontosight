import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useVisualization } from "@/hooks/useVisualization";

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const { loading, search, clear } = useSearch();
  const { setData, triggerLayoutReset } = useVisualization();

  const handleSearch = async () => {
    if (query.trim()) {
      const result = await search({ query: query.trim() });
      // Update main visualization with search results data
      if (result) {
        setData(result);
        // Force a layout reset/re-render to reflect the new data structure
        triggerLayoutReset();
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    clear();
  };



  return (
    <div className="flex flex-col gap-0 w-full relative group">
      {/* Container with golden highlight accent at the top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent pointer-events-none rounded-t-3xl" />
      
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Modern Search Icon with subtle pulse when loading */}
        <div className="flex-shrink-0">
          {loading ? (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors duration-300" />
          )}
        </div>

        {/* Minimalist Input Field */}
        <input
          placeholder="Search items, nodes, or relationships..."
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") handleClear();
          }}
          className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-slate-400 text-slate-800 placeholder:font-light"
        />

        {/* Result Counter and Navigation Pills - Integrated HUD style */}

        {/* Clear Action */}
        {query && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-full hover:bg-black/5 transition-all text-slate-400 hover:text-slate-600 active:rotate-90"
            title="Clear search (Esc)"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Meta/Keyboard Hints Layer - Raycast aesthetic */}
      <div className="px-5 pb-2.5 flex justify-end">
        <span className="text-[9px] text-slate-300 font-medium select-none flex items-center gap-1.5 uppercase tracking-[0.1em]">
          Press <kbd className="font-sans px-1.5 py-0.5 bg-white/60 rounded border border-black/5 shadow-sm text-slate-500 normal-case tracking-normal">↵ Enter</kbd> to search
        </span>
      </div>
    </div>
  );
}
