import { isFunction } from "./utils";
import { compareTwoElements } from "./vdom";
export let updateQueue = {
  updaters: [],
  isPending: false, // isPending=false 立即更新，为true时，批量更新模式
  add(updater) {
    this.updaters.push(updater);
  },
  // 需要调用它，才会触发批量更新
  batchUpdate() {
    const { updaters } = this;
    let updater;
    this.isPending = true; //进入批量更新模式
    while ((updater = updaters.pop())) {
      updater.updateComponent(); //更新脏组件
    }
    this.isPending = false; //改为非批量更新
  },
};
class Updater {
  constructor(componentInstance) {
    this.componentInstance = componentInstance;
    this.pendingUpdates = [];
    this.nextProps = null;
  }
  addState(partialState) {
    this.pendingUpdates.push(partialState);
    this.emitUpdate();
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    if (nextProps || !updateQueue.isPending) {
      //如果有新属性或立即更新
      this.updateComponent();
    } else {
      //批量更新模式,就把每个 更新器放到数组里，等待批量更新
      updateQueue.add(this);
    }
  }
  // 组件更新方法
  updateComponent() {
    let { componentInstance, pendingUpdates, nextProps } = this;
    if (nextProps || pendingUpdates.length > 0) {
      //pendingUpdates长度大于0，说明class类组件调用了setState,有等待执行合并的更新状态
      shouldUpdata(componentInstance, nextProps, this.getState());
    }
  }
  // 获取更新后的state
  getState() {
    let { componentInstance, pendingUpdates } = this;
    let { state } = componentInstance;
    if (pendingUpdates.length > 0) {
      pendingUpdates.forEach((nextState) => {
        if (isFunction(nextState)) {
          state = { ...state, ...nextState.call(componentInstance, state) };
        } else {
          state = { ...state, ...nextState };
        }
      });
    }
    pendingUpdates.length = 0; // 更新了state之后，清空state存放的队列
    return state;
  }
}
// 判断是否需要更新
function shouldUpdata(componentInstance, nextProps, nextState) {
  //判断是否要更新
  let scu =
    componentInstance.shouldComponentUpdate &&
    !componentInstance.shouldComponentUpdate(nextProps, nextState);
  componentInstance.props = nextProps;
  componentInstance.state = nextState;
  if (scu) {
    return false; // 不更新
  }
  componentInstance.forceUpdate(); //让组件强行更新
}
class Component {
  constructor(props) {
    this.props = props;
    this.$updater = new Updater(this); // 一个组件实例就是一个更新器updater
    this.state = {};
    this.nextProps = null;
  }
  setState(partialState) {
    this.$updater.addState(partialState);
  }
  forceUpdate() {
    console.log("forceUpdate");
    //进行组件实际更新，更新对比新老DOM元素,替换新的DOM元素
    const { props, state, renderElement: oldRenderElement } = this;
    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }
    let extraArg =
      this.getSnapShotBeroreUpdate && this.getSnapShotBeroreUpdate();
    let newRenderElement = this.render(); //重新渲染获取新的React元素
    let currentElement = compareTwoElements(oldRenderElement, newRenderElement);
    this.renderElement = currentElement;
    if (this.componentDidUpdate) {
      this.componentDidUpdate(props, state, extraArg);
    }
  }
}
//类组件和函数组件编译之后都是函数，通过 此属性来区分到底是函数组件还是类组件
Component.prototype.isReactComponent = {};
export { Component };
