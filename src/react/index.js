import {
  TEXT,
  ELEMENT,
  CLASS_COMPONENT,
  FUNCTION_COMPONENT,
} from "./constants";
import { ReactElement } from "./vdom";
import { Component } from "./component";
import { flatten, onlyOne } from "./utils";
function createElement(type, config = {}, ...children) {
  delete config.__source;
  delete config.__self;
  let { key, ref, ...props } = config;
  let $$typeof = null;
  if (typeof type === "string") {
    //span div button
    $$typeof = ELEMENT; //是一个原生的DOM类型
    //说明这个类型是一个类组件
  } else if (typeof type === "function" && type.prototype.isReactComponent) {
    $$typeof = CLASS_COMPONENT;
  } else if (typeof type === "function") {
    $$typeof = FUNCTION_COMPONENT; //说明是一个函数数组
  }
  children = flatten(children);
  props.children = children.map((item) => {
    if (typeof item === "object" || typeof item === "function") {
      return item; // React.createElement('span', { color: 'red' }, 'Hello')
    } else {
      return { $$typeof: TEXT, type: TEXT, content: item }; //item = "Hello"
    }
  });
  return ReactElement($$typeof, type, key, ref, props);
}
function createRef() {
  return { current: null };
}
function createContext(defaultVal) {
  Provider.value = defaultVal;
  function Provider(props) {
    Provider.value = props.value;
    return props.children;
  }
  function Consumer(props) {
    return onlyOne(props.children)(Provider.value);
  }
  return {
    Provider,
    Consumer,
  };
}
export { Component };
const React = {
  createElement,
  Component,
  createRef,
  createContext,
};
export default React;
