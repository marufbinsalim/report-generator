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
    <div className="relative flex bg-[var(--color-bg-default)] h-svh max-h-svh overflow-hidden">
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
            <div className="top-0 z-10 sticky flex justify-between items-center bg-[var(--color-bg-default)] p-4 px-12 border-[var(--color-border-default)] border-b">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled report"
                  className="bg-transparent outline-none w-full font-bold placeholder-[var(--color-text-gray)] text-[var(--color-text-default)] text-2xl"
                />
              </div>
              <div className="flex items-center gap-4">
                {/* Undo/Redo */}
                <button
                  onClick={() => editor.undo()}
                  disabled={editor.history.undos.length === 0}
                  className="hover:bg-[var(--color-bg-gray)] disabled:opacity-50 p-2 rounded disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo size={20} className="text-[var(--color-text-gray)]" />
                </button>
                <button
                  onClick={() => editor.redo()}
                  disabled={editor.history.redos.length === 0}
                  className="hover:bg-[var(--color-bg-gray)] disabled:opacity-50 p-2 rounded disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo size={20} className="text-[var(--color-text-gray)]" />
                </button>
                {/* Report Details */}
                {activeReport && activeTemplate && (
                  <div className="flex items-center gap-4 text-[var(--color-text-muted)] text-sm">
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
                    <span className="text-[var(--color-text-primary)] text-sm animate-pulse">
                      Saving...
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="text-[var(--color-text-success)] text-sm">
                      Saved
                    </span>
                  )}
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="hover:bg-[var(--color-bg-error)] p-2 rounded text-[var(--color-text-error)]"
                  title="Delete Report"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 px-12 py-5 pl-[35px] w-[calc(100%-20px)] overflow-y-auto">
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
          <div className="flex flex-1 justify-center items-center bg-[var(--color-bg-gray)] py-5 pl-[35px] overflow-y-auto">
            <div className="p-8 max-w-md text-center">
              <FileText className="mx-auto mb-4 w-12 h-12 text-[var(--color-text-muted)]" />
              <h2 className="mb-2 font-bold text-[var(--color-text-default)] text-2xl">
                No Active Report
              </h2>
              <p className="mb-8 text-[var(--color-text-gray)]">
                It looks like you haven't created any reports yet. Start by
                creating a new report using one of your templates.
              </p>
              <button
                onClick={handleOpenNewReport}
                className="bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-primary)]/[0.8] px-6 py-2 rounded-lg focus:outline-none focus:ring-[var(--color-text-primary)] focus:ring-2 font-medium text-[var(--color-text-default)] transition-colors"
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
