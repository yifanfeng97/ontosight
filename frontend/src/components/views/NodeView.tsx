import { useEffect, useRef, useCallback, memo } from "react";
import { Graph, NodeEvent, CanvasEvent } from "@antv/g6";
import { useVisualization } from "@/hooks/useVisualization";
import { 
  GRAPH_NODE_STYLES, 
  VisualState, 
  LAYOUT_SPACING_CONFIG 
} from "@/theme/visual-config";

interface NodeViewProps {
  data: any;
  meta?: any;
}

/**
 * NodeView 组件 - 专用于纯节点可视化
 * 特点：
 * 1. 只处理节点（零边），适合实体云、聚类、嵌入空间展现
 * 2. 使用 Grid 布局替代 Force 布局，更整洁有序
 * 3. 简化的交互逻辑，专注于节点选中和高亮
 * 4. 优化的渲染性能（大规模节点集时更快）
 */
const NodeView = memo(function NodeView({ data }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const isReadyRef = useRef(false);
  const { selectedItems, selectItem, clearSelection, resetTrigger } = useVisualization();

  // 统一的状态更新函数
  const updateNodeStates = useCallback((currentData: any, currentSelection: Map<string, any>) => {
    const graph = graphRef.current;
    if (!graph || graph.destroyed || !currentData || !isReadyRef.current) return;

    try {
      const stateMap: Record<string, string[]> = {};

      // 处理节点状态
      currentData.nodes?.forEach((node: any) => {
        if (!node.id || !graph.getNodeData(node.id)) return;

        const states: string[] = [];
        if (currentSelection.has(node.id)) states.push(VisualState.SELECTED);
        if (node.highlighted) states.push(VisualState.HIGHLIGHTED);
        stateMap[node.id] = states;
      });

      if (Object.keys(stateMap).length === 0) return;
      
      graph.setElementState(stateMap);
    } catch (e) {
      // 捕获异常，防止因异步数据同步导致的 draw 错误崩溃
    }
  }, []);

  // 1. 图实例生命周期管理
  useEffect(() => {
    if (!containerRef.current || !data?.nodes) return;

    // 如果已存在实例，先销毁
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 准备基础数据（清除坐标以触发冷启动布局）
    const initialNodes = data.nodes.map(({ x, y, ...rest }: any) => rest);

    try {
      const graph = new Graph({
        container: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: {
          type: 'grid',
          cols: 10, // 每行显示的节点数
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
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
        data: {
          nodes: initialNodes,
          edges: [], // 纯节点模式，不需要边
        },
      });

      // 节点点击事件
      graph.on(NodeEvent.CLICK, (evt: any) => {
        const id = evt.target.id;
        if (id) selectItem(id, 'node');
      });

      // 画布点击事件
      graph.on(CanvasEvent.CLICK, () => {
        clearSelection();
      });

      // 保存实例
      graphRef.current = graph;

      // 渲染并在渲染成功后同步状态
      graph.render().then(() => {
        if (!graph.destroyed) {
          isReadyRef.current = true;
          updateNodeStates(data, selectedItems);
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
      console.error("[NodeView] Error initializing graph:", error);
    }
  }, [resetTrigger, data]);

  // 2. 选中项发生变化时，进行部分状态更新
  useEffect(() => {
    updateNodeStates(data, selectedItems);
  }, [selectedItems, updateNodeStates]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div ref={containerRef} className="node-view flex-1" />
    </div>
  );
});

export default NodeView;
