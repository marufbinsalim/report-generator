import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      className="z-[10001] fixed inset-0 flex justify-center items-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-gray-200 dark:border-gray-700 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
