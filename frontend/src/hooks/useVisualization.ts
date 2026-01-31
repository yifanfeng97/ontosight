import { create } from "zustand";

export interface SelectedItem {
  id: string;
  type: "node" | "edge" | "item" | "hyperedge";
}

export interface VisualizationState {
  meta: any | null;
  data: any | null;
  loading: boolean;
  error: string | null;
  selectedItems: Map<string, SelectedItem>;
  highlightedNodes: Set<string>;
  viewMode: "graph" | "list" | "hypergraph";
  zoomLevel: number;
  resetTrigger: number; // Trigger for resetting visualization

  // Actions
  setMeta: (meta: any) => void;
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectItem: (itemId: string, itemType?: "node" | "edge" | "item" | "hyperedge") => void;
  deselectItem: (itemId: string) => void;
  clearSelection: () => void;
  highlightNodes: (nodeIds: string[]) => void;
  clearHighlight: () => void;
  setViewMode: (mode: VisualizationState["viewMode"]) => void;
  setZoomLevel: (level: number) => void;
  resetVisualization: () => void; // Reset visualization layout and state
  triggerLayoutReset: () => void; // Only reset layout without clearing selection
}

export const useVisualization = create<VisualizationState>((set) => ({
  meta: null,
  data: null,
  loading: false,
  error: null,
  selectedItems: new Map(),
  highlightedNodes: new Set(),
  viewMode: "graph",
  zoomLevel: 1,
  resetTrigger: 0,

  setMeta: (meta) => set({ meta }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  selectItem: (itemId, itemType = "node") =>
    set((state) => {
      const newSelectedItems = new Map();
      newSelectedItems.set(itemId, { id: itemId, type: itemType });
      // Add remaining items (excluding the one we just added to keep it at front)
      for (const [key, value] of state.selectedItems) {
        if (key !== itemId) {
          newSelectedItems.set(key, value);
        }
      }
      return { selectedItems: newSelectedItems };
    }),

  deselectItem: (itemId) =>
    set((state) => {
      const newSelectedItems = new Map(state.selectedItems);
      newSelectedItems.delete(itemId);
      return { selectedItems: newSelectedItems };
    }),

  clearSelection: () => set({ selectedItems: new Map() }),

  highlightNodes: (nodeIds) =>
    set({ highlightedNodes: new Set(nodeIds) }),

  clearHighlight: () => set({ highlightedNodes: new Set() }),

  setViewMode: (viewMode) => set({ viewMode }),

  setZoomLevel: (zoomLevel) => set({ zoomLevel }),

  resetVisualization: () => set((state) => ({
    selectedItems: new Map(),
    resetTrigger: state.resetTrigger + 1,
  })),

  triggerLayoutReset: () => set((state) => ({
    resetTrigger: state.resetTrigger + 1,
  })),
}));
