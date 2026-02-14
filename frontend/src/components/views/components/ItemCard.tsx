/**
 * Standard ItemCard UI component for displaying items in grid/list layouts.
 * Displays label, type badge, and metadata preview from raw data.
 * 
 * This is a pure UI component - parent components handle selection logic via onClick.
 */

import React, { useMemo } from "react";
import { cn, extractDisplayMetadata, formatMetadataValue } from "@/utils";
import { 
  getCardStateClasses, 
  UI_CARD_TYPE_COLORS, 
  UI_CARD_TYPE_BORDERS,
  BACKDROP_BLUR_CONFIG 
} from "@/theme/visual-config";

export interface ItemCardProps {
  /** Unique item identifier */
  id: string;
  /** Display label */
  label: string;
  /** Item type for badge and styling */
  type: "node" | "edge" | "hyperedge" | "item";
  /** Metadata for preview display */
  metadata?: Record<string, any>;
  /** Whether item is currently selected */
  isSelected?: boolean;
  /** Whether item is highlighted from search results */
  isHighlighted?: boolean;
  /** Click handler for selection/deselection */
  onClick?: () => void;
  /** Whether to show the type badge */
  showTypeBadge?: boolean;
  /** Max metadata items to show (default 2, -1 for all) */
  maxMetadata?: number;
  /** Whether to truncate metadata values (default true) */
  shouldTruncate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom children to render at bottom */
  children?: React.ReactNode;
}

/**
 * ItemCard component - displays a card with label, type badge, and metadata preview.
 * 
 * @example
 * <ItemCard
 *   id="node_1"
 *   label="Alice"
 *   type="node"
 *   metadata={{ raw: { name: "Alice", age: 30 }, category: "person" }}
 *   isSelected={true}
 *   onClick={() => handleSelect("node_1")}
 * />
 */
const ItemCard: React.FC<ItemCardProps> = ({
  id,
  label,
  type,
  metadata,
  isSelected = false,
  isHighlighted = false,
  onClick,
  showTypeBadge = true,
  maxMetadata = 2,
  shouldTruncate = true,
  className,
  children,
}) => {
  // Extract metadata entries to display from raw data
  const displayEntries = useMemo(() => {
    return extractDisplayMetadata(metadata, maxMetadata);
  }, [metadata, maxMetadata]);

  // Get state classes from global visual config
  const stateClasses = getCardStateClasses(isSelected, isHighlighted);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative px-5 py-6 cursor-pointer transition-all duration-500 rounded-[2.5rem] bg-white/40 border border-white backdrop-blur-[40px] ring-1 ring-black/[0.02] flex flex-col",
        stateClasses,
        className
      )}
    >
      {/* Subtle Grain Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay group-hover:opacity-[0.04] transition-opacity duration-700"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className={cn("relative z-10 flex-1 flex flex-col", !shouldTruncate ? "gap-5" : "gap-4")}>
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
             <div className={cn(
              "font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors duration-500",
              !shouldTruncate ? "text-xl leading-tight" : "text-base truncate"
            )}>
              {label || id}
            </div>
          </div>

          {showTypeBadge && (
             <span className={cn(
              "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-transparent transition-all duration-500",
              type === "node" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/10" :
              type === "edge" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" :
              "bg-violet-500/10 text-violet-600 border-violet-500/10"
            )}>
              {type}
            </span>
          )}
        </div>

        {/* Metadata Grid */}
        {displayEntries.length > 0 && (
          <div className={cn(
            "grid gap-4 p-5 rounded-[1.5rem] bg-black/[0.02] border border-black/[0.03] transition-colors duration-500 group-hover:bg-indigo-500/[0.02]",
            !shouldTruncate ? "grid-cols-1" : "grid-cols-1"
          )}>
            {displayEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                    {key}
                  </span>
                  {shouldTruncate && <span className="w-8 h-[1px] bg-slate-100" />}
                </div>
                <div className={cn(
                  "text-xs font-bold text-slate-700 leading-relaxed",
                  shouldTruncate ? "truncate text-left" : "break-words"
                )}>
                  {formatMetadataValue(value, 30, shouldTruncate)}
                </div>
              </div>
            ))}
            
            {shouldTruncate && metadata && Object.keys(metadata).length > displayEntries.length && (
              <div className="pt-2 border-t border-black/[0.03] flex justify-start">
                <span className="text-[8px] font-black text-indigo-500 animate-bounce uppercase tracking-wider">
                  VIEW +{Object.keys(metadata).length - displayEntries.length} MORE PROPERTIES
                </span>
              </div>
            )}
          </div>
        )}

        {children && <div className="mt-auto">{children}</div>}
      </div>

      {/* Decorative Corner Glow */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
};

export default ItemCard;
