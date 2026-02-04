import { useEffect, useRef, useCallback, memo } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { useToast } from "@/components/ui/toast";
import {
  HYPERGRAPH_NODE_STYLES,
  HYPERGRAPH_EDGE_STYLES,
  HYPERGRAPH_EDGE_DEFAULT_STYLE,
  HYPEREDGE_COLOR_PALETTE,
  HYPEREDGE_STATE_OVERRIDES,
  HYPEREDGE_OPACITY,
  HYPEREDGE_STROKE_OPACITY,
  getNodeVisualState,
  getEdgeVisualState,
  getHyperedgeColorByIndex,
  getHyperedgeColorByState,
  VisualState,
} from "@/theme/visual-config";

// Use global G6 (imported via g6.min.js in index.html)
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
      linked_nodes: string[];
      data: any;
      highlighted?: boolean;
    }>;
  };
  meta: any;
}

const HypergraphView = memo(function HypergraphView({ data, meta }: HypergraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const hyperedgesRef = useRef<Map<string, any>>(new Map()); // Store hyperedges for click detection
  const hyperedgeColorsRef = useRef<Map<string, { fill: string; stroke: string }>>(new Map()); // Store original colors
  const selectedItemsRef = useRef(new Map());
  const { selectedItems, selectItem, deselectItem, clearSelection, resetTrigger } = useVisualization();
  const { addToast } = useToast();

  // Keep ref in sync with state
  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  const handleNodeClick = useCallback(
    (evt: any) => {
      const nodeId = evt.target?.id;
      if (!nodeId) return;

      selectItem(nodeId, "node");
    },
    [selectItem]
  );

  const handleHyperedgeClick = useCallback(
    (hyperedgeId: string) => {
      selectItem(hyperedgeId, "hyperedge");
    },
    [selectItem]
  );

  const handleKeyDown = useCallback((evt: KeyboardEvent) => {
    if (evt.key === 'Escape') {
      clearSelection();
    } else if ((evt.ctrlKey || evt.metaKey) && evt.key === 'f') {
      evt.preventDefault();
      addToast('Search panel activated', 'info');
    } else if (evt.key === 'Delete' && selectedItemsRef.current.size > 0) {
      selectedItemsRef.current.forEach((item) => {
        deselectItem(item.id);
      });
      addToast('Selection cleared', 'success');
    }
  }, [clearSelection, deselectItem, addToast]);

  const highlightSearchResults = useCallback((graph: any) => {
    if (!graph) return;

    try {
      const allNodeData = graph.getNodeData() || [];

      allNodeData.forEach((nodeData: any) => {
        const nodeId = nodeData.id;
        // 只检查数据中的 highlighted 标志位，不再从搜索结果中获取
        if (nodeData.highlighted) {
          graph.setElementState(nodeId, ['highlight']);
        } else {
          // 清除节点的高亮状态（保留其他状态如selected）
          const currentStates = graph.getElementState(nodeId) || [];
          const newStates = currentStates.filter((state: string) => state !== 'highlight');
          graph.setElementState(nodeId, newStates);
        }
      });
    } catch (error) {
      console.warn("[HypergraphView] Error in highlightSearchResults:", error);
    }
  }, []);

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
        const paletteColors = getHyperedgeColorByIndex(index);
        // Store hyperedge metadata and original colors for click detection and style updates
        hyperedgesRef.current.set(hyperedge.id, hyperedge);
        hyperedgeColorsRef.current.set(hyperedge.id, paletteColors);

        // Check if this hyperedge is selected or highlighted
        const isSelected = selectedItems.has(hyperedge.id);
        const isHighlighted = hyperedge.highlighted === true;
        
        // Determine visual state and get corresponding colors
        const visualState = isHighlighted 
          ? VisualState.HIGHLIGHTED 
          : (isSelected ? VisualState.SELECTED : VisualState.NORMAL);
        const activeColors = getHyperedgeColorByState(visualState, index);
        const fillOpacity = HYPEREDGE_OPACITY[visualState];
        const strokeOpacity = HYPEREDGE_STROKE_OPACITY[visualState];

        return {
          key: `bubble-sets-${hyperedge.id}`,
          type: 'bubble-sets',
          members: hyperedge.linked_nodes,
          fill: activeColors.fill,
          fillOpacity: fillOpacity,
          stroke: activeColors.stroke,
          strokeOpacity: strokeOpacity,
          label: false,
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
        },
        edge: {
          style: {
            labelText: (d: any) => d.data?.label || '',
            fontSize: 10,
            ...HYPERGRAPH_EDGE_DEFAULT_STYLE,
          },
        },
        data: {
          nodes: data.nodes.map((node: any) => {
            const isSelected = selectedItems.has(node.id);
            const isHighlighted = node.highlighted === true;
            const visualState = getNodeVisualState(isSelected, isHighlighted);
            const nodeStyle = HYPERGRAPH_NODE_STYLES[visualState];
            
            return {
              ...node,
              style: {
                ...node.style,
                fill: nodeStyle.fill,
                lineWidth: nodeStyle.lineWidth,
                stroke: nodeStyle.stroke,
              },
            };
          }),
          edges: (data.edges || []).map((edge: any) => {
            const edgeStyle = HYPERGRAPH_EDGE_STYLES[VisualState.NORMAL];
            return {
              ...edge,
              style: {
                stroke: edgeStyle.stroke,
                lineWidth: edgeStyle.lineWidth,
                opacity: edgeStyle.opacity,
                ...edge.style,
              },
            };
          }),
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

  // Re-render graph when reset is triggered (full refresh with cold-start layout)
  useEffect(() => {
    if (!graphRef.current || resetTrigger === 0) return;

    const fullRerender = async () => {
      try {
        // Validate graph instance before proceeding
        if (!graphRef.current) {
          console.warn("[HypergraphView] Graph instance is null, skipping re-render");
          return;
        }

        console.log("[HypergraphView] Full re-render with cold-start layout...");
        
        // Clear node coordinates for cold-start layout (not based on current positions)
        const cleanNodes = data.nodes.map(({ x, y, ...rest }: any) => rest);
        
        // Re-set data with cleaned coordinates
        // setData() will trigger layout reconciliation automatically
        graphRef.current.setData({
          nodes: cleanNodes,
          edges: data.edges || [],
        });
        
        // Full render: triggers data reconciliation -> layout calculation -> drawing
        // This will also recalculate BubbleSet hyperedge paths
        // Note: No need to explicitly call stopLayout() - G6 handles this internally
        await graphRef.current.render();
        
        // Re-apply search highlighting after render completes
        if (graphRef.current) {
          highlightSearchResults(graphRef.current);
        }
        
        console.log("[HypergraphView] Full re-render completed");
      } catch (error) {
        console.warn("[HypergraphView] Error during full re-render:", error);
      }
    };

    fullRerender();
  }, [resetTrigger, data, highlightSearchResults]);

  // Update hyperedge and node styles when selection changes (without redrawing)
  useEffect(() => {
    if (!graphRef.current || !data) return;

    const updateStyles = async () => {
      try {
        // Update node styles based on selection and highlight state
        data.nodes?.forEach((node: any) => {
          const isSelected = selectedItems.has(node.id);
          const isHighlighted = node.highlighted === true;
          const visualState = getNodeVisualState(isSelected, isHighlighted);
          const nodeStyle = HYPERGRAPH_NODE_STYLES[visualState];
          
          graphRef.current?.updateNodeData([{
            id: node.id,
            style: {
              fill: nodeStyle.fill,
              lineWidth: nodeStyle.lineWidth,
              stroke: nodeStyle.stroke,
            },
          }]);
        });

        // Update hyperedge (bubble-sets) styles based on selection and highlight state
        data.hyperedges?.forEach((hyperedge: any, index: number) => {
          const isSelected = selectedItems.has(hyperedge.id);
          const isHighlighted = hyperedge.highlighted === true;
          
          // Determine visual state and get corresponding colors and opacities
          const visualState = isHighlighted 
            ? VisualState.HIGHLIGHTED 
            : (isSelected ? VisualState.SELECTED : VisualState.NORMAL);
          const activeColors = getHyperedgeColorByState(visualState, index);
          const fillOpacity = HYPEREDGE_OPACITY[visualState];
          const strokeOpacity = HYPEREDGE_STROKE_OPACITY[visualState];

          const pluginKey = `bubble-sets-${hyperedge.id}`;

          try {
            graphRef.current?.updatePlugin({
              key: pluginKey,
              fill: activeColors.fill,
              fillOpacity: fillOpacity,
              stroke: activeColors.stroke,
              strokeOpacity: strokeOpacity,
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
