import { Template, TemplateStorage } from "../types/template";
import { Report, ReportStorage } from "../types/report";
import { Editor, Transforms } from "slate";
import { CustomElementType } from "../assets/editorTypes";

const STORAGE_KEY = "report-generator-templates";

const DEFAULT_TEMPLATE: Template = {
  id: "default",
  name: "Default Template",
  description: "Standard development task template",
  taskTypes: [
    { name: "FEATURE", icon: "Zap", color: "blue" },
    { name: "DESIGN", icon: "Pencil", color: "purple" },
    { name: "BUG_FIX", icon: "AlertCircle", color: "red" },
    { name: "REFACTOR", icon: "Zap", color: "yellow" },
    { name: "TEST", icon: "CheckCircle", color: "green" },
    { name: "DOCUMENTATION", icon: "Pencil", color: "blue" },
    { name: "RESEARCH", icon: "Zap", color: "purple" },
    { name: "MAINTENANCE", icon: "Zap", color: "yellow" },
    { name: "DEPLOYMENT", icon: "Zap", color: "green" },
  ],
  statuses: [
    { name: "TODO", color: "blue" },
    { name: "IN_PROGRESS", color: "yellow" },
    { name: "UNDER_REVIEW", color: "purple" },
    { name: "DONE", color: "green" },
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
  if (templateId === "default") {
    console.error("Cannot delete the default template");
    return;
  }
  const storage = getStoredTemplates();
  storage.templates = storage.templates.filter((t) => t.id !== templateId);

  // If deleting active template, switch to default
  if (storage.activeTemplateId === templateId) {
    storage.activeTemplateId = "default";
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

  // Cascade delete reports using this template
  const reportStorage = getStoredReports();
  reportStorage.reports = reportStorage.reports.filter(
    (r) => r.templateId !== templateId
  );

  // If active report was using this template, clear active
  if (reportStorage.activeReportId) {
    const activeReportExists = reportStorage.reports.some(
      (r) => r.id === reportStorage.activeReportId
    );
    if (!activeReportExists) {
      reportStorage.activeReportId = undefined;
    }
  }

  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reportStorage));
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

const REPORT_STORAGE_KEY = "report-generator-reports";

export function getStoredReports(): ReportStorage {
  try {
    const stored = localStorage.getItem(REPORT_STORAGE_KEY);
    if (!stored) {
      const initialStorage: ReportStorage = { reports: [] };
      localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(initialStorage));
      return initialStorage;
    }
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    parsed.reports = parsed.reports.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    }));
    return parsed;
  } catch (error) {
    console.error("Error loading reports:", error);
    return { reports: [] };
  }
}

export function saveReport(report: Report): void {
  const storage = getStoredReports();
  const existingIndex = storage.reports.findIndex((r) => r.id === report.id);

  if (existingIndex >= 0) {
    storage.reports[existingIndex] = { ...report, updatedAt: new Date() };
  } else {
    storage.reports.push(report);
  }

  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(storage));
}

export function deleteReport(reportId: string): void {
  const storage = getStoredReports();
  storage.reports = storage.reports.filter((r) => r.id !== reportId);

  // If deleting active report, clear active
  if (storage.activeReportId === reportId) {
    storage.activeReportId = undefined;
  }

  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(storage));
}

export function setActiveReport(reportId: string): void {
  const storage = getStoredReports();
  storage.activeReportId = reportId;
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(storage));
}

export function getActiveReport(): Report | null {
  const storage = getStoredReports();
  return storage.reports.find((r) => r.id === storage.activeReportId) || null;
}

export function saveCurrentReport(
  editor: Editor,
  templateId: string,
  title?: string
): string {
  const userTitle = title || `Report - ${new Date().toLocaleDateString()}`;
  const report: Report = {
    id: `report-${Date.now()}`,
    title: userTitle,
    content: JSON.stringify(editor.children),
    templateId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  saveReport(report);
  return report.id;
}

export function getReportContent(reportId: string): CustomElementType[] | null {
  const storage = getStoredReports();
  const report = storage.reports.find((r) => r.id === reportId);
  if (!report) return null;
  return JSON.parse(report.content) as CustomElementType[];
}

export function loadReportToEditor(editor: Editor, reportId: string): boolean {
  const content = getReportContent(reportId);
  if (!content) return false;
  editor.children = content;
  Transforms.select(editor, Editor.end(editor, []));
  setActiveReport(reportId);
  return true;
}
