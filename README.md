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
- React 合成事件
  - 1.通过 document.addEventListener(eventType.slice(2),dispatchEvent,false),事件冒泡到 document 监听事件；
  - 2.dispatchEvent 是原生事件,getSyntheticEvent(event)额外获得带有 persist()持久化方法的事件对象;
  - 3.将第一次获得的事件对象会传给 listener.call(target,syntheticEvent)作为参数，此时 listener 回调函数就有原生事件对象所有的属性了,所以我们平时的合成事件 listener 回调函数里的 event 对象其实是 document.addEventListener(eventType,dispatchEvent,false)中 dispatchEvent(event)函数的原生事件对象 event;
  - 4.persist()持久化函数会创建新的事件对象给 syntheticEvent(2 号事件对象跟第一次创建的 syntheticEvent 是不同的引用，没有关系),因此调用了改函数后，在 listener()函数里的异步函数(宏任务,会先放到事件队列里)里拿到的始终是第一次创建的 syntheticEvent 事件对象;如果不调用 persist()函数,第一次闯将的 syntheticEvent 事件对象会被清理掉，从而在异步事件里拿不到；
- setState,合成事件和生命周期批量更新，setTimeout，addEventListener 同步更新(立即更新)
  - 1.合成事件里批量更新,原因是合成事件里刚开始是批量更新模式（isPending=true），会将 partialState 的值都缓存放在一个数组队列里,先执行合成事件里的同步代码(例如：console.log(this.state.number)),执行完之后 isPending=false,处于立即执行模式，会调用 componentInstance.forceUpdate()方法；
  - 2.componentInstance.forceUpdate()方法会比较新老 vnode 虚拟节点，
    - 如果新的虚拟 DOM 节点为 NULL。则要干掉老节点
    - 比较新老元素的 type 类型，如果节点类型不同，则需要创建新的 DOM 节点，然后把老 DOM 节点替换掉
    - 新老节点都有，并且类型一样。 div span 就要进行 dom diff 深度比较 比较他们的属性和他们的子节点，而且还要尽可能复用老节点
