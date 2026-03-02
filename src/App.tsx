import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DataProvider } from "@/contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import Affirmations from "./pages/Affirmations";
import Vision from "./pages/Vision";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Library from "./pages/Library";
import Finance from "./pages/Finance";
import Execution from "./pages/Execution";
import ContentPipeline from "./pages/ContentPipeline";
import DailyReflections from "./pages/DailyReflections";
import NotFound from "./pages/NotFound";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SplashScreen } from "@/components/SplashScreen";

const queryClient = new QueryClient();

const AppContent = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem("splashShown") !== "true";
  });

  const handleSplashSuccess = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-2 w-48 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress-loading" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Initializing Systems</span>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onSuccess={handleSplashSuccess} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Affirmations />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/execution" element={<Execution />} />
          <Route path="/content" element={<ContentPipeline />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/library" element={<Library />} />
          <Route path="/neural-journals" element={<DailyReflections />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <AppContent />
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
