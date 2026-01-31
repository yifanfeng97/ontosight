import { useEffect, useRef, useCallback, memo } from "react";
import { Graph, NodeEvent, CanvasEvent } from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { useSearch } from "@/hooks/useSearch";
import { useToast } from "@/components/ui/toast";

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

const HypergraphView = memo(function HypergraphView({ data, meta }: HypergraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const hyperedgesRef = useRef<Map<string, any>>(new Map()); // Store hyperedges for click detection
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

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleNodeMouseLeave = useCallback(() => {
    // Tooltip removed
  }, []);

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
    if (!containerRef.current || !data?.nodes) {
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
      // Build bubble-sets plugins from hyperedges
      const bubbleSetPlugins = (data.hyperedges || []).map((hyperedge, index) => {
        const colors = getHyperedgeColor(index);
        // Store hyperedge metadata for click detection
        hyperedgesRef.current.set(hyperedge.id, hyperedge);
        return {
          key: `bubble-sets-${hyperedge.id}`,
          type: 'bubble-sets',
          members: hyperedge.node_set,
          labelText: hyperedge.label,
          fill: colors.fill,
          fillOpacity: 0.1,
          stroke: colors.stroke,
          strokeOpacity: 0.6,
          label: true,
          labelCloseToPath: false,
          labelPlacement: 'top',
          labelBackgroundFill: colors.stroke,
          labelFill: '#fff',
          labelPadding: 3,
          labelBackgroundRadius: 4,
        };
      });

      // Create new graph with G6 v5 config
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

      // Register event handlers
      const nodeClickHandler = handleNodeClick;
      const canvasClickHandler = (evt: any) => {
        // Check if clicked on a hyperedge label
        const target = evt.target;
        if (target && target.textContent) {
          // Try to find which hyperedge this label belongs to
          for (const [hyperedgeId, hyperedgeData] of hyperedgesRef.current.entries()) {
            if (target.textContent.includes(hyperedgeData.label)) {
              handleHyperedgeClick(hyperedgeId);
              return;
            }
          }
        }
        // Otherwise, clear selection
        clearSelection();
      };

      graph.on(NodeEvent.CLICK, nodeClickHandler);
      graph.on(CanvasEvent.CLICK, canvasClickHandler);

      // Double-click to highlight neighbors
      graph.on(NodeEvent.DBLCLICK, (evt: any) => {
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
      }).catch((error) => {
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
  hyperedgesRef.current.clear();
          
      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);

        if (graphRef.current) {
          try {
            graphRef.current.off(NodeEvent.CLICK, nodeClickHandler);
            graphRef.current.off(CanvasEvent.CLICK, canvasClickHandler);
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
