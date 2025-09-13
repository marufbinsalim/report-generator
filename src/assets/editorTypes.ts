import { BaseEditor, Operation } from "slate";
import { ReactEditor } from "slate-react";

export type EditorType = BaseEditor &
  ReactEditor & {
    history: {
      undos: Operation[];
      redos: Operation[];
    };
    redo: () => void;
    undo: () => void;
  };

export type CustomTextType = {
  text: string;
  type: "text";
  bold?: boolean;
};

type TaskType = string;

type StatusType = string;

export type TaskElementType = {
  type: "task";
  taskType: TaskType;
  status: StatusType;
  children: CustomTextType[];
};

export type CustomElementType = TaskElementType;

declare module "slate" {
  interface CustomTypes {
    Element: CustomElementType;
    Text: CustomTextType;
    Editor: EditorType;
  }
}
