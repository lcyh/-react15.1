import { addEvent } from "./event";
// 如果element是数组取第一个，保证始终是一个对象
export function onlyOne(element) {
  return Array.isArray(element) ? element[0] : element;
}

// 扁平化多维数组
export function flatten(array) {
  let flatted = [];
  (function flat(array) {
    array.forEach((item) => {
      if (Array.isArray(item)) {
        flat(item);
      } else {
        flatted.push(item);
      }
    });
  })(array);
  return flatted;
}

export function setProps(dom, props) {
  for (let key in props) {
    if (key !== "children") {
      let value = props[key];
      setProp(dom, key, value);
    }
  }
}
export function patchProps(dom, oldProps, newProps) {
  for (let key in oldProps) {
    // 这里只比较自身的属性，子节点不比较
    if (key !== "children") {
      // 新属性里没有之前的老属性，此时就删掉之前的老属性
      if (!newProps.hasOwnProperty(key)) {
        dom.removeAttribute(key);
      }
    }
  }
  for (let key in newProps) {
    if (key !== "children") {
      //此处只处理自己的DOM属性，不处理children节点
      setProp(dom, key, newProps[key]);
    }
  }
}
function setProp(dom, key, value) {
  //如果是以on开头的，说明是合成事件
  if (/^on/.test(key)) {
    // dom[key.toLowerCase()] = value; //稍后会改成合成事件
    addEvent(dom, key, value);
  } else if (key === "className") {
    dom.className = value;
  } else if (key === "style") {
    for (let styleName in value) {
      dom.style[styleName] = value[styleName];
    }
  } else {
    dom.setAttribute(key, value);
  }
}

export function isFunction(obj) {
  return typeof obj === "function";
}
