import { useEffect, useRef, useCallback, memo } from "react";
import { Graph, NodeEvent, CanvasEvent } from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { useSearch } from "@/hooks/useSearch";
import { message } from "antd";
import "@/components/views/GraphView.css";

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

  // 处理节点悬停时的 Tooltip
  const handleNodeMouseEnter = useCallback((evt: any) => {
    const nodeId = evt.target?.id;
    if (!nodeId || !tooltipRef.current || !graphRef.current) return;

    try {
      const nodeData = graphRef.current.getNodeData(nodeId);
      if (!nodeData) return;

      const position = graphRef.current.getElementPosition(nodeId);
      const [x, y] = position || [0, 0];

      // 构建 Tooltip 内容
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
      console.warn("[GraphView] Error in handleNodeMouseEnter:", error);
    }
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);

  // 键盘快捷键处理
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

  useEffect(() => {
    console.log("[GraphView] useEffect triggered");
    console.log("[GraphView] data:", data);
    console.log("[GraphView] data.nodes:", data?.nodes?.length || 0);
    console.log("[GraphView] data.edges:", data?.edges?.length || 0);

    if (!containerRef.current || !data?.nodes) {
      console.warn("[GraphView] Missing containerRef or data.nodes");
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
            // Prevent nodes from overlapping by specifying a collision radius for each node.
            radius: (d: any) => d.size / 2,
          },
          preventOverlap: true,

          // nodeSpacing: 50,
          // nodeStrength: -150,
          // edgeStrength: 0.1,
          // iterations: 300,
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
          nodes: data.nodes.map((node: any) => ({
            ...node,
            style: {
              ...node.style,
              fill: selectedNodes.has(node.id) ? "#1890ff" : "#87d068",
              lineWidth: selectedNodes.has(node.id) ? 3 : 1,
              stroke: selectedNodes.has(node.id) ? "#1890ff" : "#666",
            },
          })),
          edges: processParallelEdges((data.edges || []).map((edge: any) => ({
            ...edge,
            style: {
              stroke: '#ccc',
              lineWidth: 1,
              ...edge.style,
            },
          }))),
        },
      });

      // Register event handlers with proper G6 v5 API
      const nodeClickHandler = handleNodeClick;
      const canvasClickHandler = handleCanvasClick;
      const nodeEnterHandler = handleNodeMouseEnter;
      const nodeLeaveHandler = handleNodeMouseLeave;

      graph.on(NodeEvent.CLICK, nodeClickHandler);
      graph.on(CanvasEvent.CLICK, canvasClickHandler);
      graph.on(NodeEvent.POINTER_ENTER, nodeEnterHandler);
      graph.on(NodeEvent.POINTER_LEAVE, nodeLeaveHandler);

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
            graphRef.current.off(CanvasEvent.CLICK, canvasClickHandler);
            graphRef.current.off(NodeEvent.POINTER_ENTER, nodeEnterHandler);
            graphRef.current.off(NodeEvent.POINTER_LEAVE, nodeLeaveHandler);

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
  }, [data, selectedNodes, handleNodeClick, handleCanvasClick, handleNodeMouseEnter, handleNodeMouseLeave, handleKeyDown, highlightSearchResults]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="graph-view" />
      <div
        ref={tooltipRef}
        className="graph-tooltip"
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default GraphView;
