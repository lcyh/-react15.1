export function addEvent(dom, eventType, listener) {
  eventType = eventType.toLowerCase();
  let eventStore = dom.eventStore || (dom.eventStore = {});
  eventStore[eventType] = listener;
  document.addEventListener(eventType.slice(2), dispatchEvent, false); // false=事件冒泡，true=事件捕获
}
let syntheticEvent;
//所有的合成事件真正的都在这里统一处理，可以解决不同浏览器之间对事件处理的兼容
function dispatchEvent(event) {
  console.log("dispatchEvent-event", event);
  const { type, target } = event;
  console.log("target", target);
  let eventType = "on" + type;
  syntheticEvent = getSyntheticEvent(event);
  while (target) {
    let eventStore = target.eventStore;
  }
}

//
function getSyntheticEvent(nativeEvent) {
  if (!syntheticEvent) {
    syntheticEvent = {};
  }
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
