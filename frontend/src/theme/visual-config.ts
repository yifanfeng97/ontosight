/**
 * 统一的视觉配置文件
 * 集中管理所有UI元素的三种状态（default、selected、highlighted）的样式
 * 包括G6图表、超边、卡片等所有可视化组件
 * 
 * 配色系统：Modern Digital Palette
 * - Primary (Indigo/紫罗兰)：用于选中和强调
 * - Success (Emerald/翡翠绿)：默认节点颜色，生机活力
 * - Warning (Amber/琥珀色)：搜索/高亮，温暖亮眼
 * - Neutral (Slate/石板灰)：边线和次要元素，极简感
 */

/**
 * 全局色彩调色板 - 进化为饱满的“紫罗兰宝石 (Vibrant Amethyst)”风格
 */
export const COLOR_PALETTE = {
  primary: {
    normal: '#6366F1',      // Indigo - 核心智能力量
    hover: '#4F46E5',
    glow: '#818CF8',        // 亮靛蓝
  },
  success: {
    normal: '#8B5CF6',      // Violet - 节点改为饱满的紫罗兰宝石色
    hover: '#7C3AED',
  },
  warning: {
    normal: '#FFD700',      // Cyber Gold - 更加明亮的赛博金
    hover: '#F59E0B',
    glow: '#FDE68A',        // 亮金光
  },
  neutral: {
    light: '#64748B',       // Slate-500 - 调深以确保在亮色云母背景下依然清晰
    lighter: '#F1F5F9',     // Slate-100
    muted: '#94A3B8',
  },
};

/**
 * 文本配色系统
 * 采用极简设计，确保在各种背景下清晰易读
 */
export const TEXT_PALETTE = {
  label: '#1E293B',         // Slate-800 - 标准标签颜色
  description: '#64748B',   // Slate-500 - 次要描述
  contrast: '#FFFFFF',      // 白色 - 用于反差背景
  halo: '#FFFFFF',          // 描边（Halo）色，确保在深色/复杂背景下清晰
};

/**
 * 基础标签配置
 * 统一图中所有元素的文字呈现方式 - 增加 Halo 效果确保在气泡深处可见
 */
export const BASE_LABEL_CONFIG = {
  fontSize: 12,
  fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
  fontWeight: 600,
  fill: TEXT_PALETTE.label,
  stroke: TEXT_PALETTE.halo,
  lineWidth: 3,             // 3px Halo 确保在任何背景下清晰
  lineAppendWidth: 2,
};

/**
 * 布局间隔配置
 * 统一调整力导向图的碰撞半径和元素间距
 */
export const LAYOUT_SPACING_CONFIG = {
  nodeCollideRadius: 40,    // 节点碰撞半径
  labelOffset: 15,          // 标签相对于中心点的偏移
};

/**
 * 可视化状态枚举
 */
export enum VisualState {
  DEFAULT = 'default',
  SELECTED = 'selected',
  HIGHLIGHTED = 'highlighted',
}

/**
 * G6图表中的节点样式配置 - 紫罗兰宝石 (Vibrant Amethyst Beads)
 */
export const GRAPH_NODE_STYLES = {
  [VisualState.DEFAULT]: {
    fill: COLOR_PALETTE.success.normal,
    stroke: '#FFFFFF',
    lineWidth: 1.5,
    shadowBlur: 15,
    shadowColor: `${COLOR_PALETTE.success.normal}80`, // 更加饱满的紫色霓虹光
    // 默认标签 - 保持低干扰
    labelFill: TEXT_PALETTE.label,
    labelStroke: TEXT_PALETTE.halo,
    labelLineWidth: 3,
    labelFontSize: 12,
    labelFontWeight: 500,
    labelBackgroundFill: 'rgba(255, 255, 255, 0.4)',
    labelBackgroundRadius: 6,
    labelPadding: [2, 6],
    labelPlacement: 'bottom' as any,
    labelDy: 10,
  },
  [VisualState.SELECTED]: {
    fill: COLOR_PALETTE.primary.normal,
    stroke: '#FFFFFF',
    lineWidth: 3,
    shadowBlur: 30,
    shadowColor: `${COLOR_PALETTE.primary.glow}B0`, // 极强发光
    // 选中时标签加重
    labelFontWeight: 800,
    labelFill: COLOR_PALETTE.primary.normal,
    labelFontSize: 14,
  },
  [VisualState.HIGHLIGHTED]: {
    fill: COLOR_PALETTE.warning.normal,
    stroke: '#FFFFFF',
    lineWidth: 3,
    shadowBlur: 35,
    shadowColor: `${COLOR_PALETTE.warning.normal}A0`,
    labelFontWeight: 800,
    labelFill: '#000000',
    labelFontSize: 14,
  },
};

/**
 * G6图表中的边样式配置 - 发光光纤 (Glowing Optical Fibers)
 */
export const GRAPH_EDGE_STYLES = {
  [VisualState.DEFAULT]: {
    stroke: '#CBD5E1', // 更淡的 Slate-300
    lineWidth: 1.2,
    opacity: 0.45, // 降低浓度但保持线条轮廓
    // 默认标签样式
    labelFill: '#1E293B',  // Slate-800，最高对比度
    labelFontSize: 11,
    labelFontWeight: 700,
    labelBackgroundFill: '#FFFFFF',
    labelBackgroundOpacity: 0.75, // 降低背景不透明度，使其更自然
    labelBackgroundRadius: 4,
    labelPadding: [2, 4],
  },
  [VisualState.SELECTED]: {
    stroke: COLOR_PALETTE.primary.normal,
    lineWidth: 3,
    opacity: 1,
    shadowBlur: 10,
    shadowColor: `${COLOR_PALETTE.primary.normal}80`,
    // 选中时标签加粗加深
    labelFill: COLOR_PALETTE.primary.normal,
    labelFontSize: 12,
    labelFontWeight: 800,
    labelBackgroundFill: '#FFFFFF',
    labelBackgroundOpacity: 0.85, // 从纯白改为微透
  },
  [VisualState.HIGHLIGHTED]: {
    stroke: COLOR_PALETTE.warning.normal,
    lineWidth: 3.5,
    opacity: 1,
    shadowBlur: 10,
    shadowColor: `${COLOR_PALETTE.warning.normal}60`,
    labelFill: '#000000',
    labelFontWeight: 800,
    labelBackgroundFill: '#FFFFFF',
    labelBackgroundOpacity: 0.85,
    labelBackgroundRadius: 4,
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
  [VisualState.DEFAULT]: {
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
 * 超边样式配置 - 有机薄膜 (Organic Membranes)
 * 为气泡集添加柔和的阴影扩散，使其看起来像浮动的星云
 */
export const HYPEREDGE_STATE_OVERRIDES = {
  [VisualState.DEFAULT]: null, // 使用调色板颜色
  [VisualState.SELECTED]: {
    fill: COLOR_PALETTE.primary.normal,
    stroke: COLOR_PALETTE.primary.hover,
    shadowBlur: 50,
    shadowColor: `${COLOR_PALETTE.primary.glow}40`,
  },
  [VisualState.HIGHLIGHTED]: {
    fill: COLOR_PALETTE.warning.normal,
    stroke: COLOR_PALETTE.warning.hover,
    shadowBlur: 60,
    shadowColor: `${COLOR_PALETTE.warning.normal}50`,
  },
};

/**
 * 超边的opacity配置
 * 提高色彩饱满度，界面层级更清晰
 */
export const HYPEREDGE_OPACITY = {
  [VisualState.DEFAULT]: 0.20,      // 更有存在感的超边背景
  [VisualState.SELECTED]: 0.35,    // 选中时晶体效果增强
  [VisualState.HIGHLIGHTED]: 0.40,  // 搜索时高亮最强
};

export const HYPEREDGE_STROKE_OPACITY = {
  [VisualState.DEFAULT]: 0.75,      // 增强边缘界限感
  [VisualState.SELECTED]: 0.95,
  [VisualState.HIGHLIGHTED]: 1.0,
};

/**
 * 超边标签配置
 * 强化大标签的现代感
 */
export const HYPEREDGE_LABEL_CONFIG = {
  labelFontSize: 15,
  labelFontWeight: 800,
  labelFill: TEXT_PALETTE.label,
  labelStroke: TEXT_PALETTE.halo,
  labelLineWidth: 4,             // 超边光影复杂，Halo 最大
  labelLetterSpacing: 1.5,
};

/**
 * 统一的毛玻璃（Backdrop Blur）配置 - 云母果冻风格 (Mica Jelly Style)
 * 采用更高的模糊值以隔离复杂的背景图谱
 */
export const BACKDROP_BLUR_CONFIG = {
  LIGHT: 'backdrop-blur-[20px]',
  BASE: 'backdrop-blur-[40px]',
  STRONG: 'backdrop-blur-[60px]',
  ULTRA: 'backdrop-blur-[80px]',
};

/**
 * UI卡片（ItemCard）的Tailwind样式配置
 * 使用更具有物理感的阴影和圆角
 */
export const UI_CARD_STATE_CLASSES = {
  [VisualState.DEFAULT]: 'shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2',
  [VisualState.SELECTED]: 'shadow-[0_15px_35px_rgba(79,70,229,0.15)] ring-2 ring-indigo-500/50 bg-white/90 scale-[1.02]',
  [VisualState.HIGHLIGHTED]: 'shadow-[0_15px_35px_rgba(245,158,11,0.15)] ring-2 ring-amber-400/50 bg-amber-50/80 scale-[1.02]',
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
  return VisualState.DEFAULT;
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
  return VisualState.DEFAULT;
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
 * @param paletteIndex 调色板中的索引（用于default状态）
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
  return UI_CARD_STATE_CLASSES[VisualState.DEFAULT];
}
