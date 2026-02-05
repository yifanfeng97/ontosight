import { useEffect, useRef, useCallback, memo } from "react";
import { Graph, NodeEvent, EdgeEvent, CanvasEvent } from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { 
  GRAPH_NODE_STYLES, 
  GRAPH_EDGE_STYLES, 
  VisualState, 
  LAYOUT_SPACING_CONFIG 
} from "@/theme/visual-config";

interface GraphViewProps {
  data: any;
  meta?: any;
}

/**
 * GraphView 组件 - 使用 AntV G6 v5 构建的图引擎
 * 已重构：
 * 1. 使用 G6 v5 内部状态系统 (State System) 管理选中和高亮
 * 2. 使用内置 transforms 处理平行边
 * 3. 移除冗余的样式计算和手动更新逻辑
 * 4. 移除键盘监听，纯鼠标交互
 */
const GraphView = memo(function GraphView({ data }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const { selectedItems, selectItem, clearSelection, resetTrigger } = useVisualization();

  // 统一的状态更新函数
  const updateGraphStates = useCallback((currentData: any, currentSelection: Map<string, any>) => {
    const graph = graphRef.current;
    if (!graph || graph.destroyed || !currentData) return;

    const stateMap: Record<string, string[]> = {};

    // 处理节点状态
    currentData.nodes?.forEach((node: any) => {
      const states: string[] = [];
      if (currentSelection.has(node.id)) states.push(VisualState.SELECTED);
      if (node.highlighted) states.push(VisualState.HIGHLIGHTED);
      stateMap[node.id] = states;
    });

    // 处理边状态
    currentData.edges?.forEach((edge: any) => {
      const states: string[] = [];
      if (currentSelection.has(edge.id)) states.push(VisualState.SELECTED);
      if (edge.highlighted) states.push(VisualState.HIGHLIGHTED);
      stateMap[edge.id] = states;
    });

    graph.setElementState(stateMap);
  }, []);

  // 处理数据更新 (受控于 data prop)
  useEffect(() => {
    const graph = graphRef.current;
    if (graph && !graph.destroyed && data) {
      graph.setData(data);
      graph.render().then(() => {
        if (!graph.destroyed) {
          updateGraphStates(data, selectedItems);
        }
      });
    }
  }, [data, updateGraphStates, selectedItems]);

  // 单独监听选中项变化（数据未变时，仅切换状态，极快）
  useEffect(() => {
    updateGraphStates(data, selectedItems);
  }, [selectedItems, data, updateGraphStates]);

  // 图实例生命周期管理（全量重建）
  useEffect(() => {
    if (!containerRef.current || !data?.nodes) return;

    // 如果已存在实例，先销毁
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 准备基础数据（重置逻辑下清除坐标以触发冷启动布局）
    const initialNodes = data.nodes.map(({ x, y, ...rest }: any) => rest);
    const initialEdges = data.edges || [];

    try {
      const graph = new Graph({
        container: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: {
          type: 'force',
          collide: {
            radius: LAYOUT_SPACING_CONFIG.nodeCollideRadius,
          },
          preventOverlap: true,
          animated: true,
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
        transforms: [
          {
            type: 'process-parallel-edges',
            distance: 30, // 平行边间距
          },
        ],
        node: {
          style: {
            labelText: (d: any) => d.data?.label || d.id,
            ...GRAPH_NODE_STYLES[VisualState.DEFAULT],
          },
          state: {
            [VisualState.SELECTED]: GRAPH_NODE_STYLES[VisualState.SELECTED],
            [VisualState.HIGHLIGHTED]: GRAPH_NODE_STYLES[VisualState.HIGHLIGHTED],
          },
        },
        edge: {
          style: {
            labelText: (d: any) => d.data?.label || '',
            ...GRAPH_EDGE_STYLES[VisualState.DEFAULT],
            // 边缘标签默认为辅助信息，稍微淡一些
            labelFill: '#94a3b8',
            labelFontSize: 10,
          },
          state: {
            [VisualState.SELECTED]: GRAPH_EDGE_STYLES[VisualState.SELECTED],
            [VisualState.HIGHLIGHTED]: GRAPH_EDGE_STYLES[VisualState.HIGHLIGHTED],
          },
        },
        data: {
          nodes: initialNodes,
          edges: initialEdges,
        },
      });

      // 事件监听
      graph.on(NodeEvent.CLICK, (evt: any) => {
        const id = evt.target.id;
        if (id) selectItem(id, 'node');
      });

      graph.on(EdgeEvent.CLICK, (evt: any) => {
        const id = evt.target.id;
        if (id) selectItem(id, 'edge');
      });

      graph.on(CanvasEvent.CLICK, () => {
        clearSelection();
      });

      // 双击：高亮相邻节点
      graph.on(NodeEvent.DBLCLICK, (evt: any) => {
        const nodeId = evt.target.id;
        if (!nodeId) return;
        const neighbors = graph.getNeighborNodesData(nodeId) || [];
        const stateMapping: Record<string, string[]> = {};
        neighbors.forEach((n: any) => {
          const currentStates = graph.getElementState(n.id) || [];
          if (!currentStates.includes(VisualState.HIGHLIGHTED)) {
            stateMapping[n.id] = [...currentStates, VisualState.HIGHLIGHTED];
          }
        });
        graph.setElementState(stateMapping);
      });

      // 渲染
      graph.render().then(() => {
        if (!graph.destroyed) {
          updateGraphStates(data, selectedItems);
        }
      });

      graphRef.current = graph;

      // 响应式处理
      const handleResize = () => {
        if (containerRef.current && graphRef.current) {
          graphRef.current.resize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        graph.destroy();
        graphRef.current = null;
      };
    } catch (error) {
      console.error("[GraphView] Error initializing graph:", error);
    }
  }, [resetTrigger]); // 仅在手动重核或挂载时触发全量重建

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div ref={containerRef} className="graph-view flex-1" />
    </div>
  );
});

export default GraphView;
