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
 * 特点：
 * 1. 使用 G6 v5 内部状态系统 (State System) 管理选中和高亮
 * 2. 使用内置 transforms 处理平行边
 */
const GraphView = memo(function GraphView({ data }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const isReadyRef = useRef(false); // 追踪图表是否完成初次渲染
  const { selectedItems, selectItem, clearSelection, resetTrigger } = useVisualization();

  // 统一的状态更新函数
  const updateGraphStates = useCallback((currentData: any, currentSelection: Map<string, any>) => {
    const graph = graphRef.current;
    // 关键：如果图表未就绪或已销毁，绝对不要操作 ElementState
    if (!graph || graph.destroyed || !currentData || !isReadyRef.current) return;

    try {
      const stateMap: Record<string, string[]> = {};

      // 处理节点状态
      currentData.nodes?.forEach((node: any) => {
        // 双重检查：节点 ID 存在且 G6 已经将其挂载到内部模型中
        if (!node.id || !graph.getNodeData(node.id)) return;

        const states: string[] = [];
        if (currentSelection.has(node.id)) states.push(VisualState.SELECTED);
        if (node.highlighted) states.push(VisualState.HIGHLIGHTED);
        stateMap[node.id] = states;
      });

      // 处理边状态
      currentData.edges?.forEach((edge: any) => {
        if (!edge.id || !graph.getEdgeData(edge.id)) return;

        const states: string[] = [];
        if (currentSelection.has(edge.id)) states.push(VisualState.SELECTED);
        if (edge.highlighted) states.push(VisualState.HIGHLIGHTED);
        stateMap[edge.id] = states;
      });

      // 如果没有任何状态变化，直接返回
      if (Object.keys(stateMap).length === 0) return;
      
      graph.setElementState(stateMap);
    } catch (e) {
      // 捕获异常，防止因异步数据同步导致的 draw 错误崩溃
      // console.warn("[GraphView] Failed to update states:", e);
    }
  }, []);

  // 1. 图实例生命周期管理（全量重建与数据同步）
  useEffect(() => {
    if (!containerRef.current || !data?.nodes) return;

    // 如果已存在实例，先销毁
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 准备基础数据（重置逻辑下清除坐标以触发冷启动布局）
    const initialNodes = data.nodes.map(({ x, y, ...rest }: any) => rest);
    const initialEdges = (data.edges || []).map(({ x, y, ...rest }: any) => rest);

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
            labelBackground: true,
            ...GRAPH_NODE_STYLES[VisualState.DEFAULT],
          },
          state: {
            [VisualState.SELECTED]: {
              labelBackground: true,
              ...GRAPH_NODE_STYLES[VisualState.SELECTED],
            },
            [VisualState.HIGHLIGHTED]: {
              labelBackground: true,
              ...GRAPH_NODE_STYLES[VisualState.HIGHLIGHTED],
            },
          },
        },
        edge: {
          style: {
            labelText: (d: any) => d.data?.label || '',
            labelBackground: true, // 显式开启标签背景以增加可读性
            ...GRAPH_EDGE_STYLES[VisualState.DEFAULT],
          },
          state: {
            [VisualState.SELECTED]: {
              labelBackground: true,
              ...GRAPH_EDGE_STYLES[VisualState.SELECTED],
            },
            [VisualState.HIGHLIGHTED]: {
              labelBackground: true,
              ...GRAPH_EDGE_STYLES[VisualState.HIGHLIGHTED],
            },
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

      // 保存实例（但此时 isReadyRef 仍为 false）
      graphRef.current = graph;

      // 渲染并在渲染成功后同步状态
      graph.render().then(() => {
        if (!graph.destroyed) {
          isReadyRef.current = true; // 只有渲染完成后才允许状态更新
          updateGraphStates(data, selectedItems);
        }
      });

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
        isReadyRef.current = false;
      };
    } catch (error) {
      console.error("[GraphView] Error initializing graph:", error);
    }
  }, [resetTrigger, data]); // 响应触发器和数据变化，统一管理生命周期

  // 2. 只有选中项发生变化时，才进行部分状态更新
  useEffect(() => {
    updateGraphStates(data, selectedItems);
  }, [selectedItems, updateGraphStates]); // 移除 data 依赖，由渲染过程处理初次/更新渲染后的状态同步

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div ref={containerRef} className="graph-view flex-1" />
    </div>
  );
});

export default GraphView;
