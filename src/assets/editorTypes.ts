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

type TaskType =
  | "FEATURE"
  | "DESIGN"
  | "BUG_FIX"
  | "REFACTOR"
  | "TEST"
  | "DOCUMENTATION"
  | "RESEARCH"
  | "MAINTENANCE"
  | "DEPLOYMENT";

type StatusType = "TODO" | "IN_PROGRESS" | "UNDER_REVIEW" | "DONE";

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
