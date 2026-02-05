import { useEffect, useRef, useCallback, memo } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { useToast } from "@/components/core";
import {
  HYPERGRAPH_NODE_STYLES,
  HYPERGRAPH_EDGE_STYLES,
  HYPERGRAPH_EDGE_DEFAULT_STYLE,
  HYPEREDGE_OPACITY,
  HYPEREDGE_STROKE_OPACITY,
  HYPEREDGE_LABEL_CONFIG,
  LAYOUT_SPACING_CONFIG,
  getNodeVisualState,
  getEdgeVisualState,
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
  const itemsRef = useRef(new Map());
  const { selectedItems, selectItem, clearSelection, resetTrigger } = useVisualization();
  const { toast } = useToast();

  // Keep ref in sync with state
  useEffect(() => {
    itemsRef.current = selectedItems;
  }, [selectedItems]);

  /**
   * 统一更新图形状态（节点、边、BubbleSets）
   * 采用批量更新模式以提升性能
   */
  const updateAllStates = useCallback(
    (graph: any, currentData: any, selection: Map<string, any>) => {
      if (!graph || graph.destroyed) return;

      const stateMap: Record<string, string[]> = {};

      // 1. 处理节点和虚拟边状态
      const elements = [...(currentData.nodes || []), ...(currentData.edges || [])];
      elements.forEach((item: any) => {
        const states: string[] = [];
        if (selection.has(item.id)) states.push(VisualState.SELECTED);
        if (item.highlighted) states.push(VisualState.HIGHLIGHTED);
        stateMap[item.id] = states;
      });
      graph.setElementState(stateMap);

      // 2. 处理超边（BubbleSets）状态
      const hyperedgeData = currentData.hyperedges || [];
      hyperedgeData.forEach((hyperedge: any, index: number) => {
        const isSelected = selection.has(hyperedge.id);
        const isHighlighted = hyperedge.highlighted;

        const visualState = isHighlighted
          ? VisualState.HIGHLIGHTED
          : isSelected
          ? VisualState.SELECTED
          : VisualState.DEFAULT;
        
        const activeColors = getHyperedgeColorByState(visualState, index);
        const pluginKey = `bubble-sets-${hyperedge.id}`;
        
        try {
          graph.updatePlugin({
            key: pluginKey,
            fill: activeColors.fill,
            fillOpacity: HYPEREDGE_OPACITY[visualState],
            stroke: activeColors.stroke,
            strokeOpacity: HYPEREDGE_STROKE_OPACITY[visualState],
          });
        } catch (e) {
          // 插件可能尚未就绪
        }
      });

      graph.draw();
    },
    []
  );

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

  /**
   * 构建 BubbleSets 插件配置
   */
  const getBubbleSetPlugins = useCallback((hyperedges: any[], selection: Map<string, any>) => {
    return hyperedges.map((hyperedge, index) => {
      hyperedgesRef.current.set(hyperedge.id, hyperedge);

      const isSelected = selection.has(hyperedge.id);
      const isHighlighted = hyperedge.highlighted === true;
      const visualState = isHighlighted ? VisualState.HIGHLIGHTED : (isSelected ? VisualState.SELECTED : VisualState.DEFAULT);
      const activeColors = getHyperedgeColorByState(visualState, index);

      return {
        key: `bubble-sets-${hyperedge.id}`,
        type: 'bubble-sets',
        members: hyperedge.linked_nodes,
        fill: activeColors.fill,
        fillOpacity: HYPEREDGE_OPACITY[visualState],
        stroke: activeColors.stroke,
        strokeOpacity: HYPEREDGE_STROKE_OPACITY[visualState],
        // 集成统一的超边标签配置
        label: true,
        labelText: hyperedge.label,
        ...HYPEREDGE_LABEL_CONFIG,
        hyperedge: hyperedge,
      };
    });
  }, []);

  // Initialize graph on mount or reset
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. 状态变化监听 (选中项/高亮) - 极快切换，无需 render
  useEffect(() => {
    updateAllStates(graphRef.current, data, selectedItems);
  }, [selectedItems, data, updateAllStates]);

  // 2. 基础数据变化监听 (setData 为增量更新，类似 GraphView)
  useEffect(() => {
    const graph = graphRef.current;
    if (graph && !graph.destroyed && data) {
      graph.setData({ nodes: data.nodes, edges: data.edges || [] });
      graph.setPlugins(getBubbleSetPlugins(data.hyperedges || [], itemsRef.current));
      graph.render().then(() => {
        if (!graph.destroyed) updateAllStates(graph, data, itemsRef.current);
      });
    }
  }, [data, getBubbleSetPlugins, updateAllStates]);

  // 3. 图实例生命周期管理 (全量渲染与重置)
  useEffect(() => {
    if (!containerRef.current || !data?.nodes || !window.G6) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initOrReset = async () => {
      try {
        if (graphRef.current) graphRef.current.destroy();
        if (abortController.signal.aborted) return;

        hyperedgesRef.current.clear();
        const bubbleSetPlugins = getBubbleSetPlugins(data.hyperedges || [], itemsRef.current);
        const initialNodes = data.nodes.map(({ x, y, ...rest }: any) => rest); // 冷启动布局

        const graph = new window.G6.Graph({
          container: containerRef.current!,
          width: containerRef.current!.clientWidth,
          height: containerRef.current!.clientHeight,
          layout: {
            type: 'force',
            collide: { radius: LAYOUT_SPACING_CONFIG.nodeCollideRadius },
            preventOverlap: true,
          },
          behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
          node: {
            style: {
              labelText: (d: any) => {
                const label = d.data?.label || d.id;
                return label.length > 10 ? label.substring(0, 10) + '...' : label;
              },
              ...HYPERGRAPH_NODE_STYLES[VisualState.DEFAULT],
            },
            state: {
              [VisualState.SELECTED]: HYPERGRAPH_NODE_STYLES[VisualState.SELECTED],
              [VisualState.HIGHLIGHTED]: HYPERGRAPH_NODE_STYLES[VisualState.HIGHLIGHTED],
            },
          },
          edge: {
            style: {
              labelText: (d: any) => d.data?.label || '',
              ...HYPERGRAPH_EDGE_DEFAULT_STYLE,
              ...HYPERGRAPH_EDGE_STYLES[VisualState.DEFAULT],
              // 超图中的边标签通常较小
              labelFontSize: 9,
            },
            state: {
              [VisualState.SELECTED]: HYPERGRAPH_EDGE_STYLES[VisualState.SELECTED],
              [VisualState.HIGHLIGHTED]: HYPERGRAPH_EDGE_STYLES[VisualState.HIGHLIGHTED],
            },
          },
          data: { nodes: initialNodes, edges: data.edges || [] },
          plugins: bubbleSetPlugins,
          autoFit: 'center',
        });

        const handleBubbleEvent = (evt: any) => {
          if (evt.targetType === "bubble-sets") {
            const target = evt.target?.options || evt.target;
            if (target?.hyperedge?.id) {
              handleHyperedgeClick(target.hyperedge.id);
              return true;
            }
          }
          return false;
        };

        graph.on("node:click", handleNodeClick);
        graph.on("click", (evt: any) => {
          if (handleBubbleEvent(evt)) return;
          if (evt.targetType === "canvas") clearSelection();
        });
        graph.on("pointerdown", handleBubbleEvent);
        graph.on("pointermove", (evt: any) => {
          if (containerRef.current) {
            containerRef.current.style.cursor = evt.targetType === "bubble-sets" ? "pointer" : "default";
          }
        });

        graph.on("node:dblclick", (evt: any) => {
          const nodeId = evt.target?.id;
          if (!nodeId) return;
          const neighbors = graph.getNeighborNodesData(nodeId) || [];
          const stateMap: Record<string, string[]> = {};
          neighbors.forEach((n: any) => {
            const current = graph.getElementState(n.id) || [];
            if (!current.includes(VisualState.HIGHLIGHTED)) {
              stateMap[n.id] = [...current, VisualState.HIGHLIGHTED];
            }
          });
          graph.setElementState(stateMap);
        });

        if (abortController.signal.aborted) {
          graph.destroy();
          return;
        }

        await graph.render();
        if (!abortController.signal.aborted && !graph.destroyed) {
          updateAllStates(graph, data, itemsRef.current);
          graphRef.current = graph;
        }
      } catch (error) {
        console.warn("[HypergraphView] Initialize error:", error);
      }
    };

    initOrReset();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [resetTrigger, getBubbleSetPlugins, updateAllStates]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div ref={containerRef} className="hypergraph-view flex-1" />
    </div>
  );
});

export default HypergraphView;
