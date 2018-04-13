import ReactDOM from "react-dom";
import React from "react";

import Notes from "./notes";

const styles = document.createElement("style");
styles.innerText = `
  body, html {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  #app {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  *, *:after, *:before {
    box-sizing: inherit;
  }
`;
document.head.appendChild(styles);

ReactDOM.render(<Notes />, document.getElementById("app"));
