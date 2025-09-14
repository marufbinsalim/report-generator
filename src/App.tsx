import { useState } from "react";
import { Slate, Editable } from "slate-react";
import { Transforms, Editor } from "slate";

import { getInitialValue } from "./data/CONSTANTS/editor_initial_value";
import { useEditorSetup } from "./hooks/useEditorSetup";
import "./App.css";
import { MDPreview } from "./components/MDPreview";
import TemplateBuilder from "./components/TemplateBuilder";
import { CenterMenu } from "./components/CenterMenu";
import { TemplateProvider, useTemplate } from "./contexts/TemplateContext";
import { CustomElementType } from "./assets/editorTypes";
import { Template } from "./types/template";

function AppContent() {
  const { editor, renderElement, renderLeaf, handleKeyDown } = useEditorSetup();
  const { activeTemplate, setActiveTemplate, refreshTemplate } = useTemplate();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const onTogglePreview = () => setIsPreviewOpen((prev) => !prev);

  const handleOpenBuilder = (template?: Template) => {
    setEditingTemplate(template || null);
    setIsBuilderOpen(true);
  };

  const handleBuilderSave = () => {
    refreshTemplate();
    setIsBuilderOpen(false);
    setEditingTemplate(null);
  };

  const handleTemplateChange = (template: Template) => {
    setActiveTemplate(template);
    refreshTemplate();
  };

  return (
    <div className="relative flex bg-[#dbdbdb] dark:bg-gray-800 h-svh max-h-svh overflow-hidden">
      <CenterMenu
        onOpenBuilder={handleOpenBuilder}
        onTogglePreview={onTogglePreview}
        onTemplateChange={handleTemplateChange}
      />

      {/* Editor */}
      <Slate
        editor={editor}
        initialValue={getInitialValue(activeTemplate)}
        key={activeTemplate?.id || "default"}
      >
        <div className="relative flex flex-col flex-1 py-5 pl-[35px] overflow-y-auto">
          <MDPreview isOpen={isPreviewOpen} onToggle={onTogglePreview} />
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
    </div>
  );
}

function App() {
  return (
    <TemplateProvider>
      <AppContent />
    </TemplateProvider>
  );
}

export default App;
