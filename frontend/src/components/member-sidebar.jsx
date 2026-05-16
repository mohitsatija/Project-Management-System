import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  IconDashboard,
  IconChecklist,
  IconLogout,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function MemberSidebar({ ...props }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: IconDashboard,
      onClick: () => handleNavigation("/member/dashboard")
    },
    {
      title: "My Tasks", 
      icon: IconChecklist,
      onClick: () => handleNavigation("/member/tasks")
    },
    {
      title: "Logout",
      icon: IconLogout,
      onClick: handleLogout
    }
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-14">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-base">
                  ProjectHub
                </span>
                <span className="truncate text-xs">Member Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-6">
        <SidebarMenu className="space-y-3">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                onClick={item.onClick}
                size="lg"
                className="h-12 text-base font-medium hover:bg-sidebar-accent/80 transition-colors"
              >
                <item.icon className="size-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{
          name: user?.name || "Member",
          email: user?.email || "member@example.com",
          avatar: user?.profileImageUrl || "/default-avatar.png"
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
