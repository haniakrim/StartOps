import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import Organization from "./pages/Organization";
import Security from "./pages/Security";
import Analytics from "./pages/Analytics";
import Api from "./pages/Api";
import Audit from "./pages/Audit";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <AppShell>
                <Dashboard />
              </AppShell>
            }
          />
          <Route
            path="/contacts"
            element={
              <AppShell>
                <Contacts />
              </AppShell>
            }
          />
          <Route
            path="/companies"
            element={
              <AppShell>
                <Companies />
              </AppShell>
            }
          />
          <Route
            path="/deals"
            element={
              <AppShell>
                <Deals />
              </AppShell>
            }
          />
          <Route
            path="/organization"
            element={
              <AppShell>
                <Organization />
              </AppShell>
            }
          />
          <Route
            path="/security"
            element={
              <AppShell>
                <Security />
              </AppShell>
            }
          />
          <Route
            path="/analytics"
            element={
              <AppShell>
                <Analytics />
              </AppShell>
            }
          />
          <Route
            path="/api"
            element={
              <AppShell>
                <Api />
              </AppShell>
            }
          />
          <Route
            path="/audit"
            element={
              <AppShell>
                <Audit />
              </AppShell>
            }
          />
          <Route
            path="/support"
            element={
              <AppShell>
                <Support />
              </AppShell>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;