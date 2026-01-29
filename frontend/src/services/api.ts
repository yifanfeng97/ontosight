/**
 * Type-safe API client for OntoSight visualization engine.
 *
 * Features:
 * - Strongly typed request/response handling
 * - Error handling with user-friendly messages
 * - Automatic request retry logic
 * - Request timeout handling
 *
 * Usage:
 *   import { apiClient } from '@/services/api';
 *   const meta = await apiClient.getMeta();
 *   const results = await apiClient.search({ query: "test" });
 */

import {
  Meta,
  SearchRequest,
  SearchResponse,
  ChatRequest,
  ChatResponse,
  VisualizationData,
} from "@/types/api";

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * HTTP error with context information.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Make HTTP request with error handling and retries.
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  attempt = 1
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(
        response.status,
        response.statusText,
        `API Error: ${response.statusText}`,
        error
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry logic for network errors
    if (
      attempt < RETRY_ATTEMPTS &&
      error instanceof Error &&
      error.message !== "Failed to fetch"
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * attempt)
      );
      return fetchWithRetry<T>(url, options, attempt + 1);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      0,
      "Unknown",
      error instanceof Error
        ? error.message
        : "An unknown error occurred",
      error
    );
  }
}

/**
 * API client providing type-safe access to OntoSight backend.
 */
export const apiClient = {
  /**
   * Get metadata including JSON schemas for all visualization types.
   *
   * GET /api/meta
   */
  async getMeta(): Promise<Meta> {
    try {
      return await fetchWithRetry<Meta>(`${API_BASE_URL}/api/meta`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error(
            "No visualization loaded. Please call view_* function in Python first."
          );
        }
      }
      throw error;
    }
  },

  /**
   * Get visualization data (nodes, edges, items).
   *
   * GET /api/data
   */
  async getData(): Promise<VisualizationData> {
    try {
      return await fetchWithRetry<VisualizationData>(
        `${API_BASE_URL}/api/data`
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error(
          "No visualization data available. Please call view_* function first."
        );
      }
      throw error;
    }
  },

  /**
   * Execute search on visualization data.
   *
   * POST /api/search
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    return await fetchWithRetry<SearchResponse>(
      `${API_BASE_URL}/api/search`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Execute chat/LLM query on visualization.
   *
   * POST /api/chat
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return await fetchWithRetry<ChatResponse>(
      `${API_BASE_URL}/api/chat`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Health check - verify API is responsive.
   *
   * GET /api/health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

/**
 * Initialize API client (setup, validate connection, etc.)
 */
export async function initializeApiClient(): Promise<void> {
  const isHealthy = await apiClient.healthCheck();
  if (!isHealthy) {
    console.warn(
      "API health check failed. Some features may not work correctly."
    );
  }
}

/**
 * Format API error for user display.
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return `API Error (${error.status}): ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}
