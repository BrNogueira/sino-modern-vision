import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "corretor" | "financeiro" | "gerente";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  creci: string;
  avatar_url: string;
  active: boolean;
}

interface RolePermission {
  module: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  permissions: RolePermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  canAccess: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase.rpc("get_user_roles", { _user_id: userId });
    const userRoles = (data as AppRole[]) || [];
    setRoles(userRoles);
    return userRoles;
  }, []);

  const fetchPermissions = useCallback(async (userRoles: AppRole[]) => {
    if (userRoles.length === 0) {
      setPermissions([]);
      return;
    }
    const { data } = await supabase
      .from("role_permissions")
      .select("module, can_view, can_edit, can_delete")
      .in("role", userRoles);
    
    // Merge permissions across roles (most permissive wins)
    const merged = new Map<string, RolePermission>();
    (data || []).forEach((p: any) => {
      const existing = merged.get(p.module);
      if (existing) {
        existing.can_view = existing.can_view || p.can_view;
        existing.can_edit = existing.can_edit || p.can_edit;
        existing.can_delete = existing.can_delete || p.can_delete;
      } else {
        merged.set(p.module, { module: p.module, can_view: p.can_view, can_edit: p.can_edit, can_delete: p.can_delete });
      }
    });
    setPermissions(Array.from(merged.values()));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
      const userRoles = await fetchRoles(user.id);
      await fetchPermissions(userRoles);
    }
  }, [user, fetchProfile, fetchRoles, fetchPermissions]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      
      if (sess?.user) {
        setTimeout(async () => {
          await fetchProfile(sess.user.id);
          const userRoles = await fetchRoles(sess.user.id);
          await fetchPermissions(userRoles);
          setIsLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
        setPermissions([]);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess) setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRoles, fetchPermissions]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
  const canAccess = useCallback((module: string) => permissions.some(p => p.module === module && p.can_view), [permissions]);
  const canEdit = useCallback((module: string) => permissions.some(p => p.module === module && p.can_edit), [permissions]);
  const canDelete = useCallback((module: string) => permissions.some(p => p.module === module && p.can_delete), [permissions]);

  return (
    <AdminAuthContext.Provider value={{
      user, session, profile, roles, permissions,
      isAuthenticated: !!session,
      isLoading,
      login, register, logout,
      hasRole, canAccess, canEdit, canDelete,
      refreshProfile,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
