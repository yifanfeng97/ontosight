import { useState } from "react";
import { create } from "zustand";
import { apiClient } from "@/services/api";
import type { SearchRequest } from "@/types/api";

export interface SearchState {
  results: string[];
  loading: boolean;
  error: string | null;

  search: (req: SearchRequest) => Promise<void>;
  clear: () => void;
  setError: (error: string | null) => void;
}

export const useSearch = create<SearchState>((set) => ({
  results: [],
  loading: false,
  error: null,

  search: async (req: SearchRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.search(req);
      set({ results: response.results });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ results: [], error: null }),

  setError: (error) => set({ error }),
}));
