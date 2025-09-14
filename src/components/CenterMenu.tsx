import { useState } from "react";
import {
  Plus,
  Eye,
  Settings,
  Upload,
  HelpCircle,
  Copy,
  List,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TemplateSelector from "./TemplateSelector";
import { Template } from "../types/template";
import { toast } from "react-hot-toast";

interface CenterMenuProps {
  onOpenBuilder: (template?: Template) => void;
  onTogglePreview: () => void;
  onTemplateChange: (template: Template) => void;
}

export function CenterMenu({
  onOpenBuilder,
  onTogglePreview,
  onTemplateChange,
}: CenterMenuProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleBuilder = () => {
    onOpenBuilder();
  };

  const handlePreview = () => {
    onTogglePreview();
  };

  const handleSettings = () => {
    setIsSelectorOpen(true);
  };

  const dummyAction = () => {
    toast("This is a dummy action");
  };

  return (
    <>
      <div className="bottom-4 left-1/2 z-20 fixed -translate-x-1/2 transform">
        <motion.div
          className="flex gap-1 bg-white dark:bg-gray-800 shadow-xl p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
          whileHover={{ y: -1 }}
          transition={{ duration: 0.1 }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={dummyAction}
            className="flex justify-center items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            title="Help"
          >
            <HelpCircle size={20} color="white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSettings}
            className="flex justify-center items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            title="Template List"
          >
            <List color="white" size={20} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePreview}
            className="flex justify-center items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            title="Markdown Preview"
          >
            <Play color="white" size={20} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBuilder}
            className="flex justify-center items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
            title="Template Builder (New)"
          >
            <Plus color="white" size={20} />
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSelectorOpen && (
          <TemplateSelector
            isOpen={isSelectorOpen}
            onClose={() => setIsSelectorOpen(false)}
            onTemplateChange={onTemplateChange}
            onOpenBuilder={onOpenBuilder}
            onTogglePreview={onTogglePreview}
            showButton={false}
          />
        )}
      </AnimatePresence>
    </>
  );
}
