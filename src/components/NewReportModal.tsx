import { useState, useEffect } from "react";
import { X, Plus, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Template } from "../types/template";
import { Editor } from "slate";
import { getStoredTemplates } from "../utils/templateStorage";
import {
  saveCurrentReport,
  loadReportToEditor,
} from "../utils/templateStorage";
import { getInitialValue } from "../data/CONSTANTS/editor_initial_value";
import { useReport } from "../contexts/ReportContext";
import { toast } from "react-hot-toast";
import { CustomElementType } from "../assets/editorTypes";

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
}

export default function NewReportModal({
  isOpen,
  onClose,
  editor,
}: NewReportModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const { setActiveReport, refreshReports } = useReport();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storage = getStoredTemplates();
      setTemplates(storage.templates);
    }
  }, [isOpen]);

  const handleCreateReport = (template: Template) => {
    setLoading(true);
    const title = `Report - ${
      template.name
    } - ${new Date().toLocaleDateString()}`;
    const initialContent = getInitialValue(template) as CustomElementType[];
    editor.children = initialContent;
    const reportId = saveCurrentReport(editor, template.id, title);
    loadReportToEditor(editor, reportId);
    setActiveReport(reportId);
    refreshReports();
    toast.success("New report created");
    onClose();
    setLoading(false);
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
        className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-2xl max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            Create New Report
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 p-4 overflow-y-auto">
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
                  onClick={() => handleCreateReport(template)}
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
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-2 rounded text-white"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
