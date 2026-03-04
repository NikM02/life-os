import React, { ReactNode, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Moon, Sun, Download } from 'lucide-react';
import { exportAllDataToCSV } from '@/lib/export-utils';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useLocalStorage('lifeos-dark', true);

  const { vision } = useData();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);



  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background selection:bg-primary/20 selection:text-primary">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between border-b border-solid border-border/40 px-6 bg-background/60 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all rounded-xl" />
              <div className="h-4 w-px bg-border/40 hidden sm:block" />
              <div className="hidden sm:block text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Workspace</div>
            </div>

            <div className="flex items-center gap-3">


              <button
                onClick={exportAllDataToCSV}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-border/40 hover:border-border"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>

              <div className="w-px h-4 bg-border/40 mx-1" />

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-none hover:border-border/40"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full overflow-auto">
            {children}
          </main>
        </div>
      </div>

    </SidebarProvider>
  );
}
