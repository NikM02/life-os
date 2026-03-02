import React, { ReactNode, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Moon, Sun, Download, Cloud, LogIn } from 'lucide-react';
import { exportAllDataToCSV } from '@/lib/export-utils';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SupabaseAuth from '@/components/SupabaseAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useLocalStorage('lifeos-dark', true);

  const { user, pushAllToCloud } = useData();
  const [syncing, setSyncing] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    await pushAllToCloud();
    setSyncing(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background selection:bg-primary/20 selection:text-primary">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between border-b border-border/40 px-6 bg-background/60 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all rounded-xl" />
              <div className="h-4 w-px bg-border/40 hidden sm:block" />
              <div className="hidden sm:block text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Workspace</div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                    syncing
                      ? "bg-primary/10 text-primary border-primary/20 animate-pulse"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80 border-border/40 hover:border-border"
                  )}
                >
                  <Cloud className={cn("h-3.5 w-3.5", syncing && "animate-bounce")} />
                  <span>{syncing ? 'Syncing...' : 'Sync'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-bold text-primary hover:bg-primary/5 transition-all border border-primary/20 hover:border-primary/40"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Connect Cloud</span>
                </button>
              )}

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
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-transparent hover:border-border/40"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full overflow-auto">
            {children}
          </main>
        </div>
      </div>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="p-0 border-none bg-transparent max-w-xl">
          <SupabaseAuth />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
