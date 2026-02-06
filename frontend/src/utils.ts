import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract metadata entries for display (max 2 key-value pairs)
 * @param metadata - Raw metadata object
 * @returns Array of [key, value] tuples for display
 */
export function extractDisplayMetadata(
  metadata?: Record<string, any>
): Array<[string, any]> {
  if (!metadata) return []

  // Check for 'raw' at top level or inside 'data' (common in graph structures)
  const rawData = metadata.raw || (metadata.data && metadata.data.raw)

  if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
    return Object.entries(rawData).slice(0, 2)
  }

  // Fallback: show other metadata fields
  return Object.entries(metadata)
    .filter(([key]) => !["raw", "data"].includes(key))
    .slice(0, 2)
}

/**
 * Format a value for display (truncate if needed)
 * @param value - Value to format
 * @param maxLength - Maximum length (default 15)
 * @returns Formatted string
 */
export function formatMetadataValue(value: any, maxLength: number = 15): string {
  if (typeof value === "string") {
    return value.length > maxLength ? value.substring(0, maxLength) + "..." : value
  }
  if (typeof value === "object") {
    const stringified = JSON.stringify(value)
    return stringified.length > maxLength
      ? stringified.substring(0, maxLength) + "..."
      : stringified
  }
  return String(value)
}
