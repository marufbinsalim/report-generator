import { useState, useEffect } from "react";
import {
  X,
  Plus,
  FileText,
  Save,
  Trash2,
  Zap,
  Pencil,
  Bug,
  Search,
  Wrench,
  Rocket,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Editor } from "slate";
import {
  Template,
  TaskTypeDefinition,
  StatusDefinition,
} from "../types/template";
import { CustomElementType } from "../assets/editorTypes";
import {
  getStoredTemplates,
  saveTemplate,
  setActiveTemplate,
  saveCurrentReport,
  loadReportToEditor,
} from "../utils/templateStorage";
import { getInitialValue } from "../data/CONSTANTS/editor_initial_value";
import { useTemplate } from "../contexts/TemplateContext";
import { useReport } from "../contexts/ReportContext";
import { toast } from "react-hot-toast";

// Constants from TemplateBuilder
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
  Zap: Zap,
  Pencil: Pencil,
  Bug: Bug,
  FileText: FileText,
  Search: Search,
  Wrench: Wrench,
  Rocket: Rocket,
  AlertCircle: AlertCircle,
  CheckCircle: CheckCircle,
  Clock: Clock,
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

interface UnifiedCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
  template?: Template | null;
}

export default function UnifiedCreateModal({
  isOpen,
  onClose,
  editor,
  template,
}: UnifiedCreateModalProps) {
  const [activeTab, setActiveTab] = useState<"report" | "template">("report");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  // New Template states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taskTypes, setTaskTypes] = useState<TaskTypeDefinition[]>([]);
  const [statuses, setStatuses] = useState<StatusDefinition[]>([]);

  const { setActiveReport, refreshReports } = useReport();
  const { refreshTemplate } = useTemplate();

  useEffect(() => {
    if (isOpen) {
      const storage = getStoredTemplates();
      setTemplates(storage.templates);
      if (template) {
        setActiveTab("template");
        setName(template.name);
        setDescription(template.description || "");
        setTaskTypes([...template.taskTypes]);
        setStatuses([...template.statuses]);
      } else {
        // Reset template form
        setName("");
        setDescription("");
        setTaskTypes([]);
        setStatuses([]);
      }
    }
  }, [isOpen, template]);

  const handleCreateReport = (template: Template) => {
    setLoading(true);
    const title = `Report - ${
      template.name
    } - ${new Date().toLocaleDateString()}`;
    const initialContent = getInitialValue(template) as CustomElementType[];
    editor.children = initialContent;
    const reportId = saveCurrentReport(editor, template.id, title);
    setActiveTemplate(template.id);
    refreshTemplate();
    loadReportToEditor(editor, reportId);
    setActiveReport(reportId);
    refreshReports();
    toast.success("New report created");
    onClose();
    setLoading(false);
  };

  // Template form handlers
  const addTaskType = () => {
    setTaskTypes([
      ...taskTypes,
      { name: "", icon: "Zap" as AvailableIcon, color: "text-blue-400" },
    ]);
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
  };

  const addStatus = () => {
    setStatuses([...statuses, { name: "", color: "bg-gray-600 text-white" }]);
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
  };

  const handleSaveTemplate = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    const newTemplate: Template = {
      id: template ? template.id : `template-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      taskTypes,
      statuses,
      createdAt: template ? template.createdAt : new Date(),
      updatedAt: new Date(),
    };

    saveTemplate(newTemplate);
    setActiveTemplate(newTemplate.id);
    refreshTemplate();
    toast.success(template ? "Template updated" : "New template created");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="z-[10000] fixed inset-0 flex justify-center items-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-4xl max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {activeTab === "report"
              ? "Create New Report"
              : template
              ? "Edit Template"
              : "Create New Template"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-gray-200 dark:border-gray-700 border-b">
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === "report"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FileText size={16} />
            New Report
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === "template"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Plus size={16} />
            New Template
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "report" && (
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {templates.length === 0 ? (
                <p className="py-8 text-gray-500 dark:text-gray-400 text-center">
                  No templates available. Create one first.
                </p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 p-3 border border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                      onClick={() => !loading && handleCreateReport(template)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                            {template.description}
                          </div>
                        )}
                        <div className="mt-1 text-gray-500 text-xs">
                          {template.taskTypes.length} task types,{" "}
                          {template.statuses.length} statuses
                        </div>
                      </div>
                      <button
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-2 rounded text-white"
                      >
                        <FileText size={16} />
                        Create
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "template" && (
            <div className="space-y-6 p-6 max-h-[60vh] overflow-y-auto">
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
                    className="bg-white dark:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                    className="bg-white dark:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {/* Task Types */}
              <div>
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 mb-2 py-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    Task Types
                  </h3>
                  <button
                    onClick={addTaskType}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                  >
                    <Plus size={16} /> Add Task Type
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {taskTypes.map((taskType, index) => {
                    const IconComponent =
                      ICON_MAP[taskType.icon as keyof typeof ICON_MAP];
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
                          className={`${taskType.color} rounded`}
                        />
                        <button
                          onClick={() => removeTaskType(index)}
                          className="p-1 rounded text-red-500 hover:text-red-700"
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
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 mb-2 py-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    Statuses
                  </h3>
                  <button
                    onClick={addStatus}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                  >
                    <Plus size={16} /> Add Status
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
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
                      <button
                        onClick={() => removeStatus(index)}
                        className="p-1 rounded text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button for Template */}
              <div className="pt-4 border-gray-200 dark:border-gray-700 border-t">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!name.trim()}
                  className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-white disabled:text-gray-500"
                >
                  <Save size={16} />
                  Create Template
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
