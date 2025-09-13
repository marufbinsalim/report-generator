import { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Edit } from "lucide-react";
import { Template } from "../types/template";
import {
  getStoredTemplates,
  setActiveTemplate,
  deleteTemplate,
  getActiveTemplate,
} from "../utils/templateStorage";

interface TemplateSelectorProps {
  onTemplateChange: (template: Template) => void;
  onOpenBuilder: (template?: Template) => void;
}

export default function TemplateSelector({
  onTemplateChange,
  onOpenBuilder,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplate, setActiveTemplateState] = useState<Template | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const storage = getStoredTemplates();
    setTemplates(storage.templates);
    const active = getActiveTemplate();
    setActiveTemplateState(active);
    if (active) {
      onTemplateChange(active);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setActiveTemplate(template.id);
    setActiveTemplateState(template);
    onTemplateChange(template);
    setIsOpen(false);
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      alert("Cannot delete the last template");
      return;
    }
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(templateId);
      loadTemplates();
    }
  };

  const handleEditTemplate = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenBuilder(template);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-white text-sm"
      >
        <Settings size={16} />
        {activeTemplate?.name || "Select Template"}
      </button>

      {isOpen && (
        <div className="top-full right-0 z-50 absolute bg-gray-100 dark:bg-gray-900 shadow-lg mt-2 border border-gray-300 rounded-lg min-w-64">
          <div className="p-3 border-gray-300 border-b">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Templates
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                  activeTemplate?.id === template.id
                    ? "bg-blue-50 dark:bg-blue-900"
                    : ""
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {template.name}
                  </div>
                  {template.description && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {template.description}
                    </div>
                  )}
                  <div className="mt-1 text-gray-500 text-xs">
                    {template.taskTypes.length} task types,{" "}
                    {template.statuses.length} statuses
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleEditTemplate(template, e)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                    title="Edit template"
                  >
                    <Edit size={14} />
                  </button>
                  {templates.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteTemplate(template.id, e)}
                      className="p-1 text-gray-500 hover:text-red-500"
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-gray-300 border-t">
            <button
              onClick={() => {
                onOpenBuilder();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded w-full text-white text-sm"
            >
              <Plus size={16} />
              Create New Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
