import { useEffect, useRef, useCallback, memo } from "react";
import { Graph, NodeEvent, CanvasEvent } from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { useSearch } from "@/hooks/useSearch";
import { message } from "antd";

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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { selectedNodes, selectNode, deselectNode, clearSelection } = useVisualization();
  const { results: searchResults } = useSearch();

  const handleNodeClick = useCallback(
    (evt: any) => {
      const nodeId = evt.target?.id;
      if (!nodeId) return;

      if (selectedNodes.has(nodeId)) {
        deselectNode(nodeId);
      } else {
        selectNode(nodeId);
      }
    },
    [selectedNodes, selectNode, deselectNode]
  );

  const handleCanvasClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleNodeMouseEnter = useCallback((evt: any) => {
    const nodeId = evt.target?.id;
    if (!nodeId || !tooltipRef.current || !graphRef.current) return;

    try {
      const nodeData = graphRef.current.getNodeData(nodeId);
      if (!nodeData) return;

      const position = graphRef.current.getElementPosition(nodeId);
      const [x, y] = position || [0, 0];

      const content = `
        <div class="graph-node-tooltip">
          <div class="tooltip-title">${nodeData.data?.label || nodeData.id}</div>
          <div class="tooltip-id">ID: ${nodeData.id}</div>
          ${nodeData.data?.description ? `<div class="tooltip-desc">${nodeData.data.description}</div>` : ''}
          ${nodeData.data?.value !== undefined ? `<div class="tooltip-value">Value: ${nodeData.data.value}</div>` : ''}
        </div>
      `;

      tooltipRef.current.innerHTML = content;
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = x + 10 + 'px';
      tooltipRef.current.style.top = y + 10 + 'px';
    } catch (error) {
      console.warn("[HypergraphView] Error in handleNodeMouseEnter:", error);
    }
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);

  const handleKeyDown = useCallback((evt: KeyboardEvent) => {
    if (evt.key === 'Escape') {
      clearSelection();
    } else if ((evt.ctrlKey || evt.metaKey) && evt.key === 'f') {
      evt.preventDefault();
      message.info('搜索面板已激活');
    } else if (evt.key === 'Delete' && selectedNodes.size > 0) {
      selectedNodes.forEach((nodeId) => {
        deselectNode(nodeId);
      });
      message.success('已清除选中节点');
    }
  }, [selectedNodes, clearSelection, deselectNode]);

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
    console.log("[HypergraphView] useEffect triggered");
    console.log("[HypergraphView] data:", data);
    console.log("[HypergraphView] data.nodes:", data?.nodes?.length || 0);
    console.log("[HypergraphView] data.edges:", data?.edges?.length || 0);
    console.log("[HypergraphView] data.hyperedges:", data?.hyperedges?.length || 0);

    if (!containerRef.current || !data?.nodes) {
      console.warn("[HypergraphView] Missing containerRef or data.nodes");
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
        return {
          key: `bubble-sets-${hyperedge.id}`,
          type: 'bubble-sets',
          members: hyperedge.node_set,
          labelText: hyperedge.label,
          fill: colors.fill,
          fillOpacity: 0.1,
          stroke: colors.stroke,
          strokeOpacity: 1,
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
          nodes: data.nodes.map((node: any) => ({
            ...node,
            style: {
              ...node.style,
              fill: selectedNodes.has(node.id) ? "#1890ff" : "#87d068",
              lineWidth: selectedNodes.has(node.id) ? 3 : 1,
              stroke: selectedNodes.has(node.id) ? "#1890ff" : "#666",
            },
          })),
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
      const canvasClickHandler = handleCanvasClick;
      const nodeEnterHandler = handleNodeMouseEnter;
      const nodeLeaveHandler = handleNodeMouseLeave;

      graph.on(NodeEvent.CLICK, nodeClickHandler);
      graph.on(CanvasEvent.CLICK, canvasClickHandler);
      graph.on(NodeEvent.POINTER_ENTER, nodeEnterHandler);
      graph.on(NodeEvent.POINTER_LEAVE, nodeLeaveHandler);

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

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);

        if (graphRef.current) {
          try {
            graphRef.current.off(NodeEvent.CLICK, nodeClickHandler);
            graphRef.current.off(CanvasEvent.CLICK, canvasClickHandler);
            graphRef.current.off(NodeEvent.POINTER_ENTER, nodeEnterHandler);
            graphRef.current.off(NodeEvent.POINTER_LEAVE, nodeLeaveHandler);
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
  }, [data, selectedNodes, handleNodeClick, handleCanvasClick, handleNodeMouseEnter, handleNodeMouseLeave, handleKeyDown, highlightSearchResults]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="hypergraph-view" style={{ width: '100%', height: '100%' }} />
      <div
        ref={tooltipRef}
        className="graph-tooltip"
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default HypergraphView;
