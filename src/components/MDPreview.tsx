import { useSlate } from "slate-react";
import { parseTasksToMarkdown } from "../utils/editor/parser";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, X } from "lucide-react";

interface MDPreviewProps {
  isOpen: boolean;
  onToggle: () => void;
}

function MDPreview({ isOpen, onToggle }: MDPreviewProps) {
  const editor = useSlate();
  const markdown = parseTasksToMarkdown(editor.children);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="z-[9998] fixed inset-0 flex justify-center items-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col bg-gray-100 dark:bg-gray-900 shadow-lg p-6 rounded-lg w-[90vw] max-w-3xl max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                Markdown Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(markdown)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white transition"
                >
                  <Copy size={16} />
                  Copy
                </button>
                <button
                  onClick={onToggle}
                  className="flex justify-center items-center bg-red-600 hover:bg-red-700 p-2 rounded text-white transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-auto">
              <pre className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {markdown}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { MDPreview };
