import { useState, useEffect } from "react";
import { X, Edit, Trash2, Eye, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Report } from "../types/report";
import {
  getStoredReports,
  deleteReport,
  loadReportToEditor,
  setActiveTemplate,
} from "../utils/templateStorage";
import { toast } from "react-hot-toast";
import { useReport } from "../contexts/ReportContext";
import ConfirmModal from "./ConfirmModal";

interface ReportsListProps {
  isOpen: boolean;
  onClose: () => void;
  editor: any;
}

export default function ReportsList({
  isOpen,
  onClose,
  editor,
}: ReportsListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const { setActiveReport } = useReport();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storedReports = getStoredReports();
      setReports(storedReports.reports);
    }
  }, [isOpen]);

  const handleDelete = (reportId: string) => {
    setDeletingReport(reportId);
    setIsConfirmOpen(true);
  };

  const confirmDeleteReport = () => {
    if (deletingReport) {
      deleteReport(deletingReport);
      setReports(reports.filter((r) => r.id !== deletingReport));
      toast.success("Report deleted");
    }
    setIsConfirmOpen(false);
    setDeletingReport(null);
  };

  const handleEditReport = (report: Report) => {
    const success = loadReportToEditor(editor, report.id);
    if (success) {
      toast.success("Report loaded for editing");
      onClose();
      setActiveTemplate(report.templateId);
      setActiveReport(report.id);
    } else {
      toast.error("Failed to load report");
    }
  };

  if (!isOpen) return null;

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
          className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-2xl max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              Reports
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
            {reports.length === 0 ? (
              <p className="py-8 text-gray-500 dark:text-gray-400 text-center">
                No reports yet. Create one by editing and saving.
              </p>
            ) : (
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {report.title || `Report ${report.id}`}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
                        Template ID: {report.templateId}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Created: {report.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditReport(report)}
                        className="p-1 text-green-500 hover:text-green-700"
                        title="Edit Report"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1 text-red-500 hover:text-red-700"
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
        </motion.div>
      </motion.div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDeleteReport}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
