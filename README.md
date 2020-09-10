## 手写一个简版 React

#### 包含以下主要内容：

- react16 = react15+fiber 重构
- 对标 15.1 版本
- 虚拟 DOM
- 原生 DOM、类组件、函数数组的渲染
- 组件的生命周期
- 异步的 setState 更新队列 批量更新 dirtyComponent
- 合成事件 实现事件对象复用
- Ref 各种各样的 ref React.createRef
- context api 上下文
- 高阶组件 HOC
- render props
- 只使用原生的 DOM，不使用 jquery
- domdiff
  - 节点的对比
  - 节点的更新
  - key 处理 尽量复用老节点
- 简单实现 hooks