import { create } from "zustand";

export interface VisualizationState {
  meta: any | null;
  data: any | null;
  loading: boolean;
  error: string | null;
  selectedNodes: Set<string>;
  highlightedNodes: Set<string>;
  viewMode: "graph" | "list" | "hypergraph";
  zoomLevel: number;

  // Actions
  setMeta: (meta: any) => void;
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectNode: (nodeId: string) => void;
  deselectNode: (nodeId: string) => void;
  clearSelection: () => void;
  highlightNodes: (nodeIds: string[]) => void;
  clearHighlight: () => void;
  setViewMode: (mode: VisualizationState["viewMode"]) => void;
  setZoomLevel: (level: number) => void;
}

export const useVisualization = create<VisualizationState>((set) => ({
  meta: null,
  data: null,
  loading: false,
  error: null,
  selectedNodes: new Set(),
  highlightedNodes: new Set(),
  viewMode: "graph",
  zoomLevel: 1,

  setMeta: (meta) => set({ meta }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  selectNode: (nodeId) =>
    set((state) => ({
      selectedNodes: new Set([...state.selectedNodes, nodeId]),
    })),

  deselectNode: (nodeId) =>
    set((state) => {
      const newSelected = new Set(state.selectedNodes);
      newSelected.delete(nodeId);
      return { selectedNodes: newSelected };
    }),

  clearSelection: () => set({ selectedNodes: new Set() }),

  highlightNodes: (nodeIds) =>
    set({ highlightedNodes: new Set(nodeIds) }),

  clearHighlight: () => set({ highlightedNodes: new Set() }),

  setViewMode: (viewMode) => set({ viewMode }),

  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
}));
