import { Descendant } from "slate";
import { CustomElementType } from "../../assets/editorTypes";

const INITIAL_VALUE = [
  {
    type: "task",
    taskType: "FEATURE",
    status: "IN_PROGRESS",
    children: [
      {
        text: "This is a line of text",
        type: "text",
      },
    ],
  },
] as CustomElementType[];

export { INITIAL_VALUE };
