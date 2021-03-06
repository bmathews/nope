import React, { Component } from "react";

class Image extends Component {
  state = {};

  componentDidMount() {
    const { node } = this.props;
    const { data } = node;
    const file = data.get("file");
    this.load(file);
  }

  load(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      this.setState({ src: reader.result })
    );
    reader.readAsDataURL(file);
  }

  render() {
    const { attributes } = this.props;
    const { src } = this.state;
    return src ? <img {...attributes} src={src} /> : <span>Loading...</span>;
  }
}

export default Image;
