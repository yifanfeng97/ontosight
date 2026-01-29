import { useState } from "react";
import { create } from "zustand";
import { apiClient } from "@/services/api";
import type { ChatRequest } from "@/types/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatState {
  history: ChatMessage[];
  loading: boolean;
  error: string | null;

  send: (req: ChatRequest) => Promise<void>;
  clear: () => void;
  setError: (error: string | null) => void;
}

export const useChat = create<ChatState>((set) => ({
  history: [],
  loading: false,
  error: null,

  send: async (req: ChatRequest) => {
    set((state) => ({
      history: [...state.history, { role: "user" as const, content: req.query }],
      loading: true,
      error: null,
    }));

    try {
      const response = await apiClient.chat(req);
      set((state) => ({
        history: [
          ...state.history,
          { role: "assistant" as const, content: response.response },
        ],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chat failed";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ history: [], error: null }),

  setError: (error) => set({ error }),
}));
