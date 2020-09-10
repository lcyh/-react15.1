const { PureComponent } = require("react");

let emptyObject = {};
class Component {
  constructor(props, context) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
  }
}
// 在React内部就是凭这个变量是不是React组件
// 组件定义方式：Class类组件和Function函数式组件，都被babel编译成函数了
Component.prototype.isReactComponent = {};

// class PureComponent extends Component {}

// PureComponent.prototype.isPureReactComponent = true;

export { Component };
