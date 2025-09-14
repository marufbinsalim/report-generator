import { useState, useEffect, useRef } from "react";
import { Slate, Editable } from "slate-react";
import { Transforms } from "slate";
import { Toaster } from "react-hot-toast";

import { getInitialValue } from "./data/CONSTANTS/editor_initial_value";
import { useEditorSetup } from "./hooks/useEditorSetup";
import "./App.css";
import { MDPreview } from "./components/MDPreview";
import TemplateBuilder from "./components/TemplateBuilder";
import TemplateSelector from "./components/TemplateSelector";
import NewReportModal from "./components/NewReportModal";
import { CenterMenu } from "./components/CenterMenu";
import ReportsList from "./components/ReportsList";
import { TemplateProvider, useTemplate } from "./contexts/TemplateContext";
import { ReportProvider, useReport } from "./contexts/ReportContext";
import { CustomElementType } from "./assets/editorTypes";
import { Template } from "./types/template";
import { Report } from "./types/report";
import { Editor } from "slate";
import { saveReport } from "./utils/templateStorage";
import { toast } from "react-hot-toast";

function AppContent() {
  const { editor, renderElement, renderLeaf, handleKeyDown } = useEditorSetup();
  const { activeTemplate, setActiveTemplate, refreshTemplate } = useTemplate();
  const { activeReport, setActiveReport, refreshReports } = useReport();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
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

  const handleOpenBuilder = (template?: Template) => {
    setEditingTemplate(template || null);
    setIsBuilderOpen(true);
  };

  const handleBuilderSave = () => {
    refreshTemplate();
    refreshReports();
    setIsBuilderOpen(false);
    setEditingTemplate(null);
  };

  const handleOpenReports = () => setIsReportsOpen(true);

  const handleOpenNewReport = () => setIsNewReportOpen(true);

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
        onOpenBuilder={handleOpenBuilder}
        onOpenSelector={() => setIsTemplateSelectorOpen(true)}
        onTogglePreview={onTogglePreview}
        onOpenReports={handleOpenReports}
        onOpenNewReport={handleOpenNewReport}
      />

      {/* Editor */}
      <Slate editor={editor} initialValue={initialValue} key={editorKey}>
        <div className="relative flex flex-col flex-1 py-5 pl-[35px] overflow-y-auto">
          <MDPreview isOpen={isPreviewOpen} onToggle={onTogglePreview} />
          {activeReport && (
            <div className="bg-gray-100 dark:bg-gray-700 mb-4 p-3 rounded-lg w-[calc(100%-20px)]">
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300 text-sm">
                Report Title
              </label>
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={generateDefaultTitle(activeTemplate)}
                  className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100"
                />
                <br />
                <div className="flex items-end gap-2 w-full">
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
              </div>
            </div>
          )}
          <Editable
            className="flex-1 outline-none w-[calc(100%-20px)] grow"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
          />
        </div>
      </Slate>

      {/* Template Builder Modal */}
      <TemplateBuilder
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleBuilderSave}
        template={editingTemplate}
      />
      <TemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onOpenBuilder={handleOpenBuilder}
        onTogglePreview={onTogglePreview}
        showButton={false}
      />
      <Toaster position="bottom-right" />
      <ReportsList
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        editor={editor}
      />
      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        editor={editor}
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
