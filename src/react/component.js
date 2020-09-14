class Component {
  constructor(props) {
    this.props = props;
  }
}
//类组件和函数组件编译之后都是函数，通过 此属性来区分到底是函数组件还是类组件
Component.prototype.isReactComponent = {};
export { Component };
