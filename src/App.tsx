import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import Deals from "@/pages/Deals";
import Team from "@/pages/Team";
import Security from "@/pages/Security";
import Integrations from "@/pages/Integrations";
import Audit from "@/pages/Audit";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/contacts"
            element={
              <AppLayout>
                <Contacts />
              </AppLayout>
            }
          />
          <Route
            path="/deals"
            element={
              <AppLayout>
                <Deals />
              </AppLayout>
            }
          />
          <Route
            path="/team"
            element={
              <AppLayout>
                <Team />
              </AppLayout>
            }
          />
          <Route
            path="/security"
            element={
              <AppLayout>
                <Security />
              </AppLayout>
            }
          />
          <Route
            path="/integrations"
            element={
              <AppLayout>
                <Integrations />
              </AppLayout>
            }
          />
          <Route
            path="/audit"
            element={
              <AppLayout>
                <Audit />
              </AppLayout>
            }
          />
          <Route
            path="/support"
            element={
              <AppLayout>
                <Support />
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
