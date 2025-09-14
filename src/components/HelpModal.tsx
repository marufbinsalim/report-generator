import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="z-[10001] fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="flex flex-col bg-[var(--color-bg-default)] shadow-lg border border-[var(--color-border-default)] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-[var(--color-border-default)] border-b">
          <h3 className="font-semibold text-[var(--color-text-default)] text-base">
            Help & About
          </h3>
          <button
            onClick={onClose}
            className="p-1 focus:ring-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 text-[var(--color-text-gray)] hover:text-[var(--color-text-default)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-4">
          {/* Website Explanation */}
          <section>
            <h4 className="mb-2 font-semibold text-[var(--color-text-default)]">
              About This Website
            </h4>
            <p className="text-[var(--color-text-gray)] text-sm leading-relaxed">
              This is a Report Generator tool designed to help you create, edit,
              and manage markdown-based reports efficiently. It features an
              intuitive editor with live preview, template support for quick
              starts, and easy saving/loading of reports.
            </p>
          </section>

          {/* Features */}
          <section>
            <h4 className="mb-2 font-semibold text-[var(--color-text-default)]">
              Features
            </h4>
            <ul className="space-y-1 text-[var(--color-text-gray)] text-sm">
              <li>
                • Markdown Editor with rich text support (bold, lists, etc.)
              </li>
              <li>• Real-time Preview Toggle</li>
              <li>• Save and Load Reports</li>
              <li>• Template Management for reusable structures</li>
              <li>• Keyboard Shortcuts for faster workflow</li>
              <li>• Responsive Design for desktop and mobile</li>
            </ul>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h4 className="mb-2 font-semibold text-[var(--color-text-default)]">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-4 text-[var(--color-text-gray)] text-sm">
              <div>
                <p className="mb-2 font-medium">Editor Actions</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cmd/Ctrl + B: Bold (When cursor is inside A Task)</li>
                  <li>
                    • Shift + Enter: Add new task (When cursor is inside A Task)
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-medium">Global Actions</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cmd/Ctrl + S: Save Report</li>
                  <li>• Cmd/Ctrl + P: Toggle Markdown Preview</li>
                  <li>• Cmd/Ctrl + M: New Report / Template Modal</li>
                  <li>• Cmd/Ctrl + L: Open Reports / Template List</li>
                  <li>• Esc: Close Modals</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Plug */}
          <div className="pt-4 border-[var(--color-border-default)] border-t text-center">
            <p className="text-[var(--color-text-gray)] text-xs">
              Developed By Maruf
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
