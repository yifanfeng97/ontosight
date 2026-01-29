import React, { useEffect, useRef } from 'react';
import * as G6 from '@antv/g6';
import { useVisualization } from '../../hooks/useVisualization';
import { useSearch } from '../../hooks/useSearch';
import { message } from 'antd';
import './HypergraphView.css';

/**
 * HypergraphView: 超图可视化组件
 *
 * 超图是一种图数据结构，其中边可以连接多个节点（而不仅仅是两个）。
 * 这个组件使用虚拟中间节点来表示超边，并将其连接到所有参与的节点。
 *
 * 渲染策略:
 * 1. 为每个超边创建虚拟节点
 * 2. 虚拟节点连接到所有参与的节点
 * 3. 虚拟节点样式不同（使其可识别）
 * 4. 用户交互支持选中、拖拽、高亮
 */

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
}

interface HyperEdge {
  id: string;
  label: string;
  nodes: string[];
  color?: string;
}

const HypergraphView: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const { data, selectedNodes } = useVisualization();
  const { results: searchResults } = useSearch();

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // 验证数据
      if (!data || !data.nodes || !data.edges) {
        message.warning('缺少超图数据');
        return;
      }

      // 准备超图数据
      const { hyperEdges, transformedData } = transformDataToHypergraph(
        data as GraphData
      );

      // 初始化或更新 G6 图表
      if (!graphRef.current) {
        graphRef.current = createGraph(canvasRef.current, transformedData);
      } else {
        (graphRef.current as any).data(transformedData);
        graphRef.current.render();
      }

      // 绑定交互事件
      if (graphRef.current) {
        bindInteractions(graphRef.current, hyperEdges);
      }

      // 应用搜索高亮
      if (searchResults.length > 0 && graphRef.current) {
        highlightSearchResults(graphRef.current, searchResults);
      }
    } catch (error) {
      console.error('Hypergraph 渲染错误:', error);
      message.error('超图可视化失败');
    }

    // 清理
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [data, searchResults]);

  return <div ref={canvasRef} className="hypergraph-view" />;
};

/**
 * 将普通图数据转换为超图数据
 * 创建虚拟超边节点并连接到所有参与的节点
 */
function transformDataToHypergraph(data: GraphData) {
  const hyperEdges: HyperEdge[] = [];
  const virtualNodes: typeof data.nodes = [];
  const virtualEdges: typeof data.edges = [];

  // 检测超边（连接多个节点的边）
  const edgesBySource = new Map<string, string[]>();

  // 如果有自定义的超边标记，使用它
  // 否则，多个节点连接到同一源的边视为超边
  data.edges.forEach((edge, index) => {
    if (!edgesBySource.has(edge.source)) {
      edgesBySource.set(edge.source, []);
    }
    edgesBySource.get(edge.source)!.push(edge.target);
  });

  // 创建虚拟超边节点
  edgesBySource.forEach((targets, source) => {
    if (targets.length >= 2) {
      // 这是一个超边（一对多）
      const hyperedgeId = `hyperedge-${source}-${targets.join('-')}`;
      const hyperEdge: HyperEdge = {
        id: hyperedgeId,
        label: `HyperEdge (${targets.length} nodes)`,
        nodes: targets,
        color: '#722ed1', // 紫色用于超边
      };

      hyperEdges.push(hyperEdge);

      // 创建虚拟节点代表此超边
      virtualNodes.push({
        id: hyperedgeId,
        label: hyperEdge.label,
        type: 'hyperEdge',
      });

      // 创建虚拟边：超边 -> 所有目标节点
      targets.forEach((target) => {
        virtualEdges.push({
          source: hyperedgeId,
          target: target,
          label: '', // 虚拟边不需要标签
        });
      });
    }
  });

  // 合并数据
  const transformedData: GraphData = {
    nodes: [...data.nodes, ...virtualNodes],
    edges: [...data.edges, ...virtualEdges],
  };

  return { hyperEdges, transformedData };
}

/**
 * 创建 G6 图表实例
 */
function createGraph(container: HTMLDivElement, data: GraphData) {
  // 注册自定义超边节点
  if (!(G6 as any).registered('hyperEdge')) {
    (G6 as any).register('node', 'hyperEdge', {
      draw(cfg: any, group: any) {
        // 绘制虚拟节点为带边框的圆圈
        const r = 10;
        const color = cfg.color || '#722ed1';

        group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r: r,
            fill: '#fff',
            stroke: color,
            lineWidth: 2,
            dashArray: [5, 5], // 虚线样式
          },
        });

        // 中心点
        group.addShape('circle', {
          attrs: {
            x: 0,
            y: 0,
            r: 3,
            fill: color,
          },
        });

        return group;
      },
      setState(name: string, value: any, item: any) {
        const group = item.getContainer();
        const shape = group.getChildren()[0];

        if (name === 'highlighted') {
          if (value) {
            shape.attr('r', 15);
            shape.attr('lineWidth', 3);
          } else {
            shape.attr('r', 10);
            shape.attr('lineWidth', 2);
          }
        } else if (name === 'selected') {
          if (value) {
            shape.attr('fill', '#722ed1');
            shape.attr('fillOpacity', 0.3);
          } else {
            shape.attr('fill', '#fff');
            shape.attr('fillOpacity', 1);
          }
        }
      },
    });
  }

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  const graph = new (G6 as any).Graph({
    container,
    width,
    height,
    renderer: 'canvas' as any,
    autoPaint: true,
    modes: {
      default: [
        'drag-canvas',
        'zoom-canvas',
        'drag-node',
        {
          type: 'click-select',
          formatIds: (ids: string[]) => ids,
          onSelect: (selectedIds: string[]) => {
            // 处理节点选中
          },
        },
      ],
    },
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeSpacing: 50,
      damping: 0.999,
      maxIteration: 1000,
      gravitationalConstant: -35,
    },
  });

  graph.data(data);
  graph.render();

  return graph;
}

/**
 * 绑定图的交互事件
 */
function bindInteractions(graph: G6.Graph, hyperEdges: HyperEdge[]) {
  // 节点点击事件
  graph.on('node:click', (ev: any) => {
    const node = ev.item;
    const nodeId = node.getID();

    // 切换选中状态
    if (node.hasState('selected')) {
      (graph as any).setItemState(node, 'selected', false);
    } else {
      (graph as any).setItemState(node, 'selected', true);
    }

    // 检查是否是超边，如果是则高亮相关节点
    const hyperEdge = hyperEdges.find((he) => he.id === nodeId);
    if (hyperEdge) {
      hyperEdge.nodes.forEach((targetId) => {
        const targetNode = (graph as any).findById(targetId);
        if (targetNode) {
          (graph as any).setItemState(targetNode, 'highlighted', true);
        }
      });
    }
  });

  // 节点鼠标悬停
  graph.on('node:mouseenter', (ev: any) => {
    const node = ev.item;
    (graph as any).setItemState(node, 'highlighted', true);
  });

  // 节点鼠标离开
  graph.on('node:mouseleave', (ev: any) => {
    const node = ev.item;
    if (!node.hasState('selected')) {
      (graph as any).setItemState(node, 'highlighted', false);
    }
  });

  // 双击展开相邻节点
  graph.on('node:dblclick', (ev: any) => {
    const node = ev.item;
    const neighbors = (graph as any).getNeighbors(node);
    neighbors.forEach((neighbor: any) => {
      (graph as any).setItemState(neighbor, 'highlighted', true);
    });
  });
}

/**
 * 高亮搜索结果
 */
function highlightSearchResults(graph: any, resultIds: string[]) {
  const resultSet = new Set(resultIds);

  // 获取所有节点
  (graph as any).getNodes().forEach((node: any) => {
    const nodeId = node.getID();
    if (resultSet.has(nodeId)) {
      (graph as any).setItemState(node, 'highlighted', true);
    } else {
      (graph as any).setItemState(node, 'highlighted', false);
    }
  });

  // 如果有结果，缩放到第一个结果
  if (resultIds.length > 0) {
    (graph as any).focusItem(resultIds[0], true, {
      duration: 500,
      easing: 'easeCubic',
    });
  }
}

export default HypergraphView;
