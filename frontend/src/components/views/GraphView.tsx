import { useEffect, useRef, useCallback, memo } from "react";
import * as G6 from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { useSearch } from "@/hooks/useSearch";
import { Tooltip, message } from "antd";
import "@/components/views/GraphView.css";

interface GraphViewProps {
  data: any;
  meta: any;
}

const GraphView = memo(function GraphView({ data, meta }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { selectedNodes, selectNode, deselectNode, clearSelection } = useVisualization();
  const { results: searchResults } = useSearch();

  const handleNodeClick = useCallback(
    (evt: any) => {
      const nodeModel = evt.item;
      if (!nodeModel) return;

      const nodeId = nodeModel.get("id");
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
    const nodeModel = evt.item;
    if (!nodeModel || !tooltipRef.current) return;

    const nodeData = nodeModel.getModel();
    const { x, y } = nodeModel.getModel();
    
    // 构建 Tooltip 内容
    const content = `
      <div class="graph-node-tooltip">
        <div class="tooltip-title">${nodeData.label || nodeData.id}</div>
        <div class="tooltip-id">ID: ${nodeData.id}</div>
        ${nodeData.description ? `<div class="tooltip-desc">${nodeData.description}</div>` : ''}
        ${nodeData.value !== undefined ? `<div class="tooltip-value">Value: ${nodeData.value}</div>` : ''}
      </div>
    `;

    tooltipRef.current.innerHTML = content;
    tooltipRef.current.style.display = 'block';
    tooltipRef.current.style.left = (x ?? 0) + 10 + 'px';
    tooltipRef.current.style.top = (y ?? 0) + 10 + 'px';
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
  const highlightSearchResults = useCallback((graph: any) => {
    if (!graph) return;

    const allNodes = (graph as any).getNodes();
    const searchResultSet = new Set(searchResults);

    allNodes.forEach((node: any) => {
      const nodeId = node.getID();
      if (searchResultSet.has(nodeId)) {
        node.toFront();
        (graph as any).setItemState(node, 'highlight', true);
      } else {
        (graph as any).setItemState(node, 'highlight', false);
      }
    });

    // 如果有搜索结果，聚焦到第一个
    if (searchResults.length > 0) {
      const firstResult = (graph as any).findById(searchResults[0]);
      if (firstResult) {
        (graph as any).focusItem(firstResult, true);
      }
    }
  }, [searchResults]);

  useEffect(() => {
    if (!containerRef.current || !data.nodes) return;

    // Clean up old graph
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 注册自定义节点状态样式
    if (!(G6 as any).registered('highlight')) {
      (G6 as any).registerBehavior('highlight', {
        getEvents() {
          return {
            'node:mouseenter': 'onNodeEnter',
            'node:mouseleave': 'onNodeLeave',
          };
        },
        onNodeEnter(evt: any) {
          const { item } = evt;
          (this.graph as any).setItemState(item, 'highlight', true);
        },
        onNodeLeave(evt: any) {
          const { item } = evt;
          (this.graph as any).setItemState(item, 'highlight', false);
        },
      });
    }

    // Create new graph
    const graph = new (G6 as any).Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      modes: {
        default: ["drag-canvas", "zoom-canvas", "drag-node"],
      },
      nodeStateStyles: {
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
      edgeStateStyles: {
        highlight: {
          stroke: '#faad14',
          lineWidth: 2,
          opacity: 1,
        },
      },
    });

    // Add data
    (graph as any).data({
      nodes: data.nodes.map((node: any) => ({
        ...node,
        size: 30,
        style: {
          fill: selectedNodes.has(node.id) ? "#1890ff" : "#87d068",
          lineWidth: selectedNodes.has(node.id) ? 3 : 1,
          stroke: selectedNodes.has(node.id) ? "#1890ff" : "#666",
        },
      })),
      edges: (data.edges || []).map((edge: any) => ({
        ...edge,
        style: {
          stroke: '#ccc',
          lineWidth: 1,
        },
      })),
    });

    // Event handlers
    graph.on("node:click", handleNodeClick);
    graph.on("canvas:click", handleCanvasClick);
    graph.on("node:mouseenter", handleNodeMouseEnter);
    graph.on("node:mouseleave", handleNodeMouseLeave);

    // 双击节点展开相邻节点
    graph.on("node:dblclick", (evt: any) => {
      const nodeModel = evt.item;
      if (!nodeModel) return;
      const neighbors = (graph as any).getNeighbors(nodeModel);
      neighbors.forEach((neighbor: any) => {
        (graph as any).setItemState(neighbor, 'highlight', true);
      });
    });

    // Render
    graph.render();

    // 应用搜索高亮
    highlightSearchResults(graph);

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        (graph as any).changeSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    graphRef.current = graph;

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      graph.destroy();
    };
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
