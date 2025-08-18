import { Slate, Editable } from "slate-react";

import { INITIAL_VALUE } from "./data/CONSTANTS/editor_initial_value";
import { useEditorSetup } from "./hooks/useEditorSetup";
import "./App.css";
import { MDPreview } from "./components/MDPreview";

function App() {
  const { editor, renderElement, renderLeaf, handleKeyDown } = useEditorSetup();

  return (
    <div className="relative flex bg-[#dbdbdb] dark:bg-gray-800 h-svh max-h-svh overflow-hidden">
      {/* Editor */}
      <Slate editor={editor} initialValue={INITIAL_VALUE}>
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
    </div>
  );
}

export default App;
