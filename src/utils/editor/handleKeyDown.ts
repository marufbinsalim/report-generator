// utils/editor/handleKeyDown.ts
import { KeyboardEvent } from "react";
import { Editor, Transforms } from "slate";
import toggleBold from "../marker/toggleBold";
import {
  copyFragment,
  cutFragment,
  pasteFragment,
} from "../fragment/fragments";

export const handleKeyDownFactory =
  (editor: Editor) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          toggleBold(editor);
          break;
        case "z":
          e.preventDefault();
          editor.undo();
          break;
        case "y":
          e.preventDefault();
          editor.redo();
          break;
        case "c":
          e.preventDefault();
          copyFragment(editor);
          break;
        case "x":
          e.preventDefault();
          cutFragment(editor);
          break;
        case "v":
          e.preventDefault();
          pasteFragment(editor);
          break;
      }
      return;
    }

    if (!e.ctrlKey && e.shiftKey) {
      if (e.key === "Enter") {
        e.preventDefault();
        editor.insertBreak();
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      Transforms.insertText(editor, "\n - ");
    }
  };
