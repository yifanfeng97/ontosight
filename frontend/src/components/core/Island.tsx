import React, { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";

export interface IslandProps {
  /** Island title/header */
  title?: string;
  /** Close button callback */
  onClose?: () => void;
  /** Children content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Show close button */
  showClose?: boolean;
  /** Allow dragging (future enhancement) */
  draggable?: boolean;
  /** Custom header content */
  headerContent?: ReactNode;
  /** Position preset: 'top-left', 'top-center', 'bottom-left', 'selection' */
  position?: "top-left" | "top-center" | "bottom-left" | "selection" | "custom";
}

/**
 * Island - Floating glass-morphic container for modern UI
 * 
 * A reusable component that provides the core "floating island" aesthetic:
 * - Ultra-blurred backdrop (backdrop-blur-xl)
 * - Semi-transparent background (bg-background/40)
 * - Subtle border (border-border/30)
 * - Soft shadow (shadow-2xl)
 * - Perfect for Stats, Details, or any floating UI elements
 * 
 * @example
 * <Island title="Statistics" onClose={() => setOpen(false)}>
 *   <StatsPanel stats={meta.stats} />
 * </Island>
 */
const Island = React.forwardRef<HTMLDivElement, IslandProps>(
  (
    {
      title,
      onClose,
      children,
      className,
      showClose = false,
      draggable = false,
      headerContent,
      position = "custom",
    },
    ref
  ) => {
    // Base glass-morphic styles that all islands share
    const baseStyles = "rounded-2xl bg-background/40 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden min-w-[280px]";

    // Position-specific classes
    const positionStyles = {
      "top-left": "fixed top-6 left-6 max-w-sm z-10",
      "top-center": "fixed top-6 left-1/2 -translate-x-1/2 max-w-md z-10",
      "bottom-left": "fixed bottom-6 left-6 max-w-sm max-h-[60vh] overflow-y-auto z-10",
      selection: "fixed bottom-6 left-6 max-w-xl max-h-[40vh] overflow-y-auto z-10",
      custom: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          positionStyles[position],
          className
        )}
      >
        {/* Header (if title or headerContent provided) - minimalist design */}
        {(title || headerContent || showClose) && (
          <div className="flex items-center justify-between px-5 py-3 transition-all duration-200">
            {headerContent ? (
              headerContent
            ) : (
              <h3 className="text-xs font-semibold text-muted-foreground/60 tracking-wide uppercase">{title}</h3>
            )}
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-4">{children}</div>
      </div>
    );
  }
);

Island.displayName = "Island";

export default Island;
