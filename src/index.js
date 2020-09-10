import React, { Component } from "react";
import ReactDOM from "react-dom";

class App extends Component {
  render() {
    let element = (
      <div>
        hello
        <p>这是p标签</p>
        <span>这是p标签</span>
      </div>
    );
    console.log("element", element);
    return element;
  }
}
// let AppElement=<App />;
// console.log('AppElement',AppElement);
ReactDOM.render(<App />, document.getElementById("root"));
