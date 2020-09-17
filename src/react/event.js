import { updateQueue } from "./component";
export function addEvent(dom, eventType, listener) {
  eventType = eventType.toLowerCase();
  let eventStore = dom.eventStore || (dom.eventStore = {});
  eventStore[eventType] = listener;
  document.addEventListener(eventType.slice(2), dispatchEvent, false); // false=事件冒泡，true=事件捕获
}
let syntheticEvent;
//所有的合成事件真正的都在这里统一处理，可以解决不同浏览器之间对事件处理的兼容
function dispatchEvent(event) {
  let { type, target } = event;
  let eventType = "on" + type;
  syntheticEvent = getSyntheticEvent(event);
  updateQueue.isPending = true; //合成事件里setState是批量更新模式
  while (target) {
    let { eventStore } = target;
    let listener = eventStore && eventStore[eventType];
    if (listener) {
      listener.call(target, syntheticEvent); //此时合成事件里setState(partialState)的partialState都被存在updateQueue里
    }
    // 点击的元素上找是否 绑定了 onClick或者其他事件,如果有listener对调函数,说明绑定了事件，否则往父节点一层层向上查找一直找到所有同类型的事件，如果子节点和父节点都有同类型的事件，此时都会触发，
    // 因为事件冒泡的原因
    target = target.parentNode;
  }
  // 垃圾回收，清空事件对象
  for (let key in syntheticEvent) {
    if (syntheticEvent.hasOwnProperty(key)) {
      delete syntheticEvent[key];
    }
  }
  updateQueue.isPending = false; //上面合成事件里setState(partialState)partialState都存在updateQueue里后,最后批量更新
  //执行批量更新，就是把缓存的那个updater全部执行了
  updateQueue.batchUpdate(); //批量更新，将updadeQueue队列一次执行，其实是一次执行 React.Component的forceUpdate()方法；
}

// persist函数会创建新对象 赋值给syntheticEvent对象
function persist() {
  syntheticEvent = {};
  // 给syntheticEvent的原型对象上 添加persist属性
  Object.setPrototypeOf(syntheticEvent, {
    persist,
  });
}
//
function getSyntheticEvent(nativeEvent) {
  if (!syntheticEvent) {
    syntheticEvent = { persist };
  }
  syntheticEvent.nativeEvent = nativeEvent;
  syntheticEvent.currentTarget = nativeEvent.target;
  // 这里是对原生事件对象的属性和方法拷贝给syntheticEvent
  for (let key in nativeEvent) {
    if (typeof nativeEvent[key] === "function") {
      syntheticEvent[key] = nativeEvent[key].bind(nativeEvent);
    } else {
      syntheticEvent[key] = nativeEvent[key];
    }
  }
  //   最终返回一个新的事件对象
  return syntheticEvent;
}
