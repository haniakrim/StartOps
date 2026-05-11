import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppShell from "@/components/AppShell";
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
      staleTime: 1000 * 60 * 5, // 5 minutes
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function LazyProtected({ element: Element }: { element: React.ComponentType }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageSpinner />}>
        <Element />
      </Suspense>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/today" element={<LazyProtected element={Today} />} />
              <Route path="/contacts" element={<LazyProtected element={Contacts} />} />
              <Route path="/companies" element={<LazyProtected element={Companies} />} />
              <Route path="/deals" element={<LazyProtected element={Deals} />} />
              <Route path="/organization" element={<LazyProtected element={Organization} />} />
              <Route path="/security" element={<LazyProtected element={Security} />} />
              <Route path="/analytics" element={<LazyProtected element={Analytics} />} />
              <Route path="/reports" element={<LazyProtected element={Reports} />} />
              <Route path="/goals" element={<LazyProtected element={Goals} />} />
              <Route path="/notifications" element={<LazyProtected element={Notifications} />} />
              <Route path="/api" element={<LazyProtected element={Api} />} />
              <Route path="/ai-api-settings" element={<LazyProtected element={AIApiSettings} />} />
              <Route path="/audit" element={<LazyProtected element={Audit} />} />
              <Route path="/support" element={<LazyProtected element={Support} />} />
              <Route path="/activities" element={<LazyProtected element={Activities} />} />
              <Route path="/profile" element={<LazyProtected element={Profile} />} />
              <Route path="/settings" element={<LazyProtected element={Settings} />} />
              <Route path="/assistant" element={<LazyProtected element={Assistant} />} />
              <Route path="/finance" element={<LazyProtected element={Finance} />} />
              <Route path="/inventory" element={<LazyProtected element={Inventory} />} />
              <Route path="/projects" element={<LazyProtected element={Projects} />} />
              <Route path="/employees" element={<LazyProtected element={Employees} />} />
              <Route path="/workflows" element={<LazyProtected element={Workflows} />} />
              <Route path="/custom-fields" element={<LazyProtected element={CustomFields} />} />
              <Route path="/communications" element={<LazyProtected element={Communications} />} />
              <Route path="/calendar" element={<LazyProtected element={Calendar} />} />
              <Route path="/forecasts" element={<LazyProtected element={Forecasts} />} />
              <Route path="/timesheets" element={<LazyProtected element={Timesheets} />} />
              <Route path="/quotes" element={<LazyProtected element={Quotes} />} />
              <Route path="/email-templates" element={<LazyProtected element={EmailTemplates} />} />
              <Route path="/documents" element={<LazyProtected element={Documents} />} />
              <Route path="/subscriptions" element={<LazyProtected element={Subscriptions} />} />
              <Route path="/campaigns" element={<LazyProtected element={Campaigns} />} />
              <Route path="/staff-directory" element={<LazyProtected element={StaffDirectory} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;