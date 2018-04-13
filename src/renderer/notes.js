import React, { Component } from "react";
import { Editor } from "slate-react";
import Plain from "slate-plain-serializer";
import { isKeyHotkey } from "is-hotkey";

import EditCode from "slate-edit-code";
import AutoReplace from "slate-auto-replace";
import InsertImages from "slate-drop-or-paste-images";
import TrailingBlock from "slate-trailing-block";
import { Block, Value } from "slate";
import { CHILD_REQUIRED, CHILD_TYPE_INVALID } from "slate-schema-violations";

import styled from "styled-components";

import Image from "./nodes/image";

const isBoldHotkey = isKeyHotkey("mod+b");
const isItalicHotkey = isKeyHotkey("mod+i");
const isUnderlinedHotkey = isKeyHotkey("mod+u");
const isCodeHotkey = isKeyHotkey("mod+g");
const isEnterHotKey = isKeyHotkey("enter");
const isSpaceHotKey = isKeyHotkey("space");

const Root = styled.div`
  color: #333;
  padding: 5em;
  background: #fff;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;

const CodeBlock = styled.pre`
  display: block;
  padding: 1.5em;
  line-height: 1.4;
  background: #eee;
  font-family: "Lucida Console", Monaco, monospace;
`;

const CodeLine = styled.div``;

const editCodePlugin = EditCode();

const plugins = [
  TrailingBlock({ type: "paragraph" }),
  InsertImages({
    extensions: ["png"],
    insertImage: (transform, file) => {
      return transform.insertBlock({
        type: "image",
        isVoid: true,
        data: { file }
      });
    }
  }),
  editCodePlugin,
  AutoReplace({
    before: /^(```)$/,
    onlyIn: type => type === "line" || type === "paragraph",
    trigger: e => isEnterHotKey(e) || isSpaceHotKey(e),
    transform: (transform, e, matches) => {
      return editCodePlugin.changes.wrapCodeBlock(transform);
    }
  })
];

const schema = {
  document: {
    nodes: [
      { types: ["heading-one"], min: 1, max: 1 },
      { types: ["paragraph"], min: 1 }
    ],
    normalize: (change, violation, { node, child, index }) => {
      switch (violation) {
        case CHILD_TYPE_INVALID: {
          return change.setNodeByKey(
            child.key,
            index == 0 ? "heading-one" : "paragraph"
          );
        }
        case CHILD_REQUIRED: {
          const block = Block.create(index == 0 ? "heading-one" : "paragraph");
          return change.insertNodeByKey(node.key, index, block);
        }
      }
    }
  }
};

class Notes extends Component {
  state = {
    value: Plain.deserialize(
      "Title\ntext"
    )
  };

  onChange = ({ value }) => {
    this.setState({ value });
  };

  render() {
    return (
      <Root>
        <Editor
          placeholder="Enter some plain text..."
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          plugins={plugins}
          schema={schema}
          autoFocus
          spellCheck
        />
      </Root>
    );
  }

  renderNode = props => {
    const { attributes, children, node } = props;
    switch (node.type) {
      case "block-quote":
        return <blockquote {...attributes}>{children}</blockquote>;
      case "bulleted-list":
        return <ul {...attributes}>{children}</ul>;
      case "heading-one":
        return <h1 {...attributes}>{children}</h1>;
      case "heading-two":
        return <h2 {...attributes}>{children}</h2>;
      case "list-item":
        return <li {...attributes}>{children}</li>;
      case "numbered-list":
        return <ol {...attributes}>{children}</ol>;
      case "code_block":
        return <CodeBlock {...attributes}>{children}</CodeBlock>;
      case "code_line":
        return <CodeLine {...attributes}>{children}</CodeLine>;
      case "image":
        return (
          <Image {...attributes} node={node}>
            {children}
          </Image>
        );
      case "paragraph":
        return <div {...attributes}>{children}</div>;
    }
  };

  renderMark = props => {
    const { children, mark } = props;
    switch (mark.type) {
      case "bold":
        return <strong>{children}</strong>;
      case "code":
        return <code>{children}</code>;
      case "italic":
        return <em>{children}</em>;
      case "underlined":
        return <u>{children}</u>;
    }
  };

  onKeyDown = (event, change) => {
    let mark;

    if (isBoldHotkey(event)) {
      mark = "bold";
    } else if (isItalicHotkey(event)) {
      mark = "italic";
    } else if (isUnderlinedHotkey(event)) {
      mark = "underlined";
    } else if (isCodeHotkey(event)) {
      mark = "code";
    } else {
      return;
    }

    event.preventDefault();
    change.toggleMark(mark);
    return true;
  };
}

export default Notes;
