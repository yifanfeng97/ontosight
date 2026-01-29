# OntoSight Frontend

Interactive visualization UI for OntoSight, built with React, TypeScript, and Ant Design.

## 🚀 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发服务器

```bash
npm run dev
```

前端将运行在 `http://localhost:5173`，并自动代理 API 请求到 `http://localhost:8000`。

### 生产构建

```bash
npm run build
```

输出目录: `../ontosight/static/`

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/       # React 组件
│   │   ├── Layout.tsx    # 主布局
│   │   ├── SearchPanel.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── MetaPanel.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── views/        # 可视化视图
│   │       ├── GraphView.tsx
│   │       ├── ListView.tsx
│   │       └── TreeView.tsx
│   ├── hooks/            # 自定义 hooks
│   │   ├── useVisualization.ts
│   │   ├── useSearch.ts
│   │   └── useChat.ts
│   ├── services/         # API 客户端
│   │   └── api.ts
│   ├── types/            # TypeScript 类型
│   │   └── api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
├── package.json
└── index.html
```

## 🛠️ 技术栈

- **框架**: React 18
- **语言**: TypeScript 5
- **构建工具**: Vite 5
- **UI 组件库**: Ant Design 5
- **图表库**: AntV G6
- **状态管理**: Zustand
- **HTTP 客户端**: Axios

## 🎨 组件说明

### Layout
三列布局结构：
- 左侧: 元数据和模式展示
- 中间: 主可视化区域
- 右侧: 搜索和聊天面板

### VisualizationRouter
根据数据类型自动选择合适的可视化组件：
- 图数据 → GraphView (G6)
- 列表数据 → ListView (Ant List)
- 树数据 → TreeView (Ant Tree)

### GraphView
使用 AntV G6 实现的交互式力导向图：
- 支持拖拽、缩放、平移
- 节点选中状态管理
- 自适应窗口大小

## 🔗 API 集成

所有 API 调用通过 `services/api.ts` 进行：

```typescript
import { apiClient } from '@/services/api';

// 获取元数据
const meta = await apiClient.getMeta();

// 获取可视化数据
const data = await apiClient.getData();

// 搜索
const results = await apiClient.search({ query: "..." });

// 聊天
const response = await apiClient.chat({ query: "..." });
```

## 📦 状态管理

使用 Zustand 管理全局状态：

```typescript
import { useVisualization } from '@/hooks/useVisualization';

const { meta, data, selectedNodes, selectNode } = useVisualization();
```

## 🎯 环境变量

复制 `.env.example` 为 `.env` 并根据需要修改：

```
VITE_API_URL=http://localhost:8000
```

## 📝 编码规范

- 使用 Prettier 进行代码格式化
- 使用 ESLint 进行代码检查
- TypeScript 严格模式启用
- 所有组件使用 React.memo 优化

## 🧪 测试 (即将推出)

```bash
npm run test          # 运行单元测试
npm run test:ui       # UI 测试界面
```

## 🚀 生产部署

1. 运行生产构建:
   ```bash
   npm run build
   ```

2. 将 `../ontosight/static` 提供给 Python 后端

3. 访问 `http://localhost:8000` 获取完整应用

## 📚 更多信息

- [OntoSight 文档](../specs/001-core-visualization/README.md)
- [Ant Design 文档](https://ant.design/)
- [AntV G6 文档](https://g6.antv.vision/)
- [Vite 文档](https://vitejs.dev/)
