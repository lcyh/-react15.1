import React, { Component } from "react";
import ReactDOM from "react-dom";

/* class App extends Component {
  render() {
    return (
      <div>
        <p>1</p>
        <button>+</button>
      </div>
    )
  }
}
// let element = <App />; */
// class App extends Component {
//   static defaultProps = {
//     name: "app",
//   };
//   render() {
//     let returnElement = React.createElement(
//       "div",
//       { title: this.props.name + "_" + this.props.title },
//       React.createElement("p", { key: "p_key" }, "1"),
//       React.createElement("button", { key: "button_key" }, "+")
//     );
//     console.log("returnElement", returnElement);
//     return returnElement;
//   }
// }
// debugger;
// let element = React.createElement(App, { title: "zhufeng" });
/* let instance = new App();
  let renderedElement = instance.render();
   */
// @babel/preset-react
// 1.讲reactjsx语法转换成 React.createElement()
// 2.每个标签或者文本都讲转换成  React.createElement(),返回的是 vnode对象 {$$typeof,ref,key,props,_self,_source,}
// React.children.map()
class Child extends Component {
  render() {
    console.log("this.props.children", this.props.children);
    const mappedChildren = React.Children.map(this.props.children, function (
      item,
      index
    ) {
      return [item];
    });
    console.log("mappedChildren", mappedChildren);
    return <ul>{mappedChildren}</ul>;
  }
}
class App extends Component {
  render() {
    return (
      <Child>
        {[<p>A</p>, <p key="keyB">B</p>]}
        {[<p>C</p>, <p key="keyD">D</p>]}
      </Child>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
