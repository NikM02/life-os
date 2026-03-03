import {
  Sparkles, LayoutDashboard, Target, Clock, Heart, BarChart3, Eye, ListChecks, Wallet, Layers, Clapperboard, BookOpen, LogOut, LogIn, ShieldAlert,
  CalendarCheck, Timer, BrainCircuit
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useData } from '@/contexts/DataContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const navItems = [
  { title: 'Affirmations', url: '/', icon: Sparkles },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Vision', url: '/vision', icon: Eye },
  { title: 'Objectives', url: '/goals', icon: Target },
  { title: 'Task Board', url: '/execution', icon: Layers },
  { title: 'Journals', url: '/neural-journals', icon: BrainCircuit },
  { title: 'Pipeline', url: '/content', icon: Clapperboard },
  { title: 'Biologicals', url: '/habits', icon: Heart },
  { title: 'Terminal', url: '/finance', icon: Wallet },
  { title: 'Library', url: '/library', icon: BookOpen },
];

export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-border/10 bg-sidebar-background transition-all duration-300">
      <div className="p-8 pb-10">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <h1 className="text-lg font-black tracking-tighter text-foreground group-hover:opacity-60 transition-opacity flex flex-col uppercase italic">
            NOS
          </h1>
        </Link>
      </div>
      <SidebarContent className="px-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground/20 px-2 mb-6">
            Core Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-transparent px-2">
                    <NavLink to={item.url} className="flex items-center gap-3 w-full group py-1.5 opacity-40 hover:opacity-100 transition-all">
                      <item.icon size={16} className="group-[.active]:text-primary" strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none group-[.active]:text-primary">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
