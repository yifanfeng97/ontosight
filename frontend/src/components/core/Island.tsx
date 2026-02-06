import React, { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";
import { BACKDROP_BLUR_CONFIG } from "@/theme/visual-config";

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
  /** CSS classes for content area (inner scrollable container) */
  contentClassName?: string;
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
      contentClassName,
    },
    ref
  ) => {
    // Base glass-morphic styles - Jelly Mica Style
    const baseStyles = cn(
      "flex flex-col rounded-[3rem] bg-white/60 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden min-w-[280px]",
      "backdrop-blur-[60px] ring-1 ring-black/[0.02]"
    );

    // Position-specific classes
    const positionStyles = {
      "top-left": "fixed top-8 left-8 max-w-sm z-10",
      "top-center": "fixed top-8 left-1/2 -translate-x-1/2 max-w-md z-10",
      "bottom-left": "fixed bottom-8 left-8 max-w-sm max-h-[60vh] overflow-y-auto z-10",
      selection: "fixed bottom-8 left-8 max-w-xl max-h-[40vh] overflow-y-auto z-10",
      custom: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          positionStyles[position],
          "group transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)]",
          className
        )}
      >
        {/* Header (if title or headerContent provided) - minimalist design */}
        {(title || headerContent || showClose) && (
          <div className="flex-none flex items-center justify-between px-8 pt-6 pb-2 transition-all duration-200">
            {headerContent ? (
              headerContent
            ) : (
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">{title}</h3>
            )}
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-2 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-900 transition-all duration-300 opacity-20 hover:opacity-100 group-hover:opacity-60 active:scale-95"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1 min-h-0 px-2 pt-0 pb-6", contentClassName)}>{children}</div>
      </div>
    );
  }
);

Island.displayName = "Island";

export default Island;
