/**
 * OntoSight API Type Definitions
 * 
 * This file contains TypeScript definitions for all API types.
 * These types are automatically generated from Pydantic models.
 * 
 * Type Safety Guarantees:
 * - All models support JSON serialization/deserialization
 * - Generic types <T> allow flexible data representation
 * - Optional fields use `| null` for explicit null handling
 * - Discriminated unions enable type narrowing
 * 
 * @see api.ts for API client implementation
 */

/**
 * Generic node for graph visualization.
 * 
 * @template T - Type of node data (can be any JSON-serializable type)
 * 
 * @example
 * const node: Node<{ name: string; age: number }> = {
 *   id: "person_1",
 *   data: { name: "Alice", age: 30 },
 *   label: "Alice (age 30)"
 * };
 */
export interface Node<T> {
  /** Unique node identifier within the graph */
  id: string;
  
  /** Domain-specific node data (any JSON-serializable type) */
  data: T;
  
  /** Display label for UI rendering */
  label: string;
}

/**
 * Generic edge connecting two nodes in a graph.
 * 
 * @template T - Type of edge data
 * 
 * @example
 * const edge: Edge<{ relation: string }> = {
 *   source: "person_1",
 *   target: "person_2",
 *   data: { relation: "knows" },
 *   label: "knows"
 * };
 */
export interface Edge<T> {
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Domain-specific edge metadata */
  data: T;
  
  /** Display label (e.g., "knows", "parent-of") */
  label: string;
}

/**
 * Hierarchical node for tree structures (recursive).
 * 
 * @template T - Type of node data
 * 
 * @example
 * const tree: TreeNode<string> = {
 *   id: "root",
 *   data: "Root Node",
 *   label: "Root",
 *   children: [
 *     {
 *       id: "child_1",
 *       data: "First Child",
 *       label: "Child 1",
 *       children: []
 *     }
 *   ]
 * };
 */
export interface TreeNode<T> {
  /** Node ID */
  id: string;
  
  /** Node data */
  data: T;
  
  /** Display label */
  label: string;
  
  /** Child nodes (recursive structure) */
  children: TreeNode<T>[];
}

/**
 * Multi-node edge connecting 2 or more nodes (hyperedge).
 * 
 * @template T - Type of edge data
 * 
 * @example
 * const hyperedge: HyperEdge<{ project: string }> = {
 *   nodes: ["researcher_1", "researcher_2", "researcher_3"],
 *   data: { project: "AI Safety" },
 *   label: "AI Safety collaboration"
 * };
 */
export interface HyperEdge<T> {
  /** List of node IDs (minimum 2) */
  nodes: string[];
  
  /** Hyperedge metadata */
  data: T;
  
  /** Display label */
  label: string;
}

/**
 * Metadata response with JSON Schemas.
 * 
 * Returned by GET /api/meta
 * Used by frontend to generate dynamic property panels.
 * 
 * @example
 * const meta = await apiClient.getMeta();
 * // Generate form fields from meta.node_schema
 */
export interface Meta {
  /** JSON Schema for node data (from Pydantic model) */
  node_schema: Record<string, any> | null;
  
  /** JSON Schema for edge data */
  edge_schema: Record<string, any> | null;
  
  /** JSON Schema for tree item data */
  item_schema: Record<string, any> | null;
  
  /** JSON Schema for hyperedge data */
  hyperedge_schema: Record<string, any> | null;
}

/**
 * Complete visualization payload.
 * 
 * Returned by GET /api/data
 * Contains all nodes, edges, items, and hyperedges.
 * 
 * @example
 * const data = await apiClient.getData();
 * // Render visualization with data.nodes + data.edges
 */
export interface VisualizationData {
  /** Array of graph nodes */
  nodes: Node<any>[];
  
  /** Array of graph edges */
  edges: Edge<any>[];
  
  /** Array of tree nodes (items) */
  items: TreeNode<any>[];
  
  /** Array of hyperedges */
  hyperedges: HyperEdge<any>[];
}

/**
 * Search query request.
 * 
 * POST /api/search
 * 
 * @example
 * const results = await apiClient.search({
 *   query: "find Alice",
 *   context: { field: "name", operator: "contains" }
 * });
 */
export interface SearchRequest {
  /** Search query string */
  query: string;
  
  /** Optional search context */
  context?: Record<string, any> | null;
}

/**
 * Search results.
 * 
 * Returned by POST /api/search
 * 
 * @example
 * const response: SearchResponse = {
 *   results: ["node_1", "node_3", "node_5"]
 * };
 */
export interface SearchResponse {
  /** Array of matching node IDs */
  results: string[];
}

/**
 * Chat query request.
 * 
 * POST /api/chat
 * 
 * @example
 * const response = await apiClient.chat({
 *   query: "What is the relationship between Alice and Bob?"
 * });
 */
export interface ChatRequest {
  /** Chat query */
  query: string;
  
  /** Optional context (e.g., conversation history) */
  context?: Record<string, any> | null;
}

/**
 * Chat response.
 * 
 * Returned by POST /api/chat
 * 
 * @example
 * const response: ChatResponse = {
 *   response: "Alice and Bob are connected by a 'knows' relationship.",
 *   sources: ["node_1", "node_2"]
 * };
 */
export interface ChatResponse {
  /** Chat response text */
  response: string;
  
  /** Source node IDs referenced in response */
  sources?: string[] | null;
}

/**
 * Type aliases for common visualization patterns.
 */

/** Graph visualization: nodes + edges */
export type GraphData = {
  nodes: Node<any>[];
  edges: Edge<any>[];
};

/** Tree visualization: root + recursive children */
export type TreeData = TreeNode<any>;

/** Table visualization: list of items */
export type TableData = {
  rows: Node<any>[];
};

/** Hypergraph visualization: nodes + hyperedges */
export type HypergraphData = {
  nodes: Node<any>[];
  hyperedges: HyperEdge<any>[];
};

/**
 * Error response from API.
 * 
 * @example
 * {
 *   error: "Not Found",
 *   detail: "No visualization loaded",
 *   status: 404
 * }
 */
export interface ErrorResponse {
  error: string;
  detail?: string;
  status: number;
}

/**
 * API Client interface for type-safe operations.
 * 
 * @see api.ts for implementation
 */
export interface IApiClient {
  getMeta(): Promise<Meta>;
  getData(): Promise<VisualizationData>;
  search(req: SearchRequest): Promise<SearchResponse>;
  chat(req: ChatRequest): Promise<ChatResponse>;
  healthCheck(): Promise<boolean>;
}

/**
 * Utility types for working with visualization data.
 */

/** Union of all view types */
export type VisualizationView = 'graph' | 'tree' | 'table' | 'hypergraph';

/** Union of all node data types */
export type NodeData = Node<any> | TreeNode<any>;

/** Union of all edge types */
export type EdgeData = Edge<any> | HyperEdge<any>;

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  status: 'success' | 'error';
}

/**
 * Type guards for runtime validation.
 * 
 * @example
 * if (isNode(item)) {
 *   console.log(item.id);
 * }
 */

export function isNode(value: any): value is Node<any> {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'data' in value &&
    'label' in value &&
    !('source' in value) &&
    !('children' in value) &&
    !('nodes' in value)
  );
}

export function isEdge(value: any): value is Edge<any> {
  return (
    value &&
    typeof value === 'object' &&
    'source' in value &&
    'target' in value &&
    'data' in value &&
    'label' in value &&
    !('children' in value) &&
    !('nodes' in value)
  );
}

export function isTreeNode(value: any): value is TreeNode<any> {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'children' in value &&
    Array.isArray(value.children) &&
    !('source' in value) &&
    !('nodes' in value)
  );
}

export function isHyperEdge(value: any): value is HyperEdge<any> {
  return (
    value &&
    typeof value === 'object' &&
    'nodes' in value &&
    Array.isArray(value.nodes) &&
    value.nodes.length >= 2 &&
    'data' in value &&
    'label' in value
  );
}
