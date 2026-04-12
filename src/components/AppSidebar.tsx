import {
  Activity, Wallet, Clapperboard, BookOpen, Eye
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const navItems = [
  { title: 'Mission', url: '/mission', icon: Eye },
  { title: 'Youtube', url: '/youtube', icon: Clapperboard },
  { title: 'Habits', url: '/habits', icon: Activity },
  { title: 'Finance', url: '/finance', icon: Wallet },
  { title: 'Library', url: '/library', icon: BookOpen },
];


export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="hidden md:flex border-r border-border/40 bg-background/50 backdrop-blur-xl transition-all duration-300">
      <div className="p-8 pb-10">
        <Link to="/mission" className="flex items-center gap-4 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-xs">N</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground transition-all">NOS</span>
        </Link>
      </div>
      <SidebarContent className="px-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/30 px-2 mb-6">
            System Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="hover:bg-transparent px-0 h-auto">
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all duration-300 group",
                          isActive
                            ? "bg-secondary text-primary shadow-sm"
                            : "text-muted-foreground/60 hover:text-primary hover:bg-secondary/50"
                        )}
                      >
                        <item.icon
                          size={18}
                          className={cn(
                            "transition-transform duration-300 group-hover:scale-110",
                            isActive ? "text-primary" : "text-muted-foreground/30 group-hover:text-primary"
                          )}
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        <span className="text-[13px] font-medium tracking-tight leading-none transition-colors">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
