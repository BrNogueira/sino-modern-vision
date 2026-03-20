import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "corretor";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  userName: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Mock credentials — protótipo sem backend
const MOCK_USERS = [
  { email: "admin@sinosimoveis.com.br", password: "admin123", role: "admin" as UserRole, name: "Administrador" },
  { email: "corretor@sinosimoveis.com.br", password: "corretor123", role: "corretor" as UserRole, name: "Carlos Silva" },
];

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const login = useCallback((email: string, password: string) => {
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      setIsAuthenticated(true);
      setRole(user.role);
      setUserName(user.name);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    setUserName(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, role, userName, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
