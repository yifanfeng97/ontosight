import { useEffect, useRef, useCallback, memo } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { useSearch } from "@/hooks/useSearch";
import { useToast } from "@/components/ui/toast";

// 使用全局 G6（通过 index.html 中的 script 标签引入 g6.min.js）
declare global {
  interface Window {
    G6: any;
  }
}

interface HypergraphViewProps {
  data: {
    nodes: any[];
    edges: any[];
    hyperedges: Array<{
      id: string;
      label: string;
      node_set: string[];
      data: any;
    }>;
  };
  meta: any;
}

// 颜色调色板，为每个超边生成不同颜色
const HYPEREDGE_COLORS = [
  { fill: "#1890FF", stroke: "#0050B3" },
  { fill: "#52C41A", stroke: "#274704" },
  { fill: "#FA8C16", stroke: "#872000" },
  { fill: "#EB2F96", stroke: "#780C56" },
  { fill: "#13C2C2", stroke: "#0C464C" },
  { fill: "#722ED1", stroke: "#38165F" },
  { fill: "#F5222D", stroke: "#7F0000" },
  { fill: "#FA541C", stroke: "#7F2C00" },
  { fill: "#FFC53D", stroke: "#7F6400" },
  { fill: "#45B39D", stroke: "#0F5C4C" },
];

function getHyperedgeColor(index: number) {
  return HYPEREDGE_COLORS[index % HYPEREDGE_COLORS.length];
}

// 选中状态的超边颜色
const SELECTED_HYPEREDGE_COLOR = { fill: "#1890ff", stroke: "#0050b3" };

const HypergraphView = memo(function HypergraphView({ data, meta }: HypergraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const hyperedgesRef = useRef<Map<string, any>>(new Map()); // Store hyperedges for click detection
  const hyperedgeColorsRef = useRef<Map<string, { fill: string; stroke: string }>>(new Map()); // Store original colors
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

  const handleHyperedgeClick = useCallback(
    (hyperedgeId: string) => {
      if (selectedItemsRef.current.has(hyperedgeId)) {
        deselectItem(hyperedgeId);
      } else {
        selectItem(hyperedgeId, "hyperedge");
      }
    },
    [selectItem, deselectItem]
  );

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

  const highlightSearchResults = useCallback((graph: any) => {
    if (!graph) return;

    try {
      const allNodeData = graph.getNodeData() || [];
      const searchResultSet = new Set(searchResults);

      allNodeData.forEach((nodeData: any) => {
        const nodeId = nodeData.id;
        if (searchResultSet.has(nodeId)) {
          graph.setElementState(nodeId, ['highlight']);
        } else {
          const currentStates = graph.getElementState(nodeId) || [];
          const newStates = currentStates.filter((state: string) => state !== 'highlight');
          graph.setElementState(nodeId, newStates);
        }
      });

      if (searchResults.length > 0) {
        graph.focusElement(searchResults[0]);
      }
    } catch (error) {
      console.warn("[HypergraphView] Error in highlightSearchResults:", error);
    }
  }, [searchResults]);

  useEffect(() => {
    // 检查 G6 是否已加载（通过 index.html 中的 script 标签引入）
    if (!containerRef.current || !data?.nodes || !window.G6) {
      return;
    }

    // Clean up old graph
    if (graphRef.current) {
      try {
        graphRef.current.destroy();
      } catch (e) {
        console.warn("[HypergraphView] Error destroying previous graph:", e);
      }
      graphRef.current = null;
    }

    try {
      // Clear old hyperedge data before rebuilding
      hyperedgesRef.current.clear();
      hyperedgeColorsRef.current.clear();

      // Build bubble-sets plugins from hyperedges
      const bubbleSetPlugins = (data.hyperedges || []).map((hyperedge, index) => {
        const colors = getHyperedgeColor(index);
        // Store hyperedge metadata and original colors for click detection and style updates
        hyperedgesRef.current.set(hyperedge.id, hyperedge);
        hyperedgeColorsRef.current.set(hyperedge.id, colors);

        // Check if this hyperedge is already selected
        const isSelected = selectedItems.has(hyperedge.id);
        const activeColors = isSelected ? SELECTED_HYPEREDGE_COLOR : colors;

        return {
          key: `bubble-sets-${hyperedge.id}`,
          type: 'bubble-sets',
          members: hyperedge.node_set,
          labelText: hyperedge.label,
          fill: activeColors.fill,
          fillOpacity: isSelected ? 0.3 : 0.1,
          stroke: activeColors.stroke,
          strokeOpacity: isSelected ? 1 : 0.6,
          label: true,
          labelCloseToPath: false,
          labelPlacement: 'top',
          labelBackgroundFill: activeColors.stroke,
          labelFill: '#fff',
          labelPadding: 3,
          labelBackgroundRadius: 4,
          // Store hyperedge data for click event detection (reference: HypergraphViewer)
          hyperedge: hyperedge,
        };
      });

      // Create new graph with G6 (使用全局 window.G6，参考 HypergraphViewer)
      const graph = new window.G6.Graph({
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
            stroke: '#B4E5FF',
            opacity: 0.6,
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
          nodes: data.nodes.map((node: any) => {
            const isSelected = selectedItems.has(node.id);
            return {
              ...node,
              style: {
                ...node.style,
                fill: isSelected ? "#1890ff" : "#87d068",
                lineWidth: isSelected ? 3 : 1,
                stroke: isSelected ? "#1890ff" : "#666",
              },
            };
          }),
          edges: (data.edges || []).map((edge: any) => ({
            ...edge,
            style: {
              stroke: '#B4E5FF',
              lineWidth: 1,
              opacity: 0.6,
              ...edge.style,
            },
          })),
        },
        plugins: bubbleSetPlugins,
        autoFit: 'center',
      });

      // Register event handlers for nodes
      graph.on("node:click", handleNodeClick);

      // Helper function to handle bubble-sets click
      const handleBubbleSetsEvent = (evt: any) => {
        if (evt.targetType === "bubble-sets") {
          const target = evt.target?.options || evt.target;
          console.log("[HypergraphView] Bubble-sets event:", target);
          if (target) {
            // Try to get hyperedge id directly from stored hyperedge data
            if (target.hyperedge?.id) {
              handleHyperedgeClick(target.hyperedge.id);
              return true;
            }
            // Fallback: find hyperedge by key
            const key = target.key?.replace('bubble-sets-', '');
            if (key && hyperedgesRef.current.has(key)) {
              handleHyperedgeClick(key);
              return true;
            }
            // Fallback: find by members
            for (const [hyperedgeId, hyperedgeData] of hyperedgesRef.current.entries()) {
              const targetMembers = target.members || [];
              if (hyperedgeData.node_set &&
                  targetMembers.length === hyperedgeData.node_set.length &&
                  targetMembers.every((m: string) => hyperedgeData.node_set.includes(m))) {
                handleHyperedgeClick(hyperedgeId);
                return true;
              }
            }
          }
        }
        return false;
      };

      // Register global click handler to detect bubble-sets clicks
      // Reference: HypergraphViewer uses graph.on("pointermove", ...) with targetType === "bubble-sets"
      graph.on("click", (evt: any) => {
        console.log("[HypergraphView] Click event:", evt.targetType, evt.target);

        // Check if clicked on a bubble-sets (hyperedge)
        if (handleBubbleSetsEvent(evt)) {
          return;
        }

        // Check if clicked on node (already handled by NodeEvent.CLICK, but just in case)
        if (evt.targetType === "node") {
          return; // Let NodeEvent.CLICK handle it
        }

        // Check if clicked on canvas (empty area)
        if (evt.targetType === "canvas") {
          clearSelection();
          return;
        }
      });

      // Also listen to pointerdown for bubble-sets (some versions of G6 may use this)
      graph.on("pointerdown", (evt: any) => {
        if (evt.targetType === "bubble-sets") {
          console.log("[HypergraphView] Pointerdown on bubble-sets:", evt.target);
          handleBubbleSetsEvent(evt);
        }
      });

      // Listen to pointermove to detect hovering over bubble-sets (like HypergraphViewer)
      graph.on("pointermove", (evt: any) => {
        if (evt.targetType === "bubble-sets") {
          // Set cursor to pointer when hovering over hyperedge
          if (containerRef.current) {
            containerRef.current.style.cursor = "pointer";
          }
        } else if (evt.targetType === "canvas") {
          if (containerRef.current) {
            containerRef.current.style.cursor = "default";
          }
        }
      });

      // Double-click to highlight neighbors
      graph.on("node:dblclick", (evt: any) => {
        try {
          const nodeId = evt.target?.id;
          if (!nodeId) return;
          const neighbors = graph.getNeighborNodesData(nodeId) || [];
          neighbors.forEach((neighbor: any) => {
            graph.setElementState(neighbor.id, ['highlight']);
          });
        } catch (error) {
          console.warn("[HypergraphView] Error in dblclick handler:", error);
        }
      });

      // Render and apply search highlighting
      graph.render().then(() => {
        console.log("[HypergraphView] Graph rendered successfully");
        highlightSearchResults(graph);
      }).catch((error: any) => {
        console.error("[HypergraphView] Error rendering graph:", error);
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
            console.warn("[HypergraphView] Error resizing graph:", error);
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
            graphRef.current.destroy();
            graphRef.current = null;
          } catch (e) {
            console.warn("[HypergraphView] Error in cleanup:", e);
          }
        }
      };
    } catch (error) {
      console.error("[HypergraphView] Error creating graph:", error);
      return () => { };
    }
  }, [data, handleNodeClick, handleHyperedgeClick, handleKeyDown, highlightSearchResults]);

  // Re-layout graph when reset is triggered
  useEffect(() => {
    if (!graphRef.current || resetTrigger === 0) return;

    const relayout = async () => {
      try {
        console.log("[HypergraphView] Relayouting graph...");
        // Stop any ongoing layout
        graphRef.current?.stopLayout();
        // Trigger new layout calculation
        await graphRef.current?.layout();
        console.log("[HypergraphView] Relayout completed");
      } catch (error) {
        console.warn("[HypergraphView] Error relayouting graph on reset:", error);
      }
    };

    relayout();
  }, [resetTrigger]);

  // Update hyperedge and node styles when selection changes (without redrawing)
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

        // Update hyperedge (bubble-sets) styles based on selection
        data.hyperedges?.forEach((hyperedge: any) => {
          const isSelected = selectedItems.has(hyperedge.id);
          const originalColors = hyperedgeColorsRef.current.get(hyperedge.id);
          if (!originalColors) return;

          const activeColors = isSelected ? SELECTED_HYPEREDGE_COLOR : originalColors;
          const pluginKey = `bubble-sets-${hyperedge.id}`;

          try {
            graphRef.current?.updatePlugin({
              key: pluginKey,
              fill: activeColors.fill,
              fillOpacity: isSelected ? 0.3 : 0.1,
              stroke: activeColors.stroke,
              strokeOpacity: isSelected ? 1 : 0.6,
              labelBackgroundFill: activeColors.stroke,
            });
          } catch (e) {
            console.warn("[HypergraphView] Error updating plugin:", pluginKey, e);
          }
        });

        // Draw immediately to show style changes
        await graphRef.current?.draw();
      } catch (error) {
        console.warn("[HypergraphView] Error updating selection styles:", error);
      }
    };

    updateStyles();
  }, [selectedItems, data]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div ref={containerRef} className="hypergraph-view flex-1" />
    </div>
  );
});

export default HypergraphView;
