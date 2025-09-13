export interface TaskTypeDefinition {
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
}

export interface StatusDefinition {
  name: string;
  color: string; // Tailwind color class
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  taskTypes: TaskTypeDefinition[];
  statuses: StatusDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateStorage {
  templates: Template[];
  activeTemplateId: string | null;
}
