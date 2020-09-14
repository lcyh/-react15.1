import { ELEMENT } from "./constants";

function mapChildren(children, mapFunction, context) {
  const result = [];
  mapIntoWithKeyPrefixInternal(children, result, mapFunction);
  //   let newResult = children.flat(Infinity).map(mapFunction).flat(Infinity);
  //   console.log("newResult", newResult);
  return result;
}

function mapIntoWithKeyPrefixInternal(children, result, mapFunction) {
  const traverseContext = {
    result, //[]
    mapFunction, // fn(){}
  };
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
}

function traverseAllChildren(
  children,
  mapSingleChildIntoContext,
  traverseContext
) {
  let type = typeof children;
  if (
    type === "string" ||
    type === "number" ||
    (type === "object" && children.$$typeof === ELEMENT)
  ) {
    mapSingleChildIntoContext(traverseContext, children);
  } else if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      traverseAllChildren(child, mapSingleChildIntoContext, traverseContext);
    }
  }
}

//如果执行到这个地方 child肯定是一个节点 child=<span>A</span> childKey =.0:0
// 文本或者单个标签元素的   'hello'  123  <span>hello</span>
function mapSingleChildIntoContext(traverseContext, child) {
  const { result, mapFunction } = traverseContext;
  let mappedChild = mapFunction.call(null, child);
  console.log("mappedChild---", mappedChild);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(mappedChild, result, (c) => c);
  } else {
    result.push(mappedChild);
  }
}

export { mapChildren as map };
