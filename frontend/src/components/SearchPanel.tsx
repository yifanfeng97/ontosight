import { useState, useCallback } from "react";
import { Input, Button, Spin, List, Empty, Space, Tag, Tooltip } from "antd";
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useSearch } from "@/hooks/useSearch";
import { useVisualization } from "@/hooks/useVisualization";
import "@/components/SearchPanel.css";

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
    <div className="search-panel">
      <h3>🔍 搜索</h3>
      <div className="search-input-group">
        <Input.Search
          placeholder="搜索节点..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={handleSearch}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Button onClick={handleClear} type="link" size="small">
          清除
        </Button>
      </div>

      {loading && (
        <div className="search-loading">
          <Spin size="small" tip="搜索中..." />
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <Empty description="未找到结果" />
      )}

      {results.length > 0 && (
        <div className="search-results-container">
          <div className="search-stats">
            <Tag color="blue">
              共 {results.length} 个结果 (第 {currentResultIndex + 1} 个)
            </Tag>
          </div>

          <div className="search-navigation">
            <Tooltip title="上一个结果 (↑)">
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={handlePreviousResult}
                disabled={results.length === 0}
              />
            </Tooltip>
            <Tooltip title="下一个结果 (↓)">
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                onClick={handleNextResult}
                disabled={results.length === 0}
              />
            </Tooltip>
          </div>

          <List
            size="small"
            dataSource={results}
            className="search-results-list"
            renderItem={(item, index) => (
              <List.Item
                key={index}
                className={`search-result-item ${index === currentResultIndex ? 'active' : ''}`}
                onClick={() => handleResultClick(item, index)}
              >
                <div className="result-item-content">
                  <span className="result-index">#{index + 1}</span>
                  <span className="result-text">{item}</span>
                  {index === currentResultIndex && (
                    <Tag color="gold" className="current-indicator">当前</Tag>
                  )}
                </div>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
}
