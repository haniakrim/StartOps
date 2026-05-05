import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import Companies from "@/pages/Companies";
import Deals from "@/pages/Deals";
import Organization from "@/pages/Organization";
import Security from "@/pages/Security";
import Analytics from "@/pages/Analytics";
import ApiWebhooks from "@/pages/ApiWebhooks";
import Audit from "@/pages/Audit";
import Support from "@/pages/Support";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/organization" element={<Organization />} />
            <Route path="/security" element={<Security />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/api" element={<ApiWebhooks />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
