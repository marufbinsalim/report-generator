import { Template, TemplateStorage } from "../types/template";

const STORAGE_KEY = "report-generator-templates";

const DEFAULT_TEMPLATE: Template = {
  id: "default",
  name: "Default Template",
  description: "Standard development task template",
  taskTypes: [
    { name: "FEATURE", icon: "Zap", color: "text-gray-300" },
    { name: "DESIGN", icon: "Pencil", color: "text-gray-300" },
    { name: "BUG_FIX", icon: "AlertCircle", color: "text-red-500" },
    { name: "REFACTOR", icon: "Zap", color: "text-purple-500" },
    { name: "TEST", icon: "CheckCircle", color: "text-green-500" },
    { name: "DOCUMENTATION", icon: "Pencil", color: "text-gray-300" },
    { name: "RESEARCH", icon: "Zap", color: "text-blue-500" },
    { name: "MAINTENANCE", icon: "Zap", color: "text-yellow-500" },
    { name: "DEPLOYMENT", icon: "Zap", color: "text-pink-500" },
  ],
  statuses: [
    { name: "TODO", color: "bg-gray-800 text-gray-200" },
    { name: "IN_PROGRESS", color: "bg-blue-900 text-blue-200" },
    { name: "UNDER_REVIEW", color: "bg-yellow-900 text-yellow-200" },
    { name: "DONE", color: "bg-green-900 text-green-200" },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function getStoredTemplates(): TemplateStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const initialStorage: TemplateStorage = {
        templates: [DEFAULT_TEMPLATE],
        activeTemplateId: DEFAULT_TEMPLATE.id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStorage));
      return initialStorage;
    }
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    parsed.templates = parsed.templates.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
    return parsed;
  } catch (error) {
    console.error("Error loading templates:", error);
    return {
      templates: [DEFAULT_TEMPLATE],
      activeTemplateId: DEFAULT_TEMPLATE.id,
    };
  }
}

export function saveTemplate(template: Template): void {
  const storage = getStoredTemplates();
  const existingIndex = storage.templates.findIndex(
    (t) => t.id === template.id
  );

  if (existingIndex >= 0) {
    storage.templates[existingIndex] = { ...template, updatedAt: new Date() };
  } else {
    storage.templates.push(template);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function deleteTemplate(templateId: string): void {
  const storage = getStoredTemplates();
  storage.templates = storage.templates.filter((t) => t.id !== templateId);

  // If deleting active template, switch to default
  if (storage.activeTemplateId === templateId) {
    storage.activeTemplateId = storage.templates[0]?.id || null;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function setActiveTemplate(templateId: string): void {
  const storage = getStoredTemplates();
  storage.activeTemplateId = templateId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function getActiveTemplate(): Template | null {
  const storage = getStoredTemplates();
  return (
    storage.templates.find((t) => t.id === storage.activeTemplateId) || null
  );
}
