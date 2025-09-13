import { useState, useEffect } from "react";
import { Slate, Editable } from "slate-react";
import { Transforms, Editor } from "slate";

import { getInitialValue } from "./data/CONSTANTS/editor_initial_value";
import { useEditorSetup } from "./hooks/useEditorSetup";
import "./App.css";
import { MDPreview } from "./components/MDPreview";
import { TemplateProvider, useTemplate } from "./contexts/TemplateContext";
import TemplateSelector from "./components/TemplateSelector";
import TemplateBuilder from "./components/TemplateBuilder";
import { Template } from "./types/template";
import { CustomElementType } from "./assets/editorTypes";

function AppContent() {
  const { editor, renderElement, renderLeaf, handleKeyDown } = useEditorSetup();
  const { activeTemplate, setActiveTemplate } = useTemplate();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleTemplateChange = (template: Template) => {
    setActiveTemplate(template);
  };

  const handleOpenBuilder = (template?: Template) => {
    setEditingTemplate(template || null);
    setIsBuilderOpen(true);
  };

  const handleBuilderSave = () => {
    // Refresh the template context
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="relative flex bg-[#dbdbdb] dark:bg-gray-800 h-svh max-h-svh overflow-hidden">
      {/* Template Controls */}
      <div className="top-4 right-4 z-10 absolute">
        <TemplateSelector
          onTemplateChange={handleTemplateChange}
          onOpenBuilder={handleOpenBuilder}
        />
      </div>

      {/* Editor */}
      <Slate
        editor={editor}
        initialValue={getInitialValue(activeTemplate)}
        key={activeTemplate?.id || "default"}
      >
        <div className="relative flex flex-col flex-1 py-5 pl-[35px] overflow-y-auto">
          <MDPreview />
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
        onClose={() => setIsBuilderOpen(false)}
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
