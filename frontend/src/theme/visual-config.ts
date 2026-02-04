/**
 * 统一的视觉配置文件
 * 集中管理所有UI元素的三种状态（normal、selected、highlighted）的样式
 * 包括G6图表、超边、卡片等所有可视化组件
 * 
 * 配色系统：Modern Digital Palette
 * - Primary (Indigo/紫罗兰)：用于选中和强调
 * - Success (Emerald/翡翠绿)：默认节点颜色，生机活力
 * - Warning (Amber/琥珀色)：搜索/高亮，温暖亮眼
 * - Neutral (Slate/石板灰)：边线和次要元素，极简感
 */

/**
 * 全局色彩调色板
 */
export const COLOR_PALETTE = {
  primary: {
    normal: '#6366F1',      // Indigo - 主品牌色，科技感强
    hover: '#4F46E5',       // 深紫罗兰
    glow: '#6366F1',        // 用于发光效果
  },
  success: {
    normal: '#10B981',      // Emerald - 节点默认，清新自然
    hover: '#059669',       // 深翡翠
  },
  warning: {
    normal: '#F59E0B',      // Amber - 高亮/搜索，温暖亮眼
    hover: '#D97706',       // 深琥珀
  },
  neutral: {
    light: '#CBD5E1',       // Slate-300 - 浅灰，用于边线
    lighter: '#E2E8F0',     // Slate-200 - 更浅
    muted: '#94A3B8',       // Slate-400 - 次要文字
  },
};

/**
 * 可视化状态枚举
 */
export enum VisualState {
  NORMAL = 'normal',
  SELECTED = 'selected',
  HIGHLIGHTED = 'highlighted',
}

/**
 * G6图表中的节点样式配置
 * 包含normal、selected、highlighted三种状态
 */
export const GRAPH_NODE_STYLES = {
  [VisualState.NORMAL]: {
    fill: COLOR_PALETTE.success.normal,
    stroke: COLOR_PALETTE.success.normal,
    lineWidth: 1.5,
    shadowBlur: 8,
    shadowColor: `${COLOR_PALETTE.success.normal}40`,
  },
  [VisualState.SELECTED]: {
    fill: COLOR_PALETTE.primary.normal,
    stroke: COLOR_PALETTE.primary.normal,
    lineWidth: 2.5,
    shadowBlur: 16,
    shadowColor: `${COLOR_PALETTE.primary.glow}60`,
  },
  [VisualState.HIGHLIGHTED]: {
    fill: COLOR_PALETTE.warning.normal,
    stroke: COLOR_PALETTE.warning.normal,
    lineWidth: 2.5,
    shadowBlur: 20,
    shadowColor: `${COLOR_PALETTE.warning.normal}70`,
  },
};

/**
 * G6图表中的边样式配置
 * 包含normal、selected、highlighted三种状态
 * 采用更清晰的设计，提升边线在毛玻璃背景下的可见性
 */
export const GRAPH_EDGE_STYLES = {
  [VisualState.NORMAL]: {
    stroke: COLOR_PALETTE.neutral.light,
    lineWidth: 1.2,
    opacity: 0.55,
  },
  [VisualState.SELECTED]: {
    stroke: COLOR_PALETTE.primary.normal,
    lineWidth: 1.8,
    opacity: 0.95,
  },
  [VisualState.HIGHLIGHTED]: {
    stroke: COLOR_PALETTE.warning.normal,
    lineWidth: 1.8,
    opacity: 1,
  },
};

/**
 * 超图中的节点样式配置（与普通图相同）
 */
export const HYPERGRAPH_NODE_STYLES = {
  ...GRAPH_NODE_STYLES,
};

/**
 * 超图中的边样式配置（超图中边通常不显示）
 */
export const HYPERGRAPH_EDGE_STYLES = {
  [VisualState.NORMAL]: {
    stroke: 'transparent',
    lineWidth: 0,
    opacity: 0,
  },
  [VisualState.SELECTED]: {
    stroke: 'transparent',
    lineWidth: 0,
    opacity: 0,
  },
  [VisualState.HIGHLIGHTED]: {
    stroke: 'transparent',
    lineWidth: 0,
    opacity: 0,
  },
};

/**
 * 超图中的边默认样式（用于图表初始化）
 */
export const HYPERGRAPH_EDGE_DEFAULT_STYLE = {
  stroke: '#B4E5FF',
  opacity: 0.6,
};

/**
 * 超边样式配置
 * 超边有不同的颜色调色板（梯度化设计，更具现代感），同时也支持selected和highlighted状态
 * 采用高饱和度，在极低透明度下有足够的可读性
 */
export const HYPEREDGE_COLOR_PALETTE = [
  { fill: '#6366F1', stroke: '#4F46E5' }, // Indigo
  { fill: '#10B981', stroke: '#059669' }, // Emerald
  { fill: '#F59E0B', stroke: '#D97706' }, // Amber
  { fill: '#8B5CF6', stroke: '#7C3AED' }, // Violet
  { fill: '#06B6D4', stroke: '#0891B2' }, // Cyan
  { fill: '#EC4899', stroke: '#BE185D' }, // Pink
  { fill: '#EF4444', stroke: '#DC2626' }, // Red
  { fill: '#14B8A6', stroke: '#0D9488' }, // Teal
  { fill: '#F97316', stroke: '#EA580C' }, // Orange
  { fill: '#6B21A8', stroke: '#581C87' }, // Purple
];

/**
 * 超边状态下的特殊样式覆盖
 * 用于在selected或highlighted时覆盖调色板颜色
 */
export const HYPEREDGE_STATE_OVERRIDES = {
  [VisualState.NORMAL]: null, // 使用调色板颜色
  [VisualState.SELECTED]: {
    fill: COLOR_PALETTE.primary.normal,
    stroke: COLOR_PALETTE.primary.hover,
  },
  [VisualState.HIGHLIGHTED]: {
    fill: COLOR_PALETTE.warning.normal,
    stroke: COLOR_PALETTE.warning.hover,
  },
};

/**
 * 超边的opacity配置
 * 在毛玻璃背景下的透明度调整，确保清晰度
 */
export const HYPEREDGE_OPACITY = {
  [VisualState.NORMAL]: 0.08,      // 极淡，像一片能量场
  [VisualState.SELECTED]: 0.25,    // 更清晰的选中状态
  [VisualState.HIGHLIGHTED]: 0.3,  // 高亮状态最清晰
};

export const HYPEREDGE_STROKE_OPACITY = {
  [VisualState.NORMAL]: 0.6,
  [VisualState.SELECTED]: 1,
  [VisualState.HIGHLIGHTED]: 1,
};

/**
 * UI卡片（ItemCard）的Tailwind样式配置
 */
export const UI_CARD_STATE_CLASSES = {
  [VisualState.NORMAL]: 'shadow hover:shadow-md',
  [VisualState.SELECTED]: 'shadow-lg ring-2 ring-offset-2 ring-primary',
  [VisualState.HIGHLIGHTED]: 'shadow-lg ring-2 ring-offset-2 ring-yellow-400 bg-yellow-50',
};

/**
 * UI卡片类型对应的徽章颜色（现代化调整）
 */
export const UI_CARD_TYPE_COLORS: Record<'node' | 'edge' | 'hyperedge' | 'item', string> = {
  node: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  edge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  hyperedge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  item: 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300',
};

/**
 * UI卡片类型对应的边框颜色（现代化调整）
 */
export const UI_CARD_TYPE_BORDERS: Record<'node' | 'edge' | 'hyperedge' | 'item', string> = {
  node: 'border-indigo-300/50 dark:border-indigo-500/40 hover:border-indigo-500 dark:hover:border-indigo-400',
  edge: 'border-emerald-300/50 dark:border-emerald-500/40 hover:border-emerald-500 dark:hover:border-emerald-400',
  hyperedge: 'border-violet-300/50 dark:border-violet-500/40 hover:border-violet-500 dark:hover:border-violet-400',
  item: 'border-slate-300/50 dark:border-slate-500/40 hover:border-slate-500 dark:hover:border-slate-400',
};

/**
 * 获取节点在图表中的当前状态
 * @param isSelected 是否被选中
 * @param isHighlighted 是否被高亮（搜索/聊天结果）
 * @returns VisualState
 */
export function getNodeVisualState(isSelected: boolean, isHighlighted: boolean): VisualState {
  if (isHighlighted) return VisualState.HIGHLIGHTED;
  if (isSelected) return VisualState.SELECTED;
  return VisualState.NORMAL;
}

/**
 * 获取边在图表中的当前状态
 * @param isSelected 是否被选中
 * @param isHighlighted 是否被高亮（搜索/聊天结果）
 * @returns VisualState
 */
export function getEdgeVisualState(isSelected: boolean, isHighlighted: boolean): VisualState {
  if (isHighlighted) return VisualState.HIGHLIGHTED;
  if (isSelected) return VisualState.SELECTED;
  return VisualState.NORMAL;
}

/**
 * 获取超边颜色（从调色板中循环取得）
 * @param index 超边的索引
 * @returns { fill: string, stroke: string }
 */
export function getHyperedgeColorByIndex(index: number) {
  return HYPEREDGE_COLOR_PALETTE[index % HYPEREDGE_COLOR_PALETTE.length];
}

/**
 * 获取超边在当前状态下的颜色
 * @param visualState 当前视觉状态
 * @param paletteIndex 调色板中的索引（用于normal状态）
 * @returns { fill: string, stroke: string }
 */
export function getHyperedgeColorByState(visualState: VisualState, paletteIndex: number) {
  const stateOverride = HYPEREDGE_STATE_OVERRIDES[visualState];
  if (stateOverride) {
    return stateOverride;
  }
  return getHyperedgeColorByIndex(paletteIndex);
}

/**
 * 获取UI卡片的当前状态类
 * @param isSelected 是否被选中
 * @param isHighlighted 是否被高亮（搜索/聊天结果）
 * @returns Tailwind class string
 */
export function getCardStateClasses(isSelected: boolean, isHighlighted: boolean): string {
  if (isHighlighted) return UI_CARD_STATE_CLASSES[VisualState.HIGHLIGHTED];
  if (isSelected) return UI_CARD_STATE_CLASSES[VisualState.SELECTED];
  return UI_CARD_STATE_CLASSES[VisualState.NORMAL];
}
