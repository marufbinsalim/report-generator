export interface Report {
  id: string;
  title?: string;
  content: string;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportStorage {
  reports: Report[];
  activeReportId?: string;
}
