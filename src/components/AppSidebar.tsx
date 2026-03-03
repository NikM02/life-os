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
  { title: 'Focus Track', url: '/goals', icon: Target },
  { title: 'Daily Execution', url: '/execution', icon: Layers },
  { title: 'Neural Journals', url: '/neural-journals', icon: BrainCircuit },
  { title: 'Content Pipeline', url: '/content', icon: Clapperboard },
  { title: 'Habits & Health', url: '/habits', icon: Heart },
  { title: 'Finance Tracker', url: '/finance', icon: Wallet },
  { title: 'Knowledge Library', url: '/library', icon: BookOpen },
];

export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-border bg-sidebar-background transition-all duration-300">
      <div className="p-6 pb-4">
        <Link to="/dashboard" className="flex items-center gap-4 mb-2 group">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all overflow-hidden text-primary font-black text-xl">
            N
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground group-hover:opacity-80 transition-opacity flex flex-col">
            N-OS
            <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">Intelligence.</span>
          </h1>
        </Link>
      </div>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 px-4 mb-2">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 hover:text-foreground hover:bg-secondary/30 transition-all group"
                      activeClassName="bg-primary/5 text-primary shadow-none"
                    >
                      <item.icon className="h-3.5 w-3.5 transition-transform group-hover:scale-105" />
                      <span>{item.title}</span>
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
