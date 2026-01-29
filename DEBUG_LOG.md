# 调试步骤总结

## 后端状态 ✅
- `/api/data` 端点返回正确的数据结构
- 数据包含 `payload` 字段，其中包含 `type` 和 `data`
- 示例响应：
```json
{
  "payload": {
    "type": "graph",
    "data": {
      "nodes": [...],
      "edges": [...]
    }
  }
}
```

## 前端已添加的日志
1. **App.tsx** - 添加了获取数据过程的日志：
   - `[App] Fetching meta...`
   - `[App] Meta response:`
   - `[App] Fetching data...`
   - `[App] Data response:` 和数据结构分析

2. **VisualizationRouter.tsx** - 添加了路由分发的日志：
   - `[VisualizationRouter] Received data:`
   - `[VisualizationRouter] Payload type:`
   - `[VisualizationRouter] View type:`

3. **GraphView.tsx** - 添加了渲染前的日志：
   - `[GraphView] useEffect triggered`
   - `[GraphView] data nodes/edges 数量`

## 前端已构建 ✅
- 运行了 `npm run build`
- 静态文件已更新到 `ontosight/static/`
- 包括新的日志代码

## 现在需要做的
1. **打开浏览器控制台**（F12）
2. **查看 Console 标签**，寻找 `[App]`, `[VisualizationRouter]`, `[GraphView]` 的日志
3. 检查是否有错误信息
4. 分享控制台输出和错误信息给我

## 常见问题排查
- 如果看到 "No data to visualize"：说明前端没有收到 payload
- 如果日志没有出现：可能是缓存问题，试试清除浏览器缓存（Cmd+Shift+Delete）
- 如果看到网络错误：检查后端是否真的在运行 (lsof -i :8000)
