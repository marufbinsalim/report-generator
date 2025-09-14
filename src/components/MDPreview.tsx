import { useSlate } from "slate-react";
import { parseTasksToMarkdown } from "../utils/editor/parser";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

interface MDPreviewProps {
  isOpen: boolean;
  onToggle: () => void;
}

function MDPreview({ isOpen, onToggle }: MDPreviewProps) {
  const editor = useSlate();
  const markdown = parseTasksToMarkdown(editor.children);

  const [activeTab, setActiveTab] = useState<"normal" | "ai">("normal");
  const [prompt, setPrompt] = useState("");
  const [refinedMarkdown, setRefinedMarkdown] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const refineMarkdown = async () => {
    if (!prompt.trim()) return;
    setIsRefining(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_KEY;
      if (!apiKey) {
        alert(
          "Gemini API key not found. Please check your environment variables."
        );
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${markdown}\n\nRefine this markdown based on the following prompt: ${prompt}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated.";
      setRefinedMarkdown(generatedText);
    } catch (error) {
      console.error("Error refining markdown:", error);
      alert("Failed to refine markdown. Please try again.");
      setRefinedMarkdown("");
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy to clipboard.");
      });
  };

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
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Markdown Preview
                </h2>
                <button
                  onClick={onToggle}
                  className="flex justify-center items-center bg-red-600 hover:bg-red-700 p-2 rounded text-white transition"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex border-gray-200 dark:border-gray-700 border-b">
                <button
                  onClick={() => setActiveTab("normal")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "normal"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "ai"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  AI Refine
                </button>
              </div>
              {/* Normal Tab Copy Button */}
              {activeTab === "normal" && (
                <button
                  onClick={() => copyToClipboard(markdown)}
                  className="flex items-center self-end gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white transition"
                >
                  <Copy size={16} />
                  Copy Normal
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === "normal" ? (
                <div className="p-4 max-w-none text-white whitespace-pre-wrap dark:prose prose prose-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-bold text-gray-900 dark:text-white text-3xl">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-semibold text-gray-900 dark:text-white text-2xl">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                          {children}
                        </h3>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 text-gray-800 dark:text-gray-200 list-disc">
                          {children}
                        </li>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {/* Prompt Input */}
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                      Refinement Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe how you want to refine this markdown (e.g., 'Make it more concise', 'Add bullet points', 'Improve structure')..."
                      className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100"
                      rows={3}
                    />
                  </div>
                  {/* Refine Button */}
                  <button
                    onClick={refineMarkdown}
                    disabled={!prompt.trim() || isRefining}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-4 py-2 rounded-md text-white transition"
                  >
                    {isRefining ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <span>Refine with AI</span>
                    )}
                  </button>
                  {/* Refined Markdown Preview */}
                  {refinedMarkdown && (
                    <div className="p-4 max-w-none text-white whitespace-pre-wrap dark:prose prose prose-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Refined Markdown
                        </h3>
                        <button
                          onClick={() => copyToClipboard(refinedMarkdown)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white transition"
                        >
                          <Copy size={16} />
                          Copy Refined
                        </button>
                      </div>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="font-bold text-gray-900 dark:text-white text-3xl">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="font-semibold text-gray-900 dark:text-white text-2xl">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                              {children}
                            </h3>
                          ),
                          li: ({ children }) => (
                            <li className="ml-4 text-gray-800 dark:text-gray-200 list-disc">
                              {children}
                            </li>
                          ),
                        }}
                      >
                        {refinedMarkdown}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { MDPreview };
