import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit, Save } from "lucide-react";
import {
  Template,
  TaskTypeDefinition,
  StatusDefinition,
} from "../types/template";
import { saveTemplate, getStoredTemplates } from "../utils/templateStorage";

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

  const addTaskType = () => {
    setTaskTypes([
      ...taskTypes,
      { name: "", icon: "Zap", color: "text-gray-300" },
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

  const removeTaskType = (index: number) => {
    setTaskTypes(taskTypes.filter((_, i) => i !== index));
    if (editingTaskType === index) setEditingTaskType(null);
  };

  const addStatus = () => {
    setStatuses([
      ...statuses,
      { name: "", color: "bg-gray-800 text-gray-200" },
    ]);
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

  const removeStatus = (index: number) => {
    setStatuses(statuses.filter((_, i) => i !== index));
    if (editingStatus === index) setEditingStatus(null);
  };

  if (!isOpen) return null;

  return (
    <div className="z-[10000] fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-xl">
            {template ? "Edit Template" : "Create New Template"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="e.g., Agile Development"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Task Types */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Task Types
              </h3>
              <button
                onClick={addTaskType}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
              >
                <Plus size={16} />
                Add Task Type
              </button>
            </div>
            <div className="space-y-2">
              {taskTypes.map((taskType, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded"
                >
                  <input
                    type="text"
                    value={taskType.name}
                    onChange={(e) =>
                      updateTaskType(index, "name", e.target.value)
                    }
                    placeholder="Task type name"
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={taskType.icon}
                    onChange={(e) =>
                      updateTaskType(index, "icon", e.target.value)
                    }
                    placeholder="Icon name"
                    className="px-2 py-1 border rounded w-24"
                  />
                  <input
                    type="text"
                    value={taskType.color}
                    onChange={(e) =>
                      updateTaskType(index, "color", e.target.value)
                    }
                    placeholder="Color class"
                    className="px-2 py-1 border rounded w-32"
                  />
                  <button
                    onClick={() => removeTaskType(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Statuses
              </h3>
              <button
                onClick={addStatus}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
              >
                <Plus size={16} />
                Add Status
              </button>
            </div>
            <div className="space-y-2">
              {statuses.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded"
                >
                  <input
                    type="text"
                    value={status.name}
                    onChange={(e) =>
                      updateStatus(index, "name", e.target.value)
                    }
                    placeholder="Status name"
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={status.color}
                    onChange={(e) =>
                      updateStatus(index, "color", e.target.value)
                    }
                    placeholder="Color class"
                    className="px-2 py-1 border rounded w-48"
                  />
                  <button
                    onClick={() => removeStatus(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 rounded text-white"
            >
              <Save size={16} />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
