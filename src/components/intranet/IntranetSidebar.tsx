import { LayoutDashboard, FileText, CheckSquare, FolderKanban, LogOut, Building2, Star, LifeBuoy, TrendingUp, Globe, GitBranch } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/intranet", icon: LayoutDashboard },
  { title: "Operators", url: "/intranet/operators", icon: Building2 },
  { title: "Reviews", url: "/intranet/reviews", icon: Star },
  { title: "Support", url: "/intranet/support", icon: LifeBuoy },
  { title: "Discoverability", url: "/intranet/discoverability", icon: TrendingUp },
  { title: "Lifecycle", url: "/intranet/lifecycle", icon: GitBranch },
  { title: "DNS Status", url: "/intranet/dns", icon: Globe },
  { title: "Documents", url: "/intranet/documents", icon: FileText },
  { title: "Tasks", url: "/intranet/tasks", icon: CheckSquare },
  { title: "Projects", url: "/intranet/projects", icon: FolderKanban },
];

export function IntranetSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/intranet"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
