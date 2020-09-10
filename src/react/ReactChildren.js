import { REACT_ELEMENT_TYPE } from "../shared/ReactSymbols";

function mapChildren(children, mapFunction, context) {
  const result = [];
  mapIntoWithKeyPrefixInternal(children, result, mapFunction);
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
    (type === "object" && type.$$typeof === REACT_ELEMENT_TYPE)
  ) {
    mapSingleChildIntoContext(traverseContext, children);
  } else if (Array.isArray(children)) {
  }
}
// 文本或者单个标签元素的   'hello'  123  <span>hello</span>
mapSingleChildIntoContext;
