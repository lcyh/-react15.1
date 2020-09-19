import { onlyOne, setProps, patchProps } from "./utils";
import {
  ELEMENT,
  TEXT,
  FUNCTION_COMPONENT,
  CLASS_COMPONENT,
  MOVE,
  REMOVE,
  INSERT,
} from "./constants";
let diffQueue = [];
let updateDepth = 0;
export function compareTwoElements(oldRenderElement, newRenderElement) {
  oldRenderElement = onlyOne(oldRenderElement);
  newRenderElement = onlyOne(newRenderElement);
  let currentDOM = oldRenderElement.dom; //先取出老的DOM节点
  let currentElement = oldRenderElement;
  if (newRenderElement == null) {
    currentDOM.parentNode.removeChild(currentDOM); //如果新的虚拟DOM节点为NULL。则要干掉老节点
    currentDOM = null;
  } else if (oldRenderElement.type != newRenderElement.type) {
    //span div function class
    let newDOM = createDOM(newRenderElement); //如果节点类型不同，则需要创建新的DOM节点，然后把老DOM节点替换掉
    currentDOM.parentNode.replaceChild(newDOM, currentDOM);
    currentElement = newRenderElement;
  } else {
    //新老节点都有，并且类型一样。 div span 就要进行dom diff 深度比较 比较他们的属性和他们的子节点，而且还要尽可能复用老节点
    updateElement(oldRenderElement, newRenderElement);
  }
  return currentElement;
}
function updateElement(oldElement, newElement) {
  let currentDOM = oldElement.dom; //获取老的页面上真实存在的那个DOM节点
  newElement.dom = oldElement.dom; //DOM要实现复用,就是为了复用老的DOM节点
  if (oldElement.$$typeof === TEXT && newElement.$$typeof === TEXT) {
    if (oldElement.content !== newElement.content)
      //如果说老的文本内容 和新的文本内容不一样的话
      currentDOM.textContent = newElement.content;
  } else if (oldElement.$$typeof === ELEMENT) {
    //如果是元素类型 span div p
    // 先更新父节点的属性，再比较更新子节点
    updateDOMProperties(currentDOM, oldElement.props, newElement.props);
    updateChildrenElements(
      currentDOM,
      oldElement.props.children,
      newElement.props.children
    );
    //会把newElement的props赋给oldElement.props
    //如果当前是element元素。会把newElement.props(包括 children) 赋给oldElement.props
    oldElement.props = newElement.props; //赋完值之后，老的虚拟DOM就没有，使用新虚拟DOM了元素
  } else if (oldElement.$$typeof === FUNCTION_COMPONENT) {
    updateFunctionComponent(oldElement, newElement);
  } else if (oldElement.$$typeof === CLASS_COMPONENT) {
    updateClassComponent(oldElement, newElement);
  }
}
//oldChildrenElements=[[]] []  newChildrenElements=[[div]] [div] [div,div]
function updateChildrenElements(dom, oldChildrenElements, newChildrenElements) {
  updateDepth++; //每进入一个新的子层级，就让updateDepth++
  diff(dom, oldChildrenElements, newChildrenElements, diffQueue);
  updateDepth--; //每比较完一层，返回上一级的时候，就updateDepth--
  if (updateDepth === 0) {
    //updateDepth等于，就说明回到最上面一层了，整个更新对比就完事了
    patch(diffQueue); //把收集到的差异 补丁传给patch方法进行更新
    diffQueue.length = 0;
  }
}
function patch(diffQueue) {
  //第1步要把该删除的全部删除 MOVE REMOVE
  let deleteMap = {};
  let deleteChildren = [];
  for (let i = 0; i < diffQueue.length; i++) {
    let difference = diffQueue[i];
    let { type, fromIndex, toIndex } = difference;
    if (type === MOVE || type === REMOVE) {
      let oldChildDOM = difference.parentNode.children[fromIndex]; //先获取老的DOM节点
      deleteMap[fromIndex] = oldChildDOM; //为了方便后面复用，放到map里
      deleteChildren.push(oldChildDOM);
    }
  }
  //把移动的和REMOVE全部删除 B D
  deleteChildren.forEach((childDOM) => {
    childDOM.parentNode.removeChild(childDOM);
  });
  for (let i = 0; i < diffQueue.length; i++) {
    let { type, fromIndex, toIndex, parentNode, dom } = diffQueue[i];
    switch (type) {
      case INSERT:
        insertChildAt(parentNode, dom, toIndex);
        break;
      case MOVE:
        insertChildAt(parentNode, deleteMap[fromIndex], toIndex);
        break;
      default:
        break;
    }
  }
}
//要向index这个索引位置插入
function insertChildAt(parentNode, newChildDOM, index) {
  let oldChild = parentNode.children[index]; //先取出这个索引位置的老的DOM节点
  oldChild
    ? parentNode.insertBefore(newChildDOM, oldChild)
    : parentNode.appendChild(newChildDOM);
}
/**
 * 先更新和移动的都是子节点
 *
 * 1. 先更新父节点还是先更新子节点? 先更新的是父节点
 * 2. 先移动父节点还是先移动子节点？ 先移动的是子节点
 */
function diff(parentNode, oldChildrenElements, newChildrenElements) {
  //oldChildrenElementsMap={G,A} newChildrenElementsMap={A,G}
  let oldChildrenElementsMap = getChildrenElementsMap(oldChildrenElements); //{A,B,C,D}
  let newChildrenElementsMap = getNewChildrenElementsMap(
    oldChildrenElementsMap,
    newChildrenElements
  );
  let lastIndex = 0;
  //比较是深度优先的，所以先放子节的补丁，再放父节点的补丁
  for (let i = 0; i < newChildrenElements.length; i++) {
    let newChildElement = newChildrenElements[i];
    if (newChildElement) {
      let newKey = newChildElement.key || i.toString();
      let oldChildElement = oldChildrenElementsMap[newKey];
      if (newChildElement === oldChildElement) {
        //说明他们是同一个对象，是复用老节点
        if (oldChildElement._mountIndex < lastIndex) {
          diffQueue.push({
            parentNode, //我要移除哪个父节点下的元素
            type: MOVE,
            fromIndex: oldChildElement._mountIndex,
            toIndex: i,
          });
        }
        lastIndex = Math.max(oldChildElement._mountIndex, lastIndex);
      } else {
        //如果新老元素不相等，是直接 插入
        diffQueue.push({
          parentNode,
          type: INSERT,
          toIndex: i,
          dom: createDOM(newChildElement),
        });
      }
      newChildElement._mountIndex = i; //更新挂载索引
    } else {
      //newChildElement==null
      let newKey = i.toString();
      if (
        oldChildrenElementsMap[newKey].componentInstance &&
        oldChildrenElementsMap[newKey].componentInstance.componentWillUnmount
      ) {
        oldChildrenElementsMap[newKey].componentInstance.componentWillUnmount();
      }
    }
  }
  for (let oldKey in oldChildrenElementsMap) {
    if (!newChildrenElementsMap.hasOwnProperty(oldKey)) {
      let oldChildElement = oldChildrenElementsMap[oldKey];
      diffQueue.push({
        parentNode,
        type: REMOVE,
        fromIndex: oldChildElement._mountIndex, //3
      });
    }
  }
}
// 获取新虚拟DOM的map对象
function getNewChildrenElementsMap(
  oldChildrenElementsMap,
  newChildrenElements
) {
  let newChildrenElementsMap = {};
  for (let i = 0; i < newChildrenElements.length; i++) {
    let newChildElement = newChildrenElements[i];
    if (newChildElement) {
      let newKey = newChildElement.key || i.toString();
      let oldChildElement = oldChildrenElementsMap[newKey];
      // 子节点的key相同,type类型也相同，type指的是 div,span元素类型
      if (canDeepCompare(oldChildElement, newChildElement)) {
        //在此处递归子节点
        updateElement(oldChildElement, newChildElement);
        newChildrenElements[i] = oldChildElement; // 复用老节点
      }
      // 将每个新虚拟vnode节点，存在map数组里
      // key是新的索引，value是新的对应的虚拟DOM
      newChildrenElementsMap[newKey] = newChildrenElements[i];
    }
  }
  return newChildrenElementsMap;
}
function canDeepCompare(oldChildElement, newChildElement) {
  // oldChildElement有值，说明新老元素的key相同,并且都有值
  if (!!oldChildElement && !!newChildElement) {
    // key相同,type类型也相同，type指的是 div,span元素类型
    return oldChildElement.type === newChildElement.type;
  }
  return false;
}
//如果是要更新一个函数组件 1.拿 到老元素 2.重新执行函数组件拿 到新的元素 进行对比
function updateFunctionComponent(oldElement, newElement) {
  let oldRenderElement = oldElement.renderElement; //获取老的渲染出来的元素
  let newRenderElement = newElement.type(newElement.props); // newElement.type=FunctionCounter
  let currentElement = compareTwoElements(oldRenderElement, newRenderElement);
  newElement.renderElement = currentElement;
}
function updateClassComponent(oldElement, newElement) {
  //类组件的实例永远只有一个componentInstance
  let componentInstance = (newElement.componentInstance =
    oldElement.componentInstance); //获取老的类组件实例
  let updater = componentInstance.$updater;
  let nextProps = newElement.props; //新的属性对象
  if (oldElement.type.contextType) {
    componentInstance.context = oldElement.type.contextType.Provider.value;
  }
  if (componentInstance.componentWillReceiveProps) {
    componentInstance.componentWillReceiveProps(nextProps);
  }
  if (newElement.type.getDerivedStateFromProps) {
    let newState = newElement.type.getDerivedStateFromProps(
      nextProps,
      componentInstance.state
    );
    if (newState) {
      componentInstance.state = { ...componentInstance.state, ...newState };
    }
  }
  updater.emitUpdate(nextProps);
}
function updateDOMProperties(dom, oldProps, newProps) {
  patchProps(dom, oldProps, newProps);
}

function getChildrenElementsMap(oldChildrenElements) {
  let oldChildrenElementsMap = {};
  for (let i = 0; i < oldChildrenElements.length; i++) {
    let oldKey = oldChildrenElements[i].key || i.toString();
    oldChildrenElementsMap[oldKey] = oldChildrenElements[i];
  }
  return oldChildrenElementsMap;
}

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
  if (type.getDerivedStateFromProps) {
    let newState = type.getDerivedStateFromProps(
      props,
      componentInstance.state
    );
    if (newState) {
      componentInstance.state = { ...componentInstance.state, ...newState };
    }
  }
  if (componentInstance.componentDidMount) {
    componentInstance.componentDidMount();
  }
  if (ref) {
    ref.current = componentInstance;
  }
  if (componentInstance.contextType) {
    componentInstance.context = componentInstance.contextType.Provider.value;
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
  element.props.children &&
    element.props.children.forEach((child, index) => {
      //child其实是虚拟DOM，我们会在虚拟DOM加一个属性_mountIndex,指向此虚拟DOM节点在父节点中的索引
      //在后面我们做dom-diff的时候会变得非常非常重要
      child._mountIndex = index;
      let childDOM = createDOM(child); //创建子虚拟DOM节点的真实DOM元素
      parentNode.appendChild(childDOM);
    });
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
