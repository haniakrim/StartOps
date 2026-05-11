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
import { LazyRouteDisplay } from "@/components/LazyRouteDisplay";

const Dashboard = LazyRouteDisplay(() => import("./pages/Dashboard"));
const Today = LazyRouteDisplay(() => import("./pages/Today"));
const Contacts = LazyRouteDisplay(() => import("./pages/Contacts"));
const Companies = LazyRouteDisplay(() => import("./pages/Companies"));
const Deals = LazyRouteDisplay(() => import("./pages/Deals"));
const Organization = LazyRouteDisplay(() => import("./pages/Organization"));
const Security = LazyRouteDisplay(() => import("./pages/Security"));
const Analytics = LazyRouteDisplay(() => import("./pages/Analytics"));
const Reports = LazyRouteDisplay(() => import("./pages/Reports"));
const Goals = LazyRouteDisplay(() => import("./pages/Goals"));
const Notifications = LazyRouteDisplay(() => import("./pages/Notifications"));
const Api = LazyRouteDisplay(() => import("./pages/Api"));
const AIApiSettings = LazyRouteDisplay(() => import("./pages/AIApiSettings"));
const Audit = LazyRouteDisplay(() => import("./pages/Audit"));
const Support = LazyRouteDisplay(() => import("./pages/Support"));
const Activities = LazyRouteDisplay(() => import("./pages/Activities"));
const Profile = LazyRouteDisplay(() => import("./pages/Profile"));
const Settings = LazyRouteDisplay(() => import("./pages/Settings"));
const Assistant = LazyRouteDisplay(() => import("./pages/Assistant"));
const Finance = LazyRouteDisplay(() => import("./pages/Finance"));
const Inventory = LazyRouteDisplay(() => import("./pages/Inventory"));
const Projects = LazyRouteDisplay(() => import("./pages/Projects"));
const Employees = LazyRouteDisplay(() => import("./pages/Employees"));
const Workflows = LazyRouteDisplay(() => import("./pages/Workflows"));
const CustomFields = LazyRouteDisplay(() => import("./pages/CustomFields"));
const Communications = LazyRouteDisplay(() => import("./pages/Communications"));
const Calendar = LazyRouteDisplay(() => import("./pages/Calendar"));
const Forecasts = LazyRouteDisplay(() => import("./pages/Forecasts"));
const Timesheets = LazyRouteDisplay(() => import("./pages/Timesheets"));
const Quotes = LazyRouteDisplay(() => import("./pages/Quotes"));
const EmailTemplates = LazyRouteDisplay(() => import("./pages/EmailTemplates"));
const Documents = LazyRouteDisplay(() => import("./pages/Documents"));
const Subscriptions = LazyRouteDisplay(() => import("./pages/Subscriptions"));
const Campaigns = LazyRouteDisplay(() => import("./pages/Campaigns"));
const StaffDirectory = LazyRouteDisplay(() => import("./pages/StaffDirectory"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PageSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Suspense fallback={<PageSpinner />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
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
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/today" element={<Today />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/deals" element={<Deals />} />
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
                  <Route path="/activities" element={<Activities />} />
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
