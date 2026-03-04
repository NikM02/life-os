import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DataProvider } from "@/contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import Vision from "./pages/Vision";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Library from "./pages/Library";
import Finance from "./pages/Finance";
import Execution from "./pages/Execution";
import ContentPipeline from "./pages/ContentPipeline";
import NotFound from "./pages/NotFound";

import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem("splashShown") !== "true";
  });

  const handleSplashSuccess = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onSuccess={handleSplashSuccess} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/execution" element={<Execution />} />
          <Route path="/content" element={<ContentPipeline />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/library" element={<Library />} />
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
