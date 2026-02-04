import React, { ReactNode } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export interface DataGridContainerProps {
  /** Grid content/children */
  children: ReactNode
  /** Whether data is loading */
  loading?: boolean
  /** Error message if loading failed */
  error?: string | null
  /** Whether there's no data to display */
  isEmpty?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Loading message */
  loadingMessage?: string
  /** Grid column classes (default: grid-cols-2 sm:grid-cols-3 lg:grid-cols-4) */
  gridClassName?: string
  /** Container height for empty/loading states */
  minHeight?: string
}

/**
 * DataGridContainer - Unified container for paginated/grid layouts
 * Handles loading, error, and empty states with consistent styling
 */
export const DataGridContainer: React.FC<DataGridContainerProps> = ({
  children,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = "No items found",
  loadingMessage = "Loading...",
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max",
  minHeight = "h-96",
}) => {
  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center ${minHeight} w-full`}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Loading state (when no children yet)
  if (loading && isEmpty) {
    return (
      <div className={`flex items-center justify-center ${minHeight} w-full`}>
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (isEmpty && !loading) {
    return (
      <div className={`flex items-center justify-center ${minHeight} w-full text-muted-foreground`}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  // Normal grid display
  return (
    <div className={gridClassName}>
      {children}
    </div>
  )
}
