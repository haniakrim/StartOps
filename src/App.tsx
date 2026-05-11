import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppShell from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { prefetchRoutes } from "@/lib/prefetchRoutes";

// Eager-load critical routes — these render instantly with no network request
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import Activities from "./pages/Activities";

// Lazy-load infrequently used routes
const Organization = lazy(() => import("./pages/Organization"));
const Security = lazy(() => import("./pages/Security"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const Goals = lazy(() => import("./pages/Goals"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Api = lazy(() => import("./pages/Api"));
const AIApiSettings = lazy(() => import("./pages/AIApiSettings"));
const Audit = lazy(() => import("./pages/Audit"));
const Support = lazy(() => import("./pages/Support"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Assistant = lazy(() => import("./pages/Assistant"));
const Finance = lazy(() => import("./pages/Finance"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Projects = lazy(() => import("./pages/Projects"));
const Employees = lazy(() => import("./pages/Employees"));
const Workflows = lazy(() => import("./pages/Workflows"));
const CustomFields = lazy(() => import("./pages/CustomFields"));
const Communications = lazy(() => import("./pages/Communications"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Forecasts = lazy(() => import("./pages/Forecasts"));
const Timesheets = lazy(() => import("./pages/Timesheets"));
const Quotes = lazy(() => import("./pages/Quotes"));
const EmailTemplates = lazy(() => import("./pages/EmailTemplates"));
const Documents = lazy(() => import("./pages/Documents"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const StaffDirectory = lazy(() => import("./pages/StaffDirectory"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ContentSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Suspense fallback={<ContentSpinner />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                  </Route>
                  <Route element={<ProtectedLayout />}>
                    {/* Eager routes — instant navigation */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/today" element={<Today />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/activities" element={<Activities />} />
                    {/* Lazy routes — loaded on demand, prefetched on hover */}
                    <Route path="/organization" element={<Organization />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/api" element={<Api />} />
                    <Route path="/ai-api-settings" element={<AIApiSettings />} />
                    <Route path="/audit" element={<Audit />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/assistant" element={<Assistant />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/custom-fields" element={<CustomFields />} />
                    <Route path="/communications" element={<Communications />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/forecasts" element={<Forecasts />} />
                    <Route path="/timesheets" element={<Timesheets />} />
                    <Route path="/quotes" element={<Quotes />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/staff-directory" element={<StaffDirectory />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
