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
    // pendingUpdates将合成事件和声明周期里 调用setState({}),setState(()=>{});参数形式有 Object和函数
    // 将setState()函数的 参数都存在一个数组 栈 里；
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
    // 1.第一个updater.updateComponent()后，批量更新完(一次性更新)，pendingUpdates.length=0；
    // 2.所以后面所有的 updater.updateComponent()方法调用，不会去走更新state的逻辑了
    // 3.更新了state之后，已经清空state存放的队列了
    // 4.批量更新模式只会调用一次 forceUpdate方法
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
      // 批量更新就是一次性将state更新了，后面pendingUpdates.length=0表明已经批量更新完了
      // 这里是将存储所有调用 this.setState(partialState) 参数合并老的state和新的state参数
      pendingUpdates.forEach((nextState) => {
        if (isFunction(nextState)) {
          state = { ...state, ...nextState.call(componentInstance, state) };
        } else {
          state = { ...state, ...nextState };
        }
      });
    }
    pendingUpdates.length = 0; // 更新了state之后，清空state存放的队列，所以此时批量更新state完了
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
  //  1.拿到合并后的新的 state值,覆盖以前老的 state值，此时 this.state所有的值都是最新的了；
  componentInstance.state = nextState;
  if (scu) {
    return false; // 不更新
  }
  // 2.将最新的 state值，渲染到 页面DOM元素里，真正页面刷新渲染；
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
    let newRenderElement = this.render(); //重新渲染获取新的React元素
    let extraArg =
      this.getSnapShotBeroreUpdate && this.getSnapShotBeroreUpdate();
    // 比较新老虚拟vdom节点，得到新的虚拟DOM
    let currentElement = compareTwoElements(oldRenderElement, newRenderElement);
    // 将新的虚拟DOM替换旧的虚拟DOM
    this.renderElement = currentElement;
    if (this.componentDidUpdate) {
      this.componentDidUpdate(props, state, extraArg);
    }
  }
}
//类组件和函数组件编译之后都是函数，通过 此属性来区分到底是函数组件还是类组件
Component.prototype.isReactComponent = {};
export { Component };
