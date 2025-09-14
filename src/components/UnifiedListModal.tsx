import { useState, useEffect } from "react";
import { X, Edit, Trash2, Plus, FileText, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Editor, Transforms } from "slate";
import { Template } from "../types/template";
import { Report } from "../types/report";
import { INITIAL_VALUE } from "../data/CONSTANTS/editor_initial_value";
import {
  getStoredTemplates,
  getStoredReports,
  deleteTemplate,
  deleteReport,
  loadReportToEditor,
  setActiveTemplate,
} from "../utils/templateStorage";
import { toast } from "react-hot-toast";
import { useReport } from "../contexts/ReportContext";
import { useTemplate } from "../contexts/TemplateContext";
import ConfirmModal from "./ConfirmModal";

interface UnifiedListModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
  onOpenBuilder: (template?: Template) => void;
  onOpenCreate?: () => void;
}

export default function UnifiedListModal({
  isOpen,
  onClose,
  editor,
  onOpenBuilder,
}: UnifiedListModalProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "reports">(
    "templates"
  );
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    type: "template" | "report";
  } | null>(null);

  const { setActiveReport, activeReport, refreshReports } = useReport();
  const { refreshTemplate } = useTemplate();

  useEffect(() => {
    if (isOpen) {
      const templateStorage = getStoredTemplates();
      setTemplates(templateStorage.templates);
      const reportStorage = getStoredReports();
      setReports(reportStorage.reports);
    }
  }, [isOpen]);

  const handleDelete = (id: string, type: "template" | "report") => {
    if (type === "template") {
      if (id === "default") {
        toast.error("Cannot delete the default template");
        return;
      }
      if (templates.length <= 1) {
        toast.error("Cannot delete the last template");
        return;
      }
    }
    setDeleteItem({ id, type });
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === "template") {
        const wasActive = templates.find(
          (t) => t.id === activeReport?.templateId
        );
        deleteTemplate(deleteItem.id);
        setTemplates(templates.filter((t) => t.id !== deleteItem.id));
        toast.success("Template deleted");
        refreshTemplate();
        if (wasActive) {
          // Handle if active report used this template
          refreshReports();
        }
      } else {
        const wasActive = activeReport?.id === deleteItem.id;
        deleteReport(deleteItem.id);
        setReports(reports.filter((r) => r.id !== deleteItem.id));
        toast.success("Report deleted");
        refreshReports();
        if (wasActive) {
          editor.children = INITIAL_VALUE;
          Transforms.select(editor, Editor.end(editor, []));
          setActiveTemplate("default");
          refreshTemplate();
          onClose();
        }
      }
    }
    setIsConfirmOpen(false);
    setDeleteItem(null);
  };

  const handleEditTemplate = (template: Template) => {
    onOpenBuilder(template);
    onClose();
  };

  const handleCreateNewTemplate = () => {
    onOpenBuilder();
    onClose();
  };

  const handleEditReport = (report: Report) => {
    const success = loadReportToEditor(editor, report.id);
    if (success) {
      toast.success("Report loaded for editing");
      setActiveTemplate(report.templateId);
      setActiveReport(report.id);
      onClose();
    } else {
      toast.error("Failed to load report");
    }
  };

  if (!isOpen) return null;

  const title = activeTab === "templates" ? "Templates" : "Reports";

  return (
    <>
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
          className="flex flex-col bg-[var(--color-bg-default)] shadow-xl rounded-lg w-full max-w-2xl max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border border-[var(--color-border-default)] border-b">
            <h2 className="font-semibold text-[var(--color-text-default)] text-lg">
              Manage {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded focus:outline-none focus:ring-[var(--color-text-primary)] focus:ring-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border border-[var(--color-border-default)] border-b">
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === "templates"
                  ? "border-b-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
              }`}
            >
              <Settings size={16} />
              Templates
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === "reports"
                  ? "border-b-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
              }`}
            >
              <FileText size={16} />
              Reports
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === "templates" && (
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="py-8 text-[var(--color-text-muted)] text-center">
                    No templates yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex justify-between items-center bg-[var(--color-bg-gray)] hover:bg-[var(--color-bg-hover)] p-3 border border-[var(--color-border-default)] rounded cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--color-text-default)] truncate">
                            {template.name}
                          </div>
                          {template.description && (
                            <div className="mt-1 text-[var(--color-text-gray)] text-sm truncate">
                              {template.description}
                            </div>
                          )}
                          <div className="mt-1 text-[var(--color-text-muted)] text-xs">
                            {template.taskTypes.length} task types,{" "}
                            {template.statuses.length} statuses
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template);
                            }}
                            className="p-1 text-[var(--color-text-success)] hover:text-[var(--color-text-success)]/[0.8]"
                            title="Edit Template"
                          >
                            <Edit size={16} />
                          </button>
                          {templates.length > 1 &&
                            template.id !== "default" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(template.id, "template");
                                }}
                                className="p-1 text-[var(--color-text-error)] hover:text-[var(--color-text-error)]/[0.8]"
                                title="Delete Template"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleCreateNewTemplate}
                  className="flex items-center gap-2 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-primary)]/[0.8] px-4 py-2 rounded w-full text-[var(--color-text-default)] text-sm"
                >
                  <Plus size={16} />
                  Create New Template
                </button>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-2">
                {reports.length === 0 ? (
                  <p className="py-8 text-[var(--color-text-muted)] text-center">
                    No reports yet. Create one by editing and saving.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex justify-between items-center bg-[var(--color-bg-gray)] p-3 border border-[var(--color-border-default)] rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--color-text-default)] truncate">
                            {report.title || `Report ${report.id}`}
                          </div>
                          <div className="text-[var(--color-text-muted)] text-sm truncate">
                            Template ID: {report.templateId}
                          </div>
                          <div className="text-[var(--color-text-gray)] text-xs">
                            Created: {report.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditReport(report)}
                            className="p-1 text-[var(--color-text-success)] hover:text-[var(--color-text-success)]/[0.8]"
                            title="Edit Report"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id, "report")}
                            className="p-1 text-[var(--color-text-error)] hover:text-[var(--color-text-error)]/[0.8]"
                            title="Delete Report"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={
          deleteItem?.type === "template" ? "Delete Template" : "Delete Report"
        }
        message={`Are you sure you want to delete this ${deleteItem?.type}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
