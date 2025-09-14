import { X } from "lucide-react";
import { motion } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmModalProps) {
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
        className="flex flex-col bg-[var(--color-bg-default)] shadow-lg border border-[var(--color-border-default)] rounded-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-[var(--color-border-default)] border-b">
          <h3 className="font-semibold text-[var(--color-text-default)] text-base">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 focus:ring-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 text-[var(--color-text-gray)] hover:text-[var(--color-text-default)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-[var(--color-text-gray)] text-sm">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-[var(--color-border-default)] border-t">
          <button
            onClick={onClose}
            className="hover:bg-[var(--color-bg-gray)] px-4 py-2 border border-[var(--color-border-default)] rounded-md font-medium text-[var(--color-text-gray)] text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 shadow-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-white text-sm transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
