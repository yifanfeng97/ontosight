/**
 * 统一的视觉配置文件
 * 集中管理所有UI元素的三种状态（normal、selected、highlighted）的样式
 * 包括G6图表、超边、卡片等所有可视化组件
 */

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
    fill: '#87d068',
    stroke: '#666',
    lineWidth: 1,
  },
  [VisualState.SELECTED]: {
    fill: '#1890ff',
    stroke: '#1890ff',
    lineWidth: 3,
  },
  [VisualState.HIGHLIGHTED]: {
    fill: '#FFD700',
    stroke: '#FFA500',
    lineWidth: 2,
  },
};

/**
 * G6图表中的边样式配置
 * 包含normal、selected、highlighted三种状态
 */
export const GRAPH_EDGE_STYLES = {
  [VisualState.NORMAL]: {
    stroke: '#ccc',
    lineWidth: 1,
    opacity: 0.6,
  },
  [VisualState.SELECTED]: {
    stroke: '#1890ff',
    lineWidth: 2,
    opacity: 1,
  },
  [VisualState.HIGHLIGHTED]: {
    stroke: '#FFA500',
    lineWidth: 2,
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
 * 超边有不同的颜色调色板，同时也支持selected和highlighted状态
 */
export const HYPEREDGE_COLOR_PALETTE = [
  { fill: '#1890FF', stroke: '#0050B3' },
  { fill: '#52C41A', stroke: '#274704' },
  { fill: '#FA8C16', stroke: '#872000' },
  { fill: '#EB2F96', stroke: '#780C56' },
  { fill: '#13C2C2', stroke: '#0C464C' },
  { fill: '#722ED1', stroke: '#38165F' },
  { fill: '#F5222D', stroke: '#7F0000' },
  { fill: '#FA541C', stroke: '#7F2C00' },
  { fill: '#FFC53D', stroke: '#7F6400' },
  { fill: '#45B39D', stroke: '#0F5C4C' },
];

/**
 * 超边状态下的特殊样式覆盖
 * 用于在selected或highlighted时覆盖调色板颜色
 */
export const HYPEREDGE_STATE_OVERRIDES = {
  [VisualState.NORMAL]: null, // 使用调色板颜色
  [VisualState.SELECTED]: {
    fill: '#1890ff',
    stroke: '#0050b3',
  },
  [VisualState.HIGHLIGHTED]: {
    fill: '#FFD700',
    stroke: '#FFA500',
  },
};

/**
 * 超边的opacity配置
 */
export const HYPEREDGE_OPACITY = {
  [VisualState.NORMAL]: 0.1,
  [VisualState.SELECTED]: 0.3,
  [VisualState.HIGHLIGHTED]: 0.3,
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
 * UI卡片类型对应的徽章颜色
 */
export const UI_CARD_TYPE_COLORS: Record<'node' | 'edge' | 'hyperedge' | 'item', string> = {
  node: 'bg-blue-100 text-blue-800',
  edge: 'bg-green-100 text-green-800',
  hyperedge: 'bg-purple-100 text-purple-800',
  item: 'bg-gray-100 text-gray-800',
};

/**
 * UI卡片类型对应的边框颜色
 */
export const UI_CARD_TYPE_BORDERS: Record<'node' | 'edge' | 'hyperedge' | 'item', string> = {
  node: 'border-blue-300 hover:border-blue-500',
  edge: 'border-green-300 hover:border-green-500',
  hyperedge: 'border-purple-300 hover:border-purple-500',
  item: 'border-gray-300 hover:border-gray-500',
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
