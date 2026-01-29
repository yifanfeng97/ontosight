import React, { useEffect, useRef, memo } from 'react';
import * as G6 from '@antv/g6';
import { useSearch } from '../../hooks/useSearch';
import { message } from 'antd';
import './HypergraphView.css';

interface HypergraphViewProps {
  data: {
    nodes: any[];
    edges: any[];
  };
  meta: any;
}

interface HyperEdgeInfo {
  id: string;
  nodes: string[];
}

const HypergraphView = memo(function HypergraphView({ data, meta }: HypergraphViewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const { results: searchResults } = useSearch();

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      if (!data || !data.nodes || !data.edges) {
        return;
      }

      // Prepare data: convert hyperedges to virtual nodes + edges
      const { hyperEdges, transformedData } = transformDataToHypergraph(data);

      // Init or update Graph
      if (!graphRef.current) {
        graphRef.current = createGraph(canvasRef.current, transformedData);
      } else {
        graphRef.current.changeData(transformedData);
      }

      // Bind events
      if (graphRef.current) {
        bindInteractions(graphRef.current, hyperEdges);
      }

      // Highlight search
      if (searchResults.length > 0 && graphRef.current) {
        highlightSearchResults(graphRef.current, searchResults);
      }
    } catch (error) {
      console.error('Hypergraph render error:', error);
      message.error('Failed to render hypergraph');
    }

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [data, searchResults]);

  return <div ref={canvasRef} className="hypergraph-view" style={{ width: '100%', height: '100%' }} />;
});

/**
 * Convert hypergraph data format to G6 bipartite format.
 * Hyperedges in 'data.edges' become virtual nodes.
 */
function transformDataToHypergraph(data: { nodes: any[]; edges: any[] }) {
  const hyperEdges: HyperEdgeInfo[] = [];
  
  // Clone nodes to avoid mutating props
  const g6Nodes = data.nodes.map(n => ({
    ...n,
    // Add default style if not present
    size: 30,
    style: { fill: '#ECF5FF', stroke: '#409EFF' }
  }));
  
  const g6Edges: any[] = [];

  // data.edges contains hyperedges: { nodes: [id1, id2...], label... }
  data.edges.forEach((hedge, index) => {
    const virtualNodeId = `__he_${index}`;
    const participants = hedge.nodes || [];
    
    // 1. Create virtual node for the hyperedge
    g6Nodes.push({
      id: virtualNodeId,
      label: hedge.label || '',
      type: 'hyper-edge-node', // Custom shape type
      size: 15,
      // Metadata to identify it
      isHyperEdge: true
    });

    // 2. Map for interaction
    hyperEdges.push({
      id: virtualNodeId,
      nodes: participants
    });

    // 3. Create edges from virtual node to participants
    participants.forEach((nodeId: string) => {
      g6Edges.push({
        source: virtualNodeId,
        target: nodeId,
        type: 'line',
        style: { stroke: '#B4E5FF' }
      });
    });
  });

  return {
    hyperEdges,
    transformedData: { nodes: g6Nodes, edges: g6Edges }
  };
}

/**
 * Configure and create G6 Graph instance
 */
function createGraph(container: HTMLDivElement, data: any) {
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  const graph = new G6.Graph({
    container,
    width,
    height,
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    layout: {
      type: 'force',
      preventOverlap: true,
      linkDistance: 100,
      nodeStrength: -30,
      edgeStrength: 0.1
    },
    node: {
      type: 'circle',
    },
    edge: {
      type: 'line',
    }
  });

  graph.setData(data);
  graph.render();
  
  return graph;
}

function bindInteractions(graph: any, hyperEdges: HyperEdgeInfo[]) {
   graph.on('node:click', (evt: any) => {
      const node = evt.item;
      const model = node.getModel();
      
      // If clicked a hyperedge virtual node, highlight connected nodes
      if (model.isHyperEdge) {
         const info = hyperEdges.find(h => h.id === model.id);
         if (info) {
             info.nodes.forEach(nid => {
                const n = graph.findById(nid);
                if (n) {
                   graph.setItemState(n, 'active', true);
                }
             });
         }
      }
   });
   
   graph.on('canvas:click', () => {
      graph.getNodes().forEach((n: any) => {
         graph.clearItemStates(n, 'active');
      });
   });
}

function highlightSearchResults(graph: any, results: string[]) {
   // Implementation similar to GraphView
   results.forEach(id => {
      const item = graph.findById(id);
      if (item) {
         graph.setItemState(item, 'selected', true);
      }
   });
}

export default HypergraphView;
