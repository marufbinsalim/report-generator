import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Report } from "../types/report";
import {
  getStoredReports,
  setActiveReport as setStoredActiveReport,
} from "../utils/templateStorage";

interface ReportContextType {
  activeReport: Report | null;
  setActiveReport: (reportId: string) => void;
  refreshReports: () => void;
  reports: Report[];
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [activeReport, setActiveReportState] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    refreshReports();
  }, []);

  const setActiveReport = (reportId: string) => {
    setActiveReportState(
      getStoredReports().reports.find((r) => r.id === reportId) || null
    );
    setStoredActiveReport(reportId);
  };

  const refreshReports = () => {
    const stored = getStoredReports();
    setReports(stored.reports);
    const active = stored.activeReportId
      ? stored.reports.find((r) => r.id === stored.activeReportId) || null
      : null;
    setActiveReportState(active);
  };

  return (
    <ReportContext.Provider
      value={{ activeReport, setActiveReport, refreshReports, reports }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
}
