import { useCallback } from "react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { RenderElementProps, RenderLeafProps, withReact } from "slate-react";
import renderEditorElement from "../utils/renderer/renderEditorElement";
import { handleKeyDownFactory } from "../utils/editor/handleKeyDown";
import Leaf from "../elements/leaf";

// Custom hook to setup the editor with history & react
function useEditorSetup() {
  const editor = withHistory(withReact(createEditor()));

  const renderElement = useCallback(
    (props: RenderElementProps) => renderEditorElement(props),
    []
  );

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  const handleKeyDown = useCallback(handleKeyDownFactory(editor), [editor]);

  return { editor, renderElement, renderLeaf, handleKeyDown };
}

export { useEditorSetup };
