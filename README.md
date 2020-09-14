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

- React.createElement(type,config,children)
  - @babel/preset-react
  - 1.讲 react 的 jsx 语法转换成 React.createElement()
  - 2.每个标签或者文本都讲转换成 React.createElement(),返回的是 vnode 对象 {\$\$typeof,ref,key,props,\_self,\_source}
  - 3.children 如果是一个的话，props.children 就是一个对象;否则是一个数组
- ReactDom.render(element)
  - 目的：将虚拟 vnode 对象{\$\$typeof,key,ref,props,,,}转换成真实 DOM 元素并插入到页面里,最终在浏览器展现出来
  - 对虚拟 dom 节点处理：
    - 1.createDOM()方法会根据 element 虚拟节点对象的\$\$typeof 类型区分是 TEXT(文本 'hello' 123), ELEMENT(标签元素 div,span,p), CLASS_COMPONENT(类组件),FUNCTION_CPMPONENT(函数式组件)
    - 2.类组件：let renderElement = new ClassComponent(props);creteDOM(renderElement)，递归创建子节点 appendChild 到父节点里，形成组件最终的真实 DOMTree,然后插入到父元素里;
    - 3.函数式组件：let renderElement=FunctionComponent(props);createDOM(renderElement),递归子节点 appendChild 到父节点里，形成组件最终的真实 DOMTree,然后插入到父元素里;
  - 对虚拟 dom 节点的 props 属性处理：
    - 1.对于 onClick 等事件,通过 addEvent 合成事件统一处理，最终冒泡到 domcument.addEentListener(eventType,dispatchEvent,false);
    - 2.对于 props.children,通过 createDOMChildren(dom,element.children),这里 dom 相当于 children 的父节点 parentNode,循环遍历插入到父节点中；
    - 3.对于 props 里的其他属性(如：className,id,自定义属性)，通过 for(let key in props){ dom[key]=props[key]}赋值给了 dom 元素；
    - 4.props.children 做了扁平化处理，flatten(props.children)
