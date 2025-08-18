import { ReactEditor, RenderElementProps, useSlate } from "slate-react";
import { CheckCircle, AlertCircle, Zap, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskElementType } from "../assets/editorTypes";
import { Transforms } from "slate";

// Icons
const taskTypeIcon = {
  FEATURE: <Zap className="w-4 h-4 text-gray-300" />,
  DESIGN: <Pencil className="w-4 h-4 text-gray-300" />,
  BUG_FIX: <AlertCircle className="w-4 h-4 text-red-500" />,
  REFACTOR: <Zap className="w-4 h-4 text-purple-500" />,
  TEST: <CheckCircle className="w-4 h-4 text-green-500" />,
  DOCUMENTATION: <Pencil className="w-4 h-4 text-gray-300" />,
  RESEARCH: <Zap className="w-4 h-4 text-blue-500" />,
  MAINTENANCE: <Zap className="w-4 h-4 text-yellow-500" />,
  DEPLOYMENT: <Zap className="w-4 h-4 text-pink-500" />,
} as const;

// Status badges (dark/default)
const statusColor = {
  TODO: "bg-gray-800 text-gray-200",
  IN_PROGRESS: "bg-blue-900 text-blue-200",
  UNDER_REVIEW: "bg-yellow-900 text-yellow-200",
  DONE: "bg-green-900 text-green-200",
};

const taskTypeOptions = Object.keys(
  taskTypeIcon
) as (keyof typeof taskTypeIcon)[];
const statusOptions = Object.keys(statusColor) as (keyof typeof statusColor)[];

export default function Task({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const [elementState, setElementState] = useState<TaskElementType>(element);
  const editor = useSlate();
  const path = ReactEditor.findPath(editor, element);

  // Sync local state with Slate editor
  useEffect(() => {
    Transforms.setNodes(editor, { ...elementState }, { at: path });
  }, [elementState]);

  const handleStatusChange = (newStatus: keyof typeof statusColor) => {
    setElementState({ ...elementState, status: newStatus });
  };

  const handleTaskTypeChange = (newType: keyof typeof taskTypeIcon) => {
    setElementState({ ...elementState, taskType: newType });
  };

  return (
    <div
      {...attributes}
      className="flex flex-col gap-2 bg-gray-900 shadow-sm p-3 border border-gray-700 rounded-md w-full"
    >
      {/* Header: TaskType + Status */}
      <div
        className="flex justify-between items-center select-none"
        contentEditable={false}
      >
        <div className="flex items-center gap-2">
          {/* Task type dropdown */}
          <select
            value={elementState.taskType}
            onChange={(e) =>
              handleTaskTypeChange(e.target.value as keyof typeof taskTypeIcon)
            }
            className="flex items-center gap-1 bg-gray-800 px-2 py-1 border border-gray-700 rounded font-medium text-gray-200 text-sm cursor-pointer"
          >
            {taskTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
          {taskTypeIcon[elementState.taskType]}
        </div>

        {/* Status dropdown */}
        <select
          value={elementState.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as keyof typeof statusColor)
          }
          className={`px-2 py-1 text-xs font-medium rounded ${
            statusColor[elementState.status]
          } cursor-pointer`}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Task content */}
      <div className="text-gray-300 text-sm">{children}</div>
    </div>
  );
}
