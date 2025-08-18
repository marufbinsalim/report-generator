import { Editor, Transforms } from "slate";
import { CustomElementType, CustomTextType } from "../../assets/editorTypes";
const SLATE_FRAGMENT_PREFIX = "SLATE-FRAGMENT:";

export async function copyFragment(editor: Editor) {
  if (!editor.selection) return;
  const fragments = Editor.fragment(
    editor,
    editor.selection
  ) as CustomElementType[];
  const texts = fragments.map((f) => f.children).flat();
  const serialized = serializeFragment(texts);
  const clipboardPayload = SLATE_FRAGMENT_PREFIX + serialized;
  try {
    await navigator.clipboard.writeText(clipboardPayload);
  } catch (e) {
    console.error("Copy failed", e);
  }
}

export async function cutFragment(editor: Editor) {
  await copyFragment(editor);
  Transforms.delete(editor);
}

export async function pasteFragment(editor: Editor) {
  const clipboardText = await navigator.clipboard.readText();
  if (!clipboardText) return;
  if (!clipboardText.startsWith(SLATE_FRAGMENT_PREFIX)) {
    Transforms.insertText(editor, clipboardText);
    return;
  }

  const serialized = clipboardText.slice(SLATE_FRAGMENT_PREFIX.length);
  const fragment = deserializeFragment(serialized);
  const texts = fragment?.map((f) => f.text).join("\n") ?? "";
  Transforms.insertText(editor, texts);
}

export function serializeFragment(fragment: CustomTextType[]): string {
  const json = JSON.stringify(fragment);
  return btoa(encodeURIComponent(json));
}

export function deserializeFragment(
  serialized: string
): CustomTextType[] | null {
  const json = decodeURIComponent(atob(serialized));
  const parsed = JSON.parse(json);
  return Array.isArray(parsed) ? parsed : null;
}
