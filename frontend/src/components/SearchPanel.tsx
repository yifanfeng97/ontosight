import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Search, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useVisualization } from "@/hooks/useVisualization";

export default function SearchPanel() {
  const [query, setQuery] = useState("");
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const { results, loading, search, clear } = useSearch();
  const { selectNode } = useVisualization();

  const handleSearch = async () => {
    if (query.trim()) {
      await search({ query: query.trim(), context: {} });
      setCurrentResultIndex(0);
    }
  };

  const handleClear = () => {
    setQuery("");
    clear();
    setCurrentResultIndex(0);
  };

  const handlePreviousResult = useCallback(() => {
    if (results.length === 0) return;
    setCurrentResultIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
    if (results.length > 0) {
      selectNode(results[currentResultIndex === 0 ? results.length - 1 : currentResultIndex - 1]);
    }
  }, [results, currentResultIndex, selectNode]);

  const handleNextResult = useCallback(() => {
    if (results.length === 0) return;
    setCurrentResultIndex((prev) => (prev === results.length - 1 ? 0 : prev + 1));
    if (results.length > 0) {
      selectNode(results[currentResultIndex === results.length - 1 ? 0 : currentResultIndex + 1]);
    }
  }, [results, currentResultIndex, selectNode]);

  const handleResultClick = (resultId: string, index: number) => {
    selectNode(resultId);
    setCurrentResultIndex(index);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">🔍 搜索</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="搜索节点..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1"
        />
        <Button
          onClick={handleClear}
          variant="outline"
          size="sm"
          title="清除搜索"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          搜索中...
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-sm text-muted-foreground text-center py-4">未找到结果</div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              共 {results.length} 个结果 (第 {currentResultIndex + 1} 个)
            </Badge>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousResult}
              disabled={results.length === 0}
              title="上一个结果 (↑)"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextResult}
              disabled={results.length === 0}
              title="下一个结果 (↓)"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto border rounded-md">
            {results.map((item, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(item, index)}
                className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                  index === currentResultIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono opacity-75">#{index + 1}</span>
                  <span className="flex-1 truncate">{item}</span>
                  {index === currentResultIndex && (
                    <Badge variant="default" className="text-xs">当前</Badge>
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
