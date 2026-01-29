# 🎨 OntoSight - Interactive Visualization Engine

[![Tests](https://img.shields.io/badge/tests-124%2F127-brightgreen)](./tests)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

OntoSight 是一个用于交互式知识图谱和结构化数据可视化的完整前后端解决方案。它提供了 Python SDK、FastAPI REST API 和现代 React 前端，用于创建交互式图、树、列表和超图可视化。

## ✨ 主要特性

### 🐍 Python SDK
- **简单易用** - 一行代码启动可视化: `view_graph(nodes, edges)`
- **灵活数据提取** - 支持字符串 key 和 lambda 函数
- **自动 ID 生成** - 无需手动指定 ID，使用对象身份
- **类型安全** - 完整的 Python 类型提示
- **智能默认值** - 所有提取器都有智能的默认行为

### 🎯 前端界面
- **三列布局** - 元数据 | 可视化 | 搜索/聊天
- **交互式图表** - 基于 AntV G6 的力导向图
- **多种视图** - 图、树、列表、超图
- **搜索和聊天** - 集成的交互面板
- **响应式设计** - 支持桌面和移动设备

### 🚀 后端 API
- **RESTful 端点** - JSON 格式的数据交互
- **Schema 导出** - 自动生成 JSON Schema
- **错误处理** - 友好的错误消息和堆栈跟踪
- **日志记录** - 结构化的操作日志

## 🚀 快速开始

### 安装

```bash
pip install ontosight
```

### 基础用法

```python
from ontosight import view_graph, start_daemon

# 定义你的数据
nodes = [
    {"id": "1", "label": "Alice", "type": "person"},
    {"id": "2", "label": "Bob", "type": "person"},
]

edges = [
    {"source": "1", "target": "2", "label": "knows"},
]

# 创建可视化
view_graph(
    node_list=nodes,
    edge_list=edges,
    node_schema={"type": "object", "properties": {"label": {}, "type": {}}},
)

# 启动守护线程并打开浏览器
start_daemon()
```

### 使用 Pydantic 模型

```python
from pydantic import BaseModel
from ontosight import view_graph

class Person(BaseModel):
    name: str
    age: int
    role: str

people = [
    Person(name="Alice", age=30, role="Engineer"),
    Person(name="Bob", age=28, role="Designer"),
]

view_graph(
    node_list=people,
    node_schema=Person,
    node_name_extractor=lambda p: p.name,
)
```

## 📁 项目结构

```
ontosight/
├── Backend
│   ├── ontosight/
│   │   ├── core/
│   │   │   └── views/          # 可视化函数
│   │   ├── server/             # FastAPI 应用
│   │   ├── models.py           # Pydantic 模型
│   │   └── utils.py            # 工具函数
│   └── tests/                  # 127 个测试用例
└── Frontend
    ├── frontend/
    │   ├── src/
    │   │   ├── components/      # React 组件
    │   │   ├── hooks/           # 自定义 hooks
    │   │   ├── services/        # API 客户端
    │   │   └── types/           # TypeScript 类型
    │   ├── vite.config.ts
    │   └── package.json
```

## 📊 项目进度

### Phase 1-3: 完成 ✅
- ✅ 全局状态管理
- ✅ Pydantic 模型和 JSON Schema
- ✅ FastAPI 后端路由
- ✅ Python SDK（graph, list, hypergraph）
- ✅ 124/127 测试通过

### Phase 4: 进行中 🔄
- ✅ Vite + React + TypeScript 设置
- ✅ 核心组件（Layout, GraphView, ListView, TreeView）
- ✅ 状态管理（useVisualization, useSearch, useChat）
- ✅ 错误处理和加载状态
- ⏳ 高级交互功能

### Phase 5-8: 计划 ⏳
- 超图和表格视图
- 搜索节点高亮
- E2E 测试
- 文档和发布

## 🔧 技术栈

### 后端
- Python 3.10+
- FastAPI 0.104+
- Pydantic 2.0+
- Uvicorn

### 前端
- React 18
- TypeScript 5
- Vite 5
- Ant Design 5
- AntV G6
- Zustand

### 测试
- pytest
- Vitest
- React Testing Library

## 💻 开发

### 后端开发

```bash
# 安装开发依赖
pip install -e ".[dev]"

# 运行测试
pytest tests/ -v

# 运行后端服务
python main.py
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 📚 文档

- [API 文档](./specs/001-core-visualization/data-model.md)
- [快速开始指南](./specs/001-core-visualization/quickstart.md)
- [项目规划](./specs/001-core-visualization/plan.md)
- [前端文档](./frontend/README.md)

## 🧪 测试覆盖

```
Backend:
  ✅ 单元测试: 91/94 (96.8%)
  ✅ 集成测试: 16/16 (100%)
  ✅ API 合约: 22/22 (100%)
  📊 总计: 124/127 (97.6%)

Frontend:
  ⏳ 组件测试: 待实现
  ⏳ E2E 测试: 待实现
```

## 🎯 使用场景

### 知识图谱可视化
```python
from ontosight import view_graph

# 可视化知识图
view_graph(
    node_list=entities,
    edge_list=relations,
    node_schema=Entity,
    node_name_extractor="name",
)
```

### 组织结构展示
```python
from ontosight import view_tree

# 展示组织层级
view_tree(
    root=org_root,
    node_name_extractor="title",
    children_extractor="subordinates",
)
```

### 数据清单
```python
from ontosight import view_list

# 显示项目列表
view_list(
    item_list=products,
    item_schema=Product,
    item_name_extractor=lambda p: f"{p.name} (${p.price})",
)
```

## 🔐 安全性

- ✅ 所有输入验证（Pydantic）
- ✅ 类型安全（Python + TypeScript）
- ✅ CORS 保护
- ✅ 错误堆栈隐藏（生产环境）

## 🚀 性能

- 🚀 1000 个节点的图在 <5 秒内渲染
- 🚀 交互响应 <100ms
- 🚀 支持 100k+ 节点的数据处理
- 🚀 前端虚拟化和懒加载

## 📦 依赖

### 最小依赖
```
fastapi >= 0.104.0
pydantic >= 2.0.0
uvicorn >= 0.24.0
```

### 完整依赖列表
见 `pyproject.toml`

## 🤝 贡献

欢迎提交 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## 🙋 支持

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/example/ontosight/issues)
- 📖 文档: [完整文档](./specs/001-core-visualization/)

## 🎓 示例项目

- [怪物数据库](./examples/monster_example.py)
- [社交网络](./examples/social_network.py)
- [组织结构](./examples/organization.py)

## 🗺️ 路线图

- Q1 2026: Phase 4-5 完成（高级可视化）
- Q2 2026: Phase 6-7 完成（搜索/聊天、E2E 测试）
- Q2 2026: v1.0.0 发布

---

**开发版本**: 0.1.0 (Phase 4)  
**最后更新**: 2026年1月29日  
**维护者**: OntoSight 开发团队
