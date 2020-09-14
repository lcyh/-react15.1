import { onlyOne, setProps } from "./utils";
import {
  ELEMENT,
  TEXT,
  FUNCTION_COMPONENT,
  CLASS_COMPONENT,
} from "./constants";
//根据$$typeof类型创建不同类型的dom元素
export function createDOM(element) {
  element = onlyOne(element);
  let { $$typeof } = element;
  let dom = null;
  if (!$$typeof) {
    // 传的是文本或数字
    dom = document.createTextNode(element);
  } else if ($$typeof === TEXT) {
    //element是纯数字或字符串
    dom = document.createTextNode(element.content); //{$$typeof:TEXT,type:TEXT,content:'hello'}
  } else if ($$typeof === ELEMENT) {
    // 如果此虚拟DOM是原生dom节点
    dom = createNativeDOM(element);
  } else if ($$typeof === FUNCTION_COMPONENT) {
    // 此虚拟DOM是函数组件
    dom = createFunctionComponentDOM(element);
  } else if ($$typeof === CLASS_COMPONENT) {
    // 此虚拟DOM是类组件
    dom = createClassComponentDOM(element);
  }
  element.dom = dom; //不管是什么类型的元素，都让它的dom属性指向他创建出来的直实DOM元素
  return dom;
}
//函数组件
function createFunctionComponentDOM(element) {
  const { type, props } = element; //type = FunctionCounter
  let renderElement = type(props); //返回要渲染的react元素
  element.renderElement = renderElement; //需要缓存,方便下次对比
  let newDOM = createDOM(renderElement);
  //虚拟DOM的dom属性指向它创建出来的真实DOM
  renderElement.dom = newDOM; //我们从虚拟DOMReact元素创建出真实DOM，创建出来以后会把真实DOM添加到虚拟DOM的dom属性上
  return newDOM;
  //element.renderElement.dom=DIV真实DOM元素
}

function createClassComponentDOM(element) {
  let { type, ref, props } = element;
  let componentInstance = new type(props);
  if (ref) {
    ref.current = componentInstance;
  }
  // 当类组件创建后，在类组件的虚拟dom对象上添加componentInstance属性，指向类组件实例
  element.componentInstance = componentInstance; //以后组件运行当中componentInstance是不变的
  let renderElement = componentInstance.render();
  //在类组件上添加renderElement,指向上次要渲染的虚拟dom节点
  //因为后面组件更新时，我们重新会render，然后跟上一次renderElement进行dom-diff
  componentInstance.renderElement = renderElement;
  let newDOM = createDOM(renderElement);
  renderElement.dom = newDOM;
  // element.componentInstance.renderElement.dom=DIV真实DOM元素
  return newDOM;
}
/**
let element = React.createElement('button',
  { id: 'sayHello', onClick },
  'say', React.createElement('span', { color: 'red' }, 'Hello')
);
 */
function createNativeDOM(element) {
  let { type, ref, props } = element; // span button div
  let dom = document.createElement(type); // 真实的BUTTON DOM对象
  //1.如果此虚拟dom节点有子节点，创建子节点的元素
  createDOMChildren(dom, element);
  //2.设置此虚拟dom节点的属性props
  setProps(dom, props);
  if (ref) {
    ref.current = dom;
  }
  return dom;
}

function createDOMChildren(parentNode, element) {
  if (element.props.children && Array.isArray(element.props.children)) {
    element.props.children.forEach((child, index) => {
      // child是虚拟dom子节点，我们会在子节点加_mountIndex,指向此虚拟子节点在父节点中的索引，在dom-diff很有用
      child._mountIndex = index;
      let childDOM = createDOM(child);
      parentNode.appendChild(childDOM);
    });
  }
}

export function ReactElement($$typeof, type, key, ref, props) {
  let element = {
    $$typeof,
    type,
    key,
    ref,
    props,
  };
  return element;
}
