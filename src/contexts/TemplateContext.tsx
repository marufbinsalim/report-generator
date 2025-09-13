import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Template } from "../types/template";
import { getActiveTemplate } from "../utils/templateStorage";

interface TemplateContextType {
  activeTemplate: Template | null;
  setActiveTemplate: (template: Template) => void;
  refreshTemplate: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(
  undefined
);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [activeTemplate, setActiveTemplateState] = useState<Template | null>(
    null
  );

  useEffect(() => {
    refreshTemplate();
  }, []);

  const setActiveTemplate = (template: Template) => {
    setActiveTemplateState(template);
  };

  const refreshTemplate = () => {
    const template = getActiveTemplate();
    setActiveTemplateState(template);
  };

  return (
    <TemplateContext.Provider
      value={{ activeTemplate, setActiveTemplate, refreshTemplate }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}
