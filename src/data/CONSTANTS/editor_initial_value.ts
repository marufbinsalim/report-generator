import { CustomElementType } from "../../assets/editorTypes";
import { Template } from "../../types/template";
import { Descendant } from "slate";

const DEFAULT_INITIAL_VALUE = [
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

export function getInitialValue(
  template: Template | null,
  content?: string
): Descendant[] {
  if (content) {
    return JSON.parse(content) as Descendant[];
  }

  if (
    !template ||
    template.taskTypes.length === 0 ||
    template.statuses.length === 0
  ) {
    return DEFAULT_INITIAL_VALUE as Descendant[];
  }

  const firstTaskType = template.taskTypes[0].name;
  const firstStatus = template.statuses[0].name;

  return [
    {
      type: "task",
      taskType: firstTaskType,
      status: firstStatus,
      children: [
        {
          text: "New task",
          type: "text",
        },
      ],
    },
  ] as Descendant[];
}

// Note: The taskType and status values should match those defined in the active template
// If they don't match, the UI will show the first available option from the template

export { DEFAULT_INITIAL_VALUE as INITIAL_VALUE };
