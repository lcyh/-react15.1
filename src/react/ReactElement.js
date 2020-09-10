import ReactCurrentOwner from "./ReactCurrentOwner";
import { REACT_ELEMENT_TYPE } from "../shared/ReactSymbols";
function hasValidRef(config) {
  return config.ref !== undefined;
}
function hasValidKey(config) {
  return config.key !== undefined;
}
let RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};
export function createElement(type, config, children) {
  let propName; //属性名
  let props = {}; //元素的props对象
  let key = null; // 在兄弟节点中唯一标识符
  let ref = null; // ref=React.createRef() 'userName' this.refs.userName  {(input)=>this.userName=input} 得到Dom元素
  let self = null; // 获取真实的this指针
  let source = null; // 定位创建此虚拟Dom元素在源码的位置 哪个文件 哪一行 那一列
  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = config.key;
    }
    self = config.__self === undefined ? null : config.__sel;
    source = config.__source === undefined ? null : config.__source;
    for (propName in config) {
      if (!RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  let childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children; //如果说是独生子的话children是一个对象
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childArray.length; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray; //如果说是有多个儿子的话，props.children就是一个数组了
  }

  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      // props里没有 defaultProps的属性时
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}

// React.createELement() 返回的是虚拟vdom 对象
function ReactElement(type, key, ref, _self, _source, _owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    _self,
    _source,
    _owner,
  };
  return element;
}
