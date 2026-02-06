import { create } from "zustand";
import { apiClient } from "@/services/api";

export interface SelectedItem {
  id: string;
  type: "node" | "edge" | "item" | "hyperedge";
}

export interface VisualizationState {
  meta: any | null;
  data: any | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  selectedItems: Map<string, SelectedItem>;
  viewedHistory: SelectedItem[]; // History of all clicked items (no dedup)
  selectedItemDetails: Map<string, any>; // Cache for item details
  highlightedNodes: Set<string>;
  viewMode: "graph" | "list" | "items" | "nodes" | "edges" | "hyperedges" | "hypergraph";
  zoomLevel: number;
  resetTrigger: number;
  currentPage: number;
  pageSize: number;

  // Actions
  setMeta: (meta: any) => void;
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setDetailLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectItem: (itemId: string, itemType?: "node" | "edge" | "item" | "hyperedge") => void;
  deselectItem: (itemId: string) => void;
  clearSelection: () => void;
  removeFromHistory: (itemId: string) => void;
  clearHistory: () => void;
  highlightNodes: (nodeIds: string[]) => void;
  clearHighlight: () => void;
  setViewMode: (mode: VisualizationState["viewMode"]) => void;
  setZoomLevel: (level: number) => void;
  resetVisualization: () => void;
  triggerLayoutReset: () => void;
  refreshView: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // New async methods
  fetchDataForShow: (ids?: string[]) => Promise<any>;
  fetchDetails: (itemId: string) => Promise<any>;
  fetchNodesList: (page: number, pageSize: number) => Promise<any>;
  fetchEdgesList: (page: number, pageSize: number) => Promise<any>;
  fetchHyperedgesList: (page: number, pageSize: number) => Promise<any>;
}

export const useVisualization = create<VisualizationState>((set, get) => ({
  meta: null,
  data: null,
  loading: false,
  detailLoading: false,
  error: null,
  selectedItems: new Map(),
  viewedHistory: [], // History of all clicked items
  selectedItemDetails: new Map(),
  highlightedNodes: new Set(),
  viewMode: "graph",
  zoomLevel: 1,
  resetTrigger: 0,
  currentPage: 0,
  pageSize: 30,

  setMeta: (meta) => set({ meta }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setDetailLoading: (detailLoading) => set({ detailLoading }),
  setError: (error) => set({ error }),

  // Single selection: clear old selection, set new one, add to history (at front)
  selectItem: (itemId, itemType = "node") =>
    set((state) => {
      const newSelectedItems = new Map();
      newSelectedItems.set(itemId, { id: itemId, type: itemType });
      
      // Add to viewed history at the front (most recent first)
      const newHistory = [{ id: itemId, type: itemType }, ...state.viewedHistory];
      
      return { 
        selectedItems: newSelectedItems,
        viewedHistory: newHistory
      };
    }),

  deselectItem: (itemId) =>
    set((state) => {
      const newSelectedItems = new Map(state.selectedItems);
      newSelectedItems.delete(itemId);
      return { selectedItems: newSelectedItems };
    }),

  clearSelection: () => set({ selectedItems: new Map() }),

  removeFromHistory: (itemId) =>
    set((state) => ({
      viewedHistory: state.viewedHistory.filter((item) => item.id !== itemId),
    })),

  clearHistory: () => set({ viewedHistory: [] }),

  highlightNodes: (nodeIds) =>
    set({ highlightedNodes: new Set(nodeIds) }),

  clearHighlight: () => set({ highlightedNodes: new Set() }),

  setViewMode: (viewMode) => set({ viewMode }),

  setZoomLevel: (zoomLevel) => set({ zoomLevel }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setPageSize: (size) => set({ pageSize: size }),

  resetVisualization: () => set((state) => ({
    selectedItems: new Map(),
    resetTrigger: state.resetTrigger + 1,
  })),

  refreshView: () => set((state) => ({
    resetTrigger: state.resetTrigger + 1,
  })),

  triggerLayoutReset: async () => {
    try {
      set({ loading: true });
      const response = await apiClient.getData();
      set((state) => ({
        data: response,
        loading: false,
        resetTrigger: state.resetTrigger + 1,
        selectedItems: new Map(),
        viewedHistory: [],
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to reset and fetch data";
      set({ error: errorMsg, loading: false });
    }
  },

  fetchDataForShow: async (ids?: string[]) => {
    try {
      set({ loading: true });
      const response = await apiClient.getData(ids);
      set({ data: response, loading: false });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch data";
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  fetchDetails: async (itemId: string) => {
    try {
      const state = get();
      // Check cache first
      if (state.selectedItemDetails.has(itemId)) {
        return state.selectedItemDetails.get(itemId);
      }

      set({ detailLoading: true });
      const response = await apiClient.getDetails(itemId);
      
      set((state) => ({
        selectedItemDetails: new Map(state.selectedItemDetails).set(itemId, response),
        detailLoading: false,
      }));
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch details";
      set({ error: errorMsg, detailLoading: false });
      throw error;
    }
  },

  fetchNodesList: async (page: number, pageSize: number) => {
    try {
      const response = await apiClient.getNodesPaginated(page, pageSize);
      set({ currentPage: page, pageSize });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch nodes list";
      set({ error: errorMsg });
      throw error;
    }
  },

  fetchEdgesList: async (page: number, pageSize: number) => {
    try {
      const response = await apiClient.getEdgesPaginated(page, pageSize);
      set({ currentPage: page, pageSize });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch edges list";
      set({ error: errorMsg });
      throw error;
    }
  },

  fetchHyperedgesList: async (page: number, pageSize: number) => {
    try {
      const response = await apiClient.getHyperedgesPaginated(page, pageSize);
      set({ currentPage: page, pageSize });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch hyperedges list";
      set({ error: errorMsg });
      throw error;
    }
  },
}));
