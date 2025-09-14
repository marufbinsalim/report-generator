import { Plus, HelpCircle, Play, Save, List } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Template } from "../types/template";
import HelpModal from "./HelpModal";

interface CenterMenuProps {
  onOpenBuilder: (template?: Template) => void;
  onOpenSelector?: () => void;
  onTogglePreview: () => void;
  onSaveReport?: () => void;
  onOpenReports?: () => void;
  onOpenNewReport?: () => void;
}

export function CenterMenu({
  onTogglePreview,
  onSaveReport,
  onOpenReports,
  onOpenNewReport,
}: CenterMenuProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handlePreview = () => {
    onTogglePreview();
  };

  return (
    <>
      <div className="bottom-4 left-1/2 z-20 fixed -translate-x-1/2 transform">
        <motion.div
          className="flex gap-1 bg-[var(--color-bg-default)] shadow-xl p-2 border border-[var(--color-border-default)] rounded-lg"
          whileHover={{ y: -1 }}
          transition={{ duration: 0.1 }}
        >
          {onOpenReports && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenReports}
              className="flex justify-center items-center hover:bg-[var(--color-bg-gray)] p-2 rounded"
              title="View Reports"
            >
              <List className="text-[var(--color-text-default)]" size={20} />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePreview}
            className="flex justify-center items-center hover:bg-[var(--color-bg-gray)] p-2 rounded"
            title="Markdown Preview"
          >
            <Play className="text-[var(--color-text-default)]" size={20} />
          </motion.button>

          {onSaveReport && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSaveReport}
              className="flex justify-center items-center hover:bg-[var(--color-bg-gray)] p-2 rounded"
              title="Save Report"
            >
              <Save className="text-[var(--color-text-default)]" size={20} />
            </motion.button>
          )}

          {onOpenNewReport && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenNewReport}
              className="flex justify-center items-center hover:bg-[var(--color-bg-gray)] p-2 rounded"
              title="New Report"
            >
              <Plus className="text-[var(--color-text-default)]" size={20} />
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHelpOpen(true)}
            className="flex justify-center items-center hover:bg-[var(--color-bg-gray)] p-2 rounded"
            title="Help"
          >
            <HelpCircle
              size={20}
              className="text-[var(--color-text-default)]"
            />
          </motion.button>
        </motion.div>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
