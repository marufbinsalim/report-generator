import { useSlate } from "slate-react";
import { parseTasksToMarkdown } from "../utils/editor/parser";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { toast } from "react-hot-toast";

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
        toast.error(
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
                    text: `
                        You are a markdown refinement engine. 
                        Your only task is to take input markdown and refine it based on the user prompt.  

                        ### Rules:
                        - Always return **only valid markdown**.  
                        - Never include explanations, metadata, or commentary.  
                        - If the user’s request is irrelevant to markdown generation, reply with exactly:  

                        \`\`\`md
                        > Request irrelevant to markdown generation.
                        \`\`\`

                        ### Input:
                        Markdown to refine:
                        ${markdown}

                        Refinement prompt:
                        ${prompt}
              `,
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
      toast.error("Failed to refine markdown. Please try again.");
      setRefinedMarkdown("");
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard.");
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
            className="flex flex-col bg-[var(--color-bg-gray)] shadow-lg p-6 rounded-lg w-[90vw] max-w-3xl max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-[var(--color-text-default)] text-lg">
                  Markdown Preview
                </h2>
                <button
                  onClick={onToggle}
                  className="flex justify-center items-center bg-[var(--color-bg-error)] hover:bg-[var(--color-bg-error)]/[0.8] p-2 rounded text-[var(--color-text-default)] transition"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex border border-[var(--color-border-default)] border-b">
                <button
                  onClick={() => setActiveTab("normal")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "normal"
                      ? "border-b-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "ai"
                      ? "border-b-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
                  }`}
                >
                  AI Refine
                </button>
              </div>
              {/* Normal Tab Copy Button */}
              {activeTab === "normal" && (
                <button
                  onClick={() => copyToClipboard(markdown)}
                  className="flex items-center self-end gap-1 bg-[var(--color-bg-success)] hover:bg-[var(--color-bg-success)]/[0.8] px-3 py-1 rounded text-[var(--color-text-default)] transition"
                >
                  <Copy size={16} />
                  Copy Normal
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === "normal" ? (
                <div className="p-4 max-w-none text-[var(--color-text-default)] whitespace-pre-wrap prose prose-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-bold text-[var(--color-text-default)] text-3xl">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-semibold text-[var(--color-text-default)] text-2xl">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-semibold text-[var(--color-text-default)] text-xl">
                          {children}
                        </h3>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 text-[var(--color-text-gray)] list-disc">
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
                    <label className="block mb-2 font-medium text-[var(--color-text-gray)] text-sm">
                      Refinement Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe how you want to refine this markdown (e.g., 'Make it more concise', 'Add bullet points', 'Improve structure')..."
                      className="bg-[var(--color-bg-default)] p-3 border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-[var(--color-text-primary)] focus:ring-2 w-full text-[var(--color-text-default)]"
                      rows={3}
                    />
                  </div>
                  {/* Refine Button */}
                  <button
                    onClick={refineMarkdown}
                    disabled={!prompt.trim() || isRefining}
                    className="flex items-center gap-2 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-primary)]/[0.8] disabled:bg-[var(--color-bg-gray)] px-4 py-2 rounded-md text-[var(--color-text-default)] transition"
                  >
                    {isRefining ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <span>Refine with AI</span>
                    )}
                  </button>
                  {/* Refined Markdown Preview */}
                  {refinedMarkdown && (
                    <div className="p-4 max-w-none text-[var(--color-text-default)] whitespace-pre-wrap prose prose-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-[var(--color-text-default)]">
                          Refined Markdown
                        </h3>
                        <button
                          onClick={() => copyToClipboard(refinedMarkdown)}
                          className="flex items-center gap-1 bg-[var(--color-bg-success)] hover:bg-[var(--color-bg-success)]/[0.8] px-3 py-1 rounded text-[var(--color-text-default)] transition"
                        >
                          <Copy size={16} />
                          Copy Refined
                        </button>
                      </div>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="font-bold text-[var(--color-text-default)] text-3xl">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="font-semibold text-[var(--color-text-default)] text-2xl">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="font-semibold text-[var(--color-text-default)] text-xl">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="ml-6 text-[var(--color-text-gray)] list-disc">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="ml-6 text-[var(--color-text-gray)] list-decimal">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="my-1">{children}</li>
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
