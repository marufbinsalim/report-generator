import { Editor } from "slate";
import { ReactEditor } from "slate-react";

const toggleBold = (editor: Editor) => {
  if (!editor.selection) return;
  const marks = Editor.marks(editor);
  const isActive = marks?.bold === true;
  isActive
    ? Editor.removeMark(editor, "bold")
    : Editor.addMark(editor, "bold", true);

  ReactEditor.focus(editor);
};

export default toggleBold;
