import React from "react";
import { RenderElementProps } from "slate-react";
import Task from "../../elements/task";

export default function renderEditorElement(props: RenderElementProps) {
  const { element } = props;

  switch (element.type) {
    case "task":
      return <Task {...props} />;
    default:
      return <React.Fragment />;
  }
}
