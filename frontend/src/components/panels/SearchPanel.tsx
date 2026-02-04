import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown, Search, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useVisualization } from "@/hooks/useVisualization";
import type { GraphData, HypergraphData, ListData } from "@/types/api";

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const { data: searchData, loading, search, clear } = useSearch();
  const { setData, meta } = useVisualization();

  // Extract highlighted item IDs based on visualization type
  const getHighlightedIds = (): string[] => {
    if (!searchData) return [];
    
    const vizType = meta?.type;
    if (vizType === "graph") {
      const graphData = searchData as GraphData;
      return [
        ...(graphData.nodes?.filter(n => n.highlighted)?.map(n => n.id) || []),
        ...(graphData.edges?.filter(e => e.highlighted)?.map(e => e.id) || []),
      ];
    } else if (vizType === "hypergraph") {
      const hgData = searchData as HypergraphData;
      return [
        ...(hgData.nodes?.filter(n => n.highlighted)?.map(n => n.id) || []),
        ...(hgData.hyperedges?.filter(e => e.highlighted)?.map(e => e.id) || []),
      ];
    } else if (vizType === "list") {
      const listData = searchData as ListData;
      return listData.items?.filter(i => i.highlighted)?.map(i => i.id) || [];
    }
    return [];
  };

  const highlightedIds = getHighlightedIds();

  const handleSearch = async () => {
    if (query.trim()) {
      const result = await search({ query: query.trim() });
      // Update main visualization with search results data
      if (result) {
        setData(result);
      }
      setCurrentResultIndex(0);
    }
  };

  const handleClear = () => {
    setQuery("");
    clear();
    setCurrentResultIndex(0);
  };

  const handlePreviousResult = useCallback(() => {
    if (highlightedIds.length === 0) return;
    const newIndex = currentResultIndex === 0 ? highlightedIds.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(newIndex);
  }, [highlightedIds, currentResultIndex]);

  const handleNextResult = useCallback(() => {
    if (highlightedIds.length === 0) return;
    const newIndex = currentResultIndex === highlightedIds.length - 1 ? 0 : currentResultIndex + 1;
    setCurrentResultIndex(newIndex);
  }, [highlightedIds, currentResultIndex]);

  const handleResultClick = (index: number) => {
    setCurrentResultIndex(index);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Search</h3>
      
      <div className="flex gap-2">
        <input
          placeholder="Search nodes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1 px-3 py-2 bg-muted/50 rounded-md border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
        />
        <button
          onClick={handleClear}
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          Searching...
        </div>
      )}

      {!loading && highlightedIds.length === 0 && query && (
        <div className="text-sm text-muted-foreground text-center py-4">No results found</div>
      )}

      {highlightedIds.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              {highlightedIds.length} highlighted ({currentResultIndex + 1}/{highlightedIds.length})
            </span>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={handlePreviousResult}
              disabled={highlightedIds.length === 0}
              className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous result"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextResult}
              disabled={highlightedIds.length === 0}
              className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next result"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto border border-border rounded-md">
            {highlightedIds.map((id, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(index)}
                className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                  index === currentResultIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono opacity-75">#{index + 1}</span>
                  <span className="flex-1 truncate">{id}</span>
                  {index === currentResultIndex && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Current</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
