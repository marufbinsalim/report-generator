import { useState, useEffect, useRef } from "react";
import { Slate, Editable } from "slate-react";
import { Toaster } from "react-hot-toast";
import { FileText, Undo, Redo, Clock, Trash2 } from "lucide-react";
import { getInitialValue } from "./data/CONSTANTS/editor_initial_value";
import { deleteReport } from "./utils/templateStorage";
import { useEditorSetup } from "./hooks/useEditorSetup";
import "./App.css";
import { MDPreview } from "./components/MDPreview";
import { CenterMenu } from "./components/CenterMenu";
import { TemplateProvider, useTemplate } from "./contexts/TemplateContext";
import { ReportProvider, useReport } from "./contexts/ReportContext";
import { Template } from "./types/template";
import { Report } from "./types/report";
import {
  saveReport,
  getStoredTemplates,
  getStoredReports,
} from "./utils/templateStorage";
import { toast } from "react-hot-toast";
import UnifiedListModal from "./components/UnifiedListModal";
import UnifiedCreateModal from "./components/UnifiedCreateModal";
import ConfirmModal from "./components/ConfirmModal";

function AppContent() {
  const { editor, renderElement, renderLeaf, handleKeyDown } = useEditorSetup();
  const { activeTemplate, refreshTemplate } = useTemplate();
  const { activeReport, refreshReports } = useReport();
  const [isUnifiedListOpen, setIsUnifiedListOpen] = useState(false);
  const [isUnifiedCreateOpen, setIsUnifiedCreateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [displayTitle, setDisplayTitle] = useState<string>("");
  const onTogglePreview = () => setIsPreviewOpen((prev) => !prev);

  // Update display title when active report changes
  useEffect(() => {
    if (activeReport) {
      setDisplayTitle(
        activeReport.title || generateDefaultTitle(activeTemplate)
      );
    } else {
      setDisplayTitle("");
    }
  }, [activeReport, activeTemplate]);

  const generateDefaultTitle = (template: Template | null | undefined) => {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const templateName = template?.name || "Untitled Template";
    return `Report - ${templateName} - ${timestamp}`;
  };

  // Title change handler
  const handleTitleChange = (newTitle: string) => {
    setDisplayTitle(newTitle);
  };

  const handleOpenCreate = (template?: Template) => {
    setEditingTemplate(template || null);
    setIsUnifiedCreateOpen(true);
  };

  const handleOpenList = () => {
    setIsUnifiedListOpen(true);
  };

  const handleOpenNewReport = () => {
    handleOpenCreate();
  };

  const handleDeleteReport = () => {
    if (activeReport) {
      deleteReport(activeReport.id);
      const templateStorage = getStoredTemplates();
      templateStorage.activeTemplateId = null;
      localStorage.setItem(
        "report-generator-templates",
        JSON.stringify(templateStorage)
      );
      const reportStorage = getStoredReports();
      reportStorage.activeReportId = undefined;
      localStorage.setItem(
        "report-generator-reports",
        JSON.stringify(reportStorage)
      );
      refreshTemplate();
      refreshReports();
      toast.success("Report deleted");
    }
    setIsDeleteConfirmOpen(false);
  };

  // Unified auto-save logic with debounce for title and content
  useEffect(() => {
    if (activeReport) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setSaveStatus("saving");

      const timeout = setTimeout(() => {
        const currentTitle =
          displayTitle.trim() || generateDefaultTitle(activeTemplate);
        const updatedReport: Report = {
          ...activeReport,
          title: currentTitle,
          content: JSON.stringify(editor.children),
          updatedAt: new Date(),
        };
        saveReport(updatedReport);
        toast.success("Report auto-saved");
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 1000); // 1 second debounce

      saveTimeoutRef.current = timeout;
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [editor.children, displayTitle, activeReport, activeTemplate]);

  const initialValue = activeReport
    ? getInitialValue(activeTemplate, activeReport.content)
    : getInitialValue(activeTemplate);

  const editorKey = activeReport?.id || activeTemplate?.id || "default";

  return (
    <div className="relative flex bg-[#dbdbdb] dark:bg-gray-800 h-svh max-h-svh overflow-hidden">
      <CenterMenu
        onOpenBuilder={handleOpenCreate}
        onOpenSelector={handleOpenList}
        onTogglePreview={onTogglePreview}
        onOpenReports={handleOpenList}
        onOpenNewReport={handleOpenNewReport}
      />

      <div className="relative flex flex-col flex-1">
        {activeReport ? (
          <>
            {/* Sticky Toolbar */}
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-gray-800 p-4 border-gray-200 dark:border-gray-700 border-b">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled report"
                  className="bg-transparent outline-none w-full font-bold text-gray-900 dark:text-white text-2xl placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-4">
                {/* Undo/Redo */}
                <button
                  onClick={() => editor.undo()}
                  disabled={editor.history.undos.length === 0}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 p-2 rounded disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </button>
                <button
                  onClick={() => editor.redo()}
                  disabled={editor.history.redos.length === 0}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 p-2 rounded disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </button>
                {/* Report Details */}
                {activeReport && activeTemplate && (
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>
                        Created:{" "}
                        {new Date(activeReport.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span>Template: {activeTemplate.name}</span>
                  </div>
                )}
                {/* Save Status */}
                <div className="flex items-center gap-2">
                  {saveStatus === "saving" && (
                    <span className="text-blue-600 dark:text-blue-400 text-sm animate-pulse">
                      Saving...
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="text-green-600 dark:text-green-400 text-sm">
                      Saved
                    </span>
                  )}
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded text-red-600 dark:text-red-400"
                  title="Delete Report"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 py-5 pl-[35px] overflow-y-auto">
              <Slate
                editor={editor}
                initialValue={initialValue}
                key={editorKey}
              >
                <MDPreview isOpen={isPreviewOpen} onToggle={onTogglePreview} />
                <Editable
                  className="outline-none"
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  onKeyDown={handleKeyDown}
                />
              </Slate>
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 py-5 pl-[35px] overflow-y-auto">
            <div className="p-8 max-w-md text-center">
              <FileText className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h2 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
                No Active Report
              </h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                It looks like you haven't created any reports yet. Start by
                creating a new report using one of your templates.
              </p>
              <button
                onClick={handleOpenNewReport}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white transition-colors"
              >
                Create New Report
              </button>
            </div>
          </div>
        )}
      </div>

      <UnifiedListModal
        isOpen={isUnifiedListOpen}
        onClose={() => setIsUnifiedListOpen(false)}
        editor={editor}
        onOpenBuilder={handleOpenCreate}
      />

      <UnifiedCreateModal
        isOpen={isUnifiedCreateOpen}
        onClose={() => {
          setIsUnifiedCreateOpen(false);
          setEditingTemplate(null);
        }}
        editor={editor}
        template={editingTemplate}
      />

      <Toaster position="bottom-right" />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteReport}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

function App() {
  return (
    <TemplateProvider>
      <ReportProvider>
        <AppContent />
      </ReportProvider>
    </TemplateProvider>
  );
}

export default App;
