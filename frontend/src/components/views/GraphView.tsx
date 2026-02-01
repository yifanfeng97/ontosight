import { useEffect, useRef, useCallback, memo } from "react";
import { Graph, NodeEvent, EdgeEvent, CanvasEvent } from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { useSearch } from "@/hooks/useSearch";
import { useToast } from "@/components/ui/toast";

interface GraphViewProps {
  data: any;
  meta: any;
}

// 处理平行边，给多条边添加不同的 curveOffset
function processParallelEdges(edges: any[]) {
  // 统计每对节点之间的边
  const edgeMap = new Map<string, any[]>();
  edges.forEach(edge => {
    const key = edge.source < edge.target
      ? `${edge.source}|${edge.target}`
      : `${edge.target}|${edge.source}`;
    if (!edgeMap.has(key)) edgeMap.set(key, []);
    edgeMap.get(key)!.push(edge);
  });

  // 给每组平行边设置不同的 curveOffset
  edgeMap.forEach(edgeList => {
    if (edgeList.length === 1) {
      // 单条边，保持直线
      edgeList[0].type = 'line';
      edgeList[0].style = { ...edgeList[0].style, curveOffset: 0 };
    } else {
      // 多条边，分配不同的曲率
      const mid = (edgeList.length - 1) / 2;
      edgeList.forEach((edge, i) => {
        edge.type = 'quadratic'; // 二次贝塞尔曲线
        // 正负交错分布
        edge.style = {
          ...edge.style,
          curveOffset: (i - mid) * 30 // 30 可调整，越大弯曲越明显
        };
      });
    }
  });

  return edges;
}

const GraphView = memo(function GraphView({ data, meta }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const selectedItemsRef = useRef(new Map());
  const { selectedItems, selectItem, deselectItem, clearSelection, resetTrigger } = useVisualization();
  const { results: searchResults } = useSearch();
  const { addToast } = useToast();

  // Keep ref in sync with state
  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  const handleNodeClick = useCallback(
    (evt: any) => {
      const nodeId = evt.target?.id;
      if (!nodeId) return;

      if (selectedItemsRef.current.has(nodeId)) {
        deselectItem(nodeId);
      } else {
        selectItem(nodeId, "node");
      }
    },
    [selectItem, deselectItem]
  );

  const handleEdgeClick = useCallback(
    (evt: any) => {
      const edgeId = evt.target?.id;
      if (!edgeId) return;

      if (selectedItemsRef.current.has(edgeId)) {
        deselectItem(edgeId);
      } else {
        selectItem(edgeId, "edge");
      }
    },
    [selectItem, deselectItem]
  );

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // 键盘快捷键处理
  const handleKeyDown = useCallback((evt: KeyboardEvent) => {
    if (evt.key === 'Escape') {
      clearSelection();
    } else if ((evt.ctrlKey || evt.metaKey) && evt.key === 'f') {
      evt.preventDefault();
      addToast('搜索面板已激活', 'info');
    } else if (evt.key === 'Delete' && selectedItemsRef.current.size > 0) {
      selectedItemsRef.current.forEach((item) => {
        deselectItem(item.id);
      });
      addToast('已清除选中项', 'success');
    }
  }, [clearSelection, deselectItem, addToast]);

  // 高亮搜索结果
  const highlightSearchResults = useCallback((graph: Graph) => {
    if (!graph) return;

    try {
      const allNodeData = graph.getNodeData() || [];
      const searchResultSet = new Set(searchResults);

      allNodeData.forEach((nodeData: any) => {
        const nodeId = nodeData.id;
        if (searchResultSet.has(nodeId)) {
          graph.setElementState(nodeId, ['highlight']);
        } else {
          // 清除节点的高亮状态（保留其他状态如selected）
          const currentStates = graph.getElementState(nodeId) || [];
          const newStates = currentStates.filter((state: string) => state !== 'highlight');
          graph.setElementState(nodeId, newStates);
        }
      });

      // 如果有搜索结果，聚焦到第一个
      if (searchResults.length > 0) {
        graph.focusElement(searchResults[0]);
      }
    } catch (error) {
      console.warn("[GraphView] Error in highlightSearchResults:", error);
    }
  }, [searchResults]);

  // Initialize graph when data changes
  useEffect(() => {
    if (!containerRef.current || !data?.nodes) {
      return;
    }

    // Clean up old graph
    if (graphRef.current) {
      try {
        graphRef.current.destroy();
      } catch (e) {
        console.warn("[GraphView] Error destroying previous graph:", e);
      }
      graphRef.current = null;
    }

    try {
      // Create new graph with proper G6 v5 config
      const graph = new Graph({
        container: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: {
          type: 'force',
          collide: {
            radius: (d: any) => d.size / 2,
          },
          preventOverlap: true,
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
        node: {
          style: {
            labelText: (d: any) => d.data?.label || d.id,
            fontSize: 12,
          },
          state: {
            highlight: {
              fill: '#ffd666',
              stroke: '#faad14',
              lineWidth: 2,
              shadowColor: '#faad14',
              shadowBlur: 10,
            },
            selected: {
              fill: '#1890ff',
              stroke: '#1890ff',
              lineWidth: 3,
              shadowColor: '#1890ff',
              shadowBlur: 10,
            },
          },
        },
        edge: {
          style: {
            labelText: (d: any) => d.data?.label || '',
            fontSize: 10,
          },
          state: {
            highlight: {
              stroke: '#faad14',
              lineWidth: 2,
              opacity: 1,
            },
          },
        },
        data: {
          nodes: data.nodes,
          edges: processParallelEdges(data.edges || []),
        },
      });

        // Register event handlers with proper G6 v5 API
        const nodeClickHandler = handleNodeClick;
        const edgeClickHandler = handleEdgeClick;
        const canvasClickHandler = handleCanvasClick;

        graph.on(NodeEvent.CLICK, nodeClickHandler);
        graph.on(EdgeEvent.CLICK, edgeClickHandler);
        graph.on(CanvasEvent.CLICK, canvasClickHandler);

        // 双击节点展开相邻节点
        graph.on(NodeEvent.DBLCLICK, (evt: any) => {
          try {
            const nodeId = evt.target?.id;
            if (!nodeId) return;
            const neighbors = graph.getNeighborNodesData(nodeId) || [];
            neighbors.forEach((neighbor: any) => {
              graph.setElementState(neighbor.id, ['highlight']);
            });
          } catch (error) {
            console.warn("[GraphView] Error in dblclick handler:", error);
          }
        });

      // Render and then apply search highlighting
      graph.render().then(() => {
        console.log("[GraphView] Graph rendered successfully");
        highlightSearchResults(graph);
      }).catch((error) => {
        console.error("[GraphView] Error rendering graph:", error);
      });

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && graphRef.current) {
          try {
            graphRef.current.resize(
              containerRef.current.clientWidth,
              containerRef.current.clientHeight
            );
          } catch (error) {
            console.warn("[GraphView] Error resizing graph:", error);
          }
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("keydown", handleKeyDown);
      graphRef.current = graph;

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);

        if (graphRef.current) {
          try {
            // Unregister event handlers
            graphRef.current.off(NodeEvent.CLICK, nodeClickHandler);
            graphRef.current.off(EdgeEvent.CLICK, edgeClickHandler);
            graphRef.current.off(CanvasEvent.CLICK, canvasClickHandler);

            // Destroy graph
            graphRef.current.destroy();
            graphRef.current = null;
          } catch (e) {
            console.warn("[GraphView] Error in cleanup:", e);
          }
        }
      };
    } catch (error) {
      console.error("[GraphView] Error creating graph:", error);
      return () => { }; // Return empty cleanup
    }
  }, [data, handleNodeClick, handleEdgeClick, handleCanvasClick, handleKeyDown, highlightSearchResults]);

  // Re-render graph when reset is triggered (full refresh with cold-start layout)
  useEffect(() => {
    if (!graphRef.current || resetTrigger === 0) return;

    const fullRerender = async () => {
      try {
        console.log("[GraphView] Full re-render with cold-start layout...");
        
        // Stop any ongoing layout
        graphRef.current?.stopLayout();
        
        // Clear node coordinates for cold-start layout (not based on current positions)
        const cleanNodes = data.nodes.map(({ x, y, ...rest }: any) => rest);
        
        // Re-set data with cleaned coordinates and re-processed parallel edges
        graphRef.current?.setData({
          nodes: cleanNodes,
          edges: processParallelEdges(data.edges || []),
        });
        
        // Full render: triggers data reconciliation -> layout calculation -> drawing
        await graphRef.current?.render();
        
        // Re-apply search highlighting after render completes
        if (graphRef.current) {
          highlightSearchResults(graphRef.current);
        }
        
        console.log("[GraphView] Full re-render completed");
      } catch (error) {
        console.warn("[GraphView] Error during full re-render:", error);
      }
    };

    fullRerender();
  }, [resetTrigger, data, highlightSearchResults]);

  // Update node/edge styles when selection changes (without redrawing graph)
  useEffect(() => {
    if (!graphRef.current || !data) return;

    const updateStyles = async () => {
      try {
        // Update node styles based on selection
        data.nodes?.forEach((node: any) => {
          const isSelected = selectedItems.has(node.id);
          graphRef.current?.updateNodeData([{
            id: node.id,
            style: {
              fill: isSelected ? "#1890ff" : "#87d068",
              lineWidth: isSelected ? 3 : 1,
              stroke: isSelected ? "#1890ff" : "#666",
            },
          }]);
        });

        // Update edge styles based on selection
        data.edges?.forEach((edge: any) => {
          const isSelected = selectedItems.has(edge.id);
          graphRef.current?.updateEdgeData([{
            id: edge.id,
            style: {
              stroke: isSelected ? '#1890ff' : '#ccc',
              lineWidth: isSelected ? 2 : 1,
            },
          }]);
        });

        // Draw immediately to show style changes
        await graphRef.current?.draw();
      } catch (error) {
        console.warn("[GraphView] Error updating selection styles:", error);
      }
    };

    updateStyles();
  }, [selectedItems, data]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div ref={containerRef} className="graph-view flex-1" />
    </div>
  );
});

export default GraphView;
