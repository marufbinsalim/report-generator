import { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Edit, Eye, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Template } from "../types/template";
import {
  getStoredTemplates,
  setActiveTemplate,
  deleteTemplate,
  getActiveTemplate,
} from "../utils/templateStorage";
import { toast } from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

interface TemplateSelectorProps {
  onOpenBuilder: (template?: Template) => void;
  onTogglePreview?: () => void;
  showButton?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TemplateSelector({
  onOpenBuilder,
  onTogglePreview,
  showButton = true,
  isOpen,
  onClose,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"templates" | "preview">(
    "templates"
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);

  const isControlled = isOpen !== undefined;
  const effectiveIsOpen = isOpen !== undefined ? isOpen : internalIsModalOpen;
  const effectiveOpen = () => {
    if (!isControlled) {
      setInternalIsModalOpen(true);
    }
  };
  const effectiveClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setInternalIsModalOpen(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const storage = getStoredTemplates();
    setTemplates(storage.templates);
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      toast.error("Cannot delete the last template");
      return;
    }
    setDeletingTemplate(templateId);
    setIsConfirmOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (deletingTemplate) {
      deleteTemplate(deletingTemplate);
      loadTemplates();
      toast.success("Template deleted");
    }
    setIsConfirmOpen(false);
    setDeletingTemplate(null);
  };

  const handleEditTemplate = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenBuilder(template);
    effectiveClose();
  };

  return (
    <div className="relative">
      {showButton !== false && (
        <button
          onClick={effectiveOpen}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-white text-sm"
        >
          <Settings size={16} />
          Manage Templates
        </button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {effectiveIsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-[10000] fixed inset-0 flex justify-center items-center bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) effectiveClose();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-2xl max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Template Management
                </h2>
                <button
                  onClick={effectiveClose}
                  className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-gray-200 dark:border-gray-700 border-b">
                <button
                  onClick={() => setActiveTab("templates")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "templates"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Templates
                </button>
                {showButton !== false && (
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "preview"
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    Preview
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === "templates" && (
                  <div className="space-y-2">
                    <div className="max-h-64 overflow-y-auto">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                          onClick={() => {}}
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
                                onClick={(e) =>
                                  handleDeleteTemplate(template.id, e)
                                }
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
                    <button
                      onClick={() => {
                        onOpenBuilder();
                        effectiveClose();
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded w-full text-white text-sm"
                    >
                      <Plus size={16} />
                      Create New Template
                    </button>
                  </div>
                )}

                {activeTab === "preview" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                        Markdown Preview
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Toggle the preview to view your current document as
                        Markdown.
                      </p>
                    </div>
                    {onTogglePreview && (
                      <motion.button
                        onClick={() => {
                          onTogglePreview();
                          effectiveClose();
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg w-full font-medium text-white"
                      >
                        <Eye size={20} />
                        Toggle Markdown Preview
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
