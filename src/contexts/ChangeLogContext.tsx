import React, { createContext, useContext, useState, useCallback } from "react";
import { logSystem } from "@/lib/systemLog";

export interface ChangeLogEntry {
  id: string;
  propertyCode: string;
  propertyTitle: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  role: "admin" | "corretor";
  timestamp: string;
}

interface ChangeLogContextType {
  logs: ChangeLogEntry[];
  addLog: (entry: Omit<ChangeLogEntry, "id" | "timestamp">) => void;
  getLogsByProperty: (propertyCode: string) => ChangeLogEntry[];
}

const ChangeLogContext = createContext<ChangeLogContextType | null>(null);

export const ChangeLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);

  const addLog = useCallback((entry: Omit<ChangeLogEntry, "id" | "timestamp">) => {
    const newEntry: ChangeLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newEntry, ...prev]);
    // Persiste na trilha de auditoria (alimenta notificações e /admin/logs).
    logSystem({
      tipo: "imovel",
      acao: "alterado",
      entidade: `${entry.propertyCode} — ${entry.propertyTitle}`,
      entidade_id: entry.propertyCode,
      descricao: `${entry.changedBy} alterou "${entry.field}" do imóvel ${entry.propertyCode}`,
      usuario: entry.changedBy,
      role: entry.role,
      dados: { field: entry.field, oldValue: entry.oldValue, newValue: entry.newValue },
    });
  }, []);

  const getLogsByProperty = useCallback(
    (propertyCode: string) => logs.filter((l) => l.propertyCode === propertyCode),
    [logs]
  );

  return (
    <ChangeLogContext.Provider value={{ logs, addLog, getLogsByProperty }}>
      {children}
    </ChangeLogContext.Provider>
  );
};

export const useChangeLog = () => {
  const ctx = useContext(ChangeLogContext);
  if (!ctx) throw new Error("useChangeLog must be used within ChangeLogProvider");
  return ctx;
};
