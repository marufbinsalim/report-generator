import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import {
  Template,
  TaskTypeDefinition,
  StatusDefinition,
} from "../types/template";
import { saveTemplate } from "../utils/templateStorage";
import {
  Zap,
  Pencil,
  Bug,
  FileText,
  Search,
  Wrench,
  Rocket,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

// Common Lucide icons for task types
const AVAILABLE_ICONS = [
  "Zap",
  "Pencil",
  "Bug",
  "FileText",
  "Search",
  "Wrench",
  "Rocket",
  "AlertCircle",
  "CheckCircle",
  "Clock",
] as const;

type AvailableIcon = (typeof AVAILABLE_ICONS)[number];

const ICON_MAP = {
  Zap,
  Pencil,
  Bug,
  FileText,
  Search,
  Wrench,
  Rocket,
  AlertCircle,
  CheckCircle,
  Clock,
} as const;

const COMMON_TEXT_COLORS = [
  "text-blue-400",
  "text-green-400",
  "text-red-400",
  "text-yellow-400",
  "text-purple-400",
  "text-pink-400",
  "text-indigo-400",
  "text-emerald-400",
  "text-orange-400",
  "text-gray-400",
] as const;

const COMMON_BG_COLORS = [
  "bg-blue-600 text-white",
  "bg-green-600 text-white",
  "bg-red-600 text-white",
  "bg-yellow-600 text-black",
  "bg-purple-600 text-white",
  "bg-pink-600 text-white",
  "bg-indigo-600 text-white",
  "bg-emerald-600 text-white",
  "bg-orange-600 text-white",
  "bg-gray-600 text-white",
] as const;

const COLOR_NAMES = {
  blue: "Blue",
  green: "Green",
  red: "Red",
  yellow: "Yellow",
  purple: "Purple",
  pink: "Pink",
  indigo: "Indigo",
  emerald: "Emerald",
  orange: "Orange",
  gray: "Gray",
} as const;

interface TemplateBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  template?: Template | null;
}

export default function TemplateBuilder({
  isOpen,
  onClose,
  onSave,
  template,
}: TemplateBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taskTypes, setTaskTypes] = useState<TaskTypeDefinition[]>([]);
  const [statuses, setStatuses] = useState<StatusDefinition[]>([]);
  const [editingTaskType, setEditingTaskType] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setTaskTypes([...template.taskTypes]);
      setStatuses([...template.statuses]);
    } else {
      setName("");
      setDescription("");
      setTaskTypes([]);
      setStatuses([]);
    }
  }, [template]);

  const handleSave = () => {
    if (!name.trim()) return;

    const newTemplate: Template = {
      id: template?.id || `template-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      taskTypes,
      statuses,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    saveTemplate(newTemplate);
    onSave();
    onClose();
  };

  // TaskType handlers
  const addTaskType = () => {
    setTaskTypes([
      ...taskTypes,
      { name: "", icon: "Zap" as AvailableIcon, color: "text-blue-400" },
    ]);
    setEditingTaskType(taskTypes.length);
  };

  const updateTaskType = (
    index: number,
    field: keyof TaskTypeDefinition,
    value: string
  ) => {
    const updated = [...taskTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTaskTypes(updated);
  };

  const updateTaskTypeIcon = (index: number, value: AvailableIcon) => {
    const updated = [...taskTypes];
    updated[index] = { ...updated[index], icon: value };
    setTaskTypes(updated);
  };

  const updateTaskTypeColor = (
    index: number,
    value: (typeof COMMON_TEXT_COLORS)[number]
  ) => {
    const updated = [...taskTypes];
    updated[index] = { ...updated[index], color: value };
    setTaskTypes(updated);
  };

  const removeTaskType = (index: number) => {
    setTaskTypes(taskTypes.filter((_, i) => i !== index));
    if (editingTaskType === index) setEditingTaskType(null);
  };

  // Status handlers
  const addStatus = () => {
    setStatuses([...statuses, { name: "", color: "bg-gray-600 text-white" }]);
    setEditingStatus(statuses.length);
  };

  const updateStatus = (
    index: number,
    field: keyof StatusDefinition,
    value: string
  ) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], [field]: value };
    setStatuses(updated);
  };

  const updateStatusColor = (
    index: number,
    value: (typeof COMMON_BG_COLORS)[number]
  ) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], color: value };
    setStatuses(updated);
  };

  const removeStatus = (index: number) => {
    setStatuses(statuses.filter((_, i) => i !== index));
    if (editingStatus === index) setEditingStatus(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="z-[10000] fixed inset-0 flex justify-center items-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-builder-title"
    >
      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-4xl max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-gray-200 dark:border-gray-600 border-b">
          <h2
            id="template-builder-title"
            className="font-bold text-gray-900 dark:text-gray-100 text-xl"
          >
            {template ? "Edit Template" : "Create New Template"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400"
            aria-label="Close template builder"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 p-6 overflow-y-auto">
          {/* Template Info */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label
                htmlFor="template-name"
                className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm"
              >
                Template Name *
              </label>
              <input
                id="template-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white dark:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., Agile Development"
                aria-required="true"
              />
            </div>
            <div>
              <label
                htmlFor="template-description"
                className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm"
              >
                Description
              </label>
              <input
                id="template-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white dark:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Task Types */}
          <div>
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-gray-800 mb-2 py-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Task Types
              </h3>
              <button
                onClick={addTaskType}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <Plus size={16} /> Add Task Type
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {taskTypes.map((taskType, index) => {
                const IconComponent =
                  ICON_MAP[taskType.icon as keyof typeof ICON_MAP] || Zap;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded"
                  >
                    <input
                      type="text"
                      value={taskType.name}
                      onChange={(e) =>
                        updateTaskType(index, "name", e.target.value)
                      }
                      placeholder="Task type name"
                      className="flex-1 bg-white dark:bg-gray-600 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={taskType.icon}
                        onChange={(e) =>
                          updateTaskTypeIcon(
                            index,
                            e.target.value as AvailableIcon
                          )
                        }
                        className="bg-white dark:bg-gray-600 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 text-gray-900 dark:text-gray-100"
                      >
                        {AVAILABLE_ICONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={taskType.color}
                        onChange={(e) =>
                          updateTaskTypeColor(
                            index,
                            e.target
                              .value as (typeof COMMON_TEXT_COLORS)[number]
                          )
                        }
                        className="bg-white dark:bg-gray-600 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 text-gray-900 dark:text-gray-100"
                      >
                        {COMMON_TEXT_COLORS.map((color) => {
                          const colorNameKey = color.split(
                            "-"
                          )[1] as keyof typeof COLOR_NAMES;
                          return (
                            <option key={color} value={color}>
                              {COLOR_NAMES[colorNameKey]}
                            </option>
                          );
                        })}
                      </select>
                      <IconComponent
                        size={20}
                        className={`${taskType.color}  rounded`}
                      />
                    </div>
                    <button
                      onClick={() => removeTaskType(index)}
                      className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-red-500 hover:text-red-700 dark:hover:text-red-300 dark:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-gray-800 mb-2 py-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Statuses
              </h3>
              <button
                onClick={addStatus}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <Plus size={16} /> Add Status
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statuses.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded"
                >
                  <input
                    type="text"
                    value={status.name}
                    onChange={(e) =>
                      updateStatus(index, "name", e.target.value)
                    }
                    placeholder="Status name"
                    className="flex-1 bg-white dark:bg-gray-600 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={status.color}
                      onChange={(e) =>
                        updateStatusColor(
                          index,
                          e.target.value as (typeof COMMON_BG_COLORS)[number]
                        )
                      }
                      className="bg-white dark:bg-gray-600 px-2 py-1 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-gray-900 dark:text-gray-100"
                    >
                      {COMMON_BG_COLORS.map((color) => {
                        const mainColorClass = color.split(" ")[0];
                        const colorNameKey = mainColorClass.split(
                          "-"
                        )[1] as keyof typeof COLOR_NAMES;
                        return (
                          <option key={color} value={color}>
                            {COLOR_NAMES[colorNameKey]}
                          </option>
                        );
                      })}
                    </select>
                    <span
                      className={`w-4 h-4 rounded-full block border border-gray-300 ${status.color}`}
                    />
                  </div>
                  <button
                    onClick={() => removeStatus(index)}
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-red-500 hover:text-red-700 dark:hover:text-red-300 dark:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-gray-200 dark:border-gray-600 border-t">
          <button
            onClick={onClose}
            className="bg-white dark:bg-gray-700 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-500 dark:hover:bg-green-600 dark:disabled:bg-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white disabled:text-gray-500"
          >
            <Save size={16} /> Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
