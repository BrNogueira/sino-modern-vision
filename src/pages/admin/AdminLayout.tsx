import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <AdminHeader onOpenPalette={() => setPaletteOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
        <AdminCommandPalette />
        {/* Trigger from header — palette listens for ⌘K globally; manual open through state not strictly needed */}
        {paletteOpen && <span className="hidden">{void 0}</span>}
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
