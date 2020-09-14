import { createDOM } from "../react/vdom";
function render(element, container) {
  // 1.把虚拟Dom(React.createElement()返回的vnode对象{$$typeof,ref,key,type,props,})变成真实Dom元素
  const dom = createDOM(element);
  console.log("render", dom);
  // 2.将真实Dom挂在container上
  container.appendChild(dom);
}

export default {
  render,
};
