import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { IntranetSidebar } from "@/components/intranet/IntranetSidebar";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

const IntranetLayout = () => {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin onAuthenticated={() => window.location.reload()} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <IntranetSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-3 bg-background">
            <SidebarTrigger />
            <span className="font-label text-xs tracking-widest uppercase text-muted-foreground">
              Fichua Intranet
            </span>
            <div className="ml-auto text-xs text-muted-foreground">
              {user.email}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default IntranetLayout;
