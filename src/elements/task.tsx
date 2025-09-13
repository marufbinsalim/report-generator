import React from "react";
import { ReactEditor, RenderElementProps, useSlate } from "slate-react";
import {
  CheckCircle,
  AlertCircle,
  Zap,
  Pencil,
  Bug,
  FileText,
  Search,
  Wrench,
  Rocket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TaskElementType } from "../assets/editorTypes";
import { Transforms } from "slate";
import { useTemplate } from "../contexts/TemplateContext";

// Icon mapping for Lucide icons
const iconMap = {
  Zap,
  Pencil,
  AlertCircle,
  CheckCircle,
  Bug,
  FileText,
  Search,
  Wrench,
  Rocket,
} as const;

function getIconComponent(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] || Zap;
}

export default function Task({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const [elementState, setElementState] = useState<TaskElementType>(element);
  const editor = useSlate();
  const path = ReactEditor.findPath(editor, element);
  const { activeTemplate } = useTemplate();

  // Sync local state with Slate editor
  useEffect(() => {
    Transforms.setNodes(editor, { ...elementState }, { at: path });
  }, [elementState]);

  const handleStatusChange = (newStatus: string) => {
    setElementState({ ...elementState, status: newStatus });
  };

  const handleTaskTypeChange = (newType: string) => {
    setElementState({ ...elementState, taskType: newType });
  };

  if (!activeTemplate) {
    return (
      <div
        {...attributes}
        className="flex flex-col gap-2 bg-gray-900 shadow-sm p-3 border border-gray-700 rounded-md w-full"
      >
        <div className="text-gray-300 text-sm">Loading template...</div>
        <div className="text-gray-300 text-sm">{children}</div>
      </div>
    );
  }

  const currentTaskType = activeTemplate.taskTypes.find(
    (t) => t.name === elementState.taskType
  );
  const currentStatus = activeTemplate.statuses.find(
    (s) => s.name === elementState.status
  );

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
            onChange={(e) => handleTaskTypeChange(e.target.value)}
            className="flex items-center gap-1 bg-gray-800 px-2 py-1 border border-gray-700 rounded font-medium text-gray-200 text-sm cursor-pointer"
          >
            {activeTemplate.taskTypes.map((taskType) => (
              <option key={taskType.name} value={taskType.name}>
                {taskType.name.replace("_", " ")}
              </option>
            ))}
          </select>
          {currentTaskType &&
            React.createElement(getIconComponent(currentTaskType.icon), {
              className: `w-4 h-4 ${currentTaskType.color}`,
            })}
        </div>

        {/* Status dropdown */}
        <select
          value={elementState.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`px-2 py-1 text-xs font-medium rounded ${
            currentStatus?.color || "bg-gray-800 text-gray-200"
          } cursor-pointer`}
        >
          {activeTemplate.statuses.map((status) => (
            <option key={status.name} value={status.name}>
              {status.name.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Task content */}
      <div className="text-gray-300 text-sm">{children}</div>
    </div>
  );
}
