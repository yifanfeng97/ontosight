import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

interface FloatingPaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  show?: boolean;
}

/**
 * FloatingPagination - Modern floating pagination control
 * 
 * Mimics the FloatingNav aesthetic with a centered bottom position
 * Shows page info and navigation in a sleek, glass-morphic pill shape
 */
export default function FloatingPagination({
  currentPage,
  totalPages,
  isLoading = false,
  onPreviousPage,
  onNextPage,
  show = true,
}: FloatingPaginationProps) {
  if (!show || totalPages <= 1) {
    return null;
  }

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg">
        {/* Previous Button */}
        <button
          onClick={onPreviousPage}
          disabled={!hasPrev || isLoading}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200",
            hasPrev && !isLoading
              ? "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              : "text-muted-foreground/40 cursor-not-allowed"
          )}
          title="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Info */}
        <div className="text-sm text-muted-foreground font-medium px-2 min-w-[100px] text-center">
          <span className="text-foreground font-semibold">{currentPage + 1}</span>
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={!hasNext || isLoading}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200",
            hasNext && !isLoading
              ? "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              : "text-muted-foreground/40 cursor-not-allowed"
          )}
          title="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
