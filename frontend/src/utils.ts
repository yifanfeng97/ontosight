import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract metadata entries for display
 * @param metadata - Raw metadata object
 * @param limit - Maximum number of entries to return (default 2)
 * @returns Array of [key, value] tuples for display
 */
export function extractDisplayMetadata(
  metadata?: Record<string, any>,
  limit: number = 2
): Array<[string, any]> {
  if (!metadata) return []

  // Check for 'raw' at top level or inside 'data' (common in graph structures)
  const rawData = metadata.raw || (metadata.data && metadata.data.raw)

  if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
    const entries = Object.entries(rawData)
    return limit < 0 ? entries : entries.slice(0, limit)
  }

  // Fallback: show other metadata fields
  const filteredEntries = Object.entries(metadata)
    .filter(([key]) => !["raw", "data", "id", "label", "type", "x", "y"].includes(key))
  
  return limit < 0 ? filteredEntries : filteredEntries.slice(0, limit)
}

/**
 * Format a value for display (truncate if needed)
 * @param value - Value to format
 * @param maxLength - Maximum length (default 15)
 * @param shouldTruncate - Whether to truncate the output (default true)
 * @returns Formatted string
 */
export function formatMetadataValue(
  value: any,
  maxLength: number = 15,
  shouldTruncate: boolean = true
): string {
  if (value === null || value === undefined) return ""

  if (typeof value === "string") {
    if (!shouldTruncate) return value
    return value.length > maxLength ? value.substring(0, maxLength) + "..." : value
  }

  if (typeof value === "object") {
    const stringified = JSON.stringify(value)
    if (!shouldTruncate) return stringified
    return stringified.length > maxLength
      ? stringified.substring(0, maxLength) + "..."
      : stringified
  }

  return String(value)
}
