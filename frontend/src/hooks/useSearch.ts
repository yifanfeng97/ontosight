import { useState } from "react";
import { create } from "zustand";
import { apiClient } from "@/services/api";
import type { SearchRequest, VisualizationData } from "@/types/api";

export interface SearchState {
  data: VisualizationData | null;
  loading: boolean;
  error: string | null;

  search: (req: SearchRequest) => Promise<VisualizationData | null>;
  clear: () => void;
  setError: (error: string | null) => void;
}

export const useSearch = create<SearchState>((set) => ({
  data: null,
  loading: false,
  error: null,

  search: async (req: SearchRequest) => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.search(req);
      set({ data });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ data: null, error: null }),

  setError: (error) => set({ error }),
}));
