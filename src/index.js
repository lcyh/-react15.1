import React, { Component } from "./react";
import ReactDOM from "./react-dom";

class ClassCounter extends Component {
  constructor(props) {
    super(props); //this.props = props;
    this.state = {
      number: 0,
    };
  }
  handleClick = (event) => {
    this.setState({ number: this.state.number + 1 });
    // console.log("点击了", event);
    // console.log(event.persist);
    // react合成事件里自己添加的方法，解决在异步事件(setTimeout,setInterval)中事件对象持久化，不丢失
    // event.persist();
    // setInterval(() => {
    //   console.log("定时器-event", event);
    // }, 1000);
  };
  render() {
    //render 只会返回一个顶级元素
    let returnELement = React.createElement(
      "div",
      { id: "counter" + this.state.number },
      React.createElement(
        "button",
        { id: "button", style: { color: "red" }, onClick: this.handleClick },
        "这是button按钮"
      )
    );
    console.log("returnELement", returnELement);
    return returnELement;
  }
}
// function FunctionCounter(props) {
//   return React.createElement(
//     "div",
//     { id: props.id + "FunctionCounter" },
//     "hello"
//   );
// }
let element1 = React.createElement(ClassCounter);
// console.log("element1", element1);
///React元素=虚拟DOM = {$$typeof:ELEMENT,type:'div'}
ReactDOM.render(element1, document.getElementById("root"));
/**
 * 1.如何渲染类组件和函数组件
 * 2.如果实现异步的setState
 */
