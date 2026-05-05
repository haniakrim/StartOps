import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ArrowRight, Shield, Zap, Users, BarChart3, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6452db] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#6452db] flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          StartOps
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-8">
          The modern CRM for startups. Manage contacts, track deals, and grow your business — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => navigate("/login")}
            className="bg-[#6452db] text-white hover:bg-[#6452db]/90 h-11 px-6"
          >
            Get Started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="border-white/10 text-white hover:bg-white/5 h-11 px-6"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-[#18191b] border border-white/10">
            <Users className="w-6 h-6 text-[#6452db] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contact Management</h3>
            <p className="text-sm text-white/50">Organize your contacts, track interactions, and never miss a follow-up.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#18191b] border border-white/10">
            <GitBranch className="w-6 h-6 text-[#ff8964] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deal Pipeline</h3>
            <p className="text-sm text-white/50">Visual pipeline with drag-and-drop to track every deal from lead to close.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#18191b] border border-white/10">
            <BarChart3 className="w-6 h-6 text-[#8dc572] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-white/50">Real-time insights into revenue, conversion rates, and team performance.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#18191b] border border-white/10">
            <Shield className="w-6 h-6 text-[#5683da] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-sm text-white/50">SSO, SAML, 2FA, and audit logs to keep your data safe.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#18191b] border border-white/10">
            <Zap className="w-6 h-6 text-[#f0ad4e] mb-4" />
            <h3 className="text-lg font-semibold mb-2">API & Webhooks</h3>
            <p className="text-sm text-white/50">Build integrations with our REST API and real-time webhooks.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#18191b] border border-white/10">
            <Users className="w-6 h-6 text-[#be6464] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm text-white/50">Roles, permissions, and activity tracking for your entire team.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 py-8 border-t border-white/5 text-center">
        <p className="text-sm text-white/30">© 2024 StartOps. All rights reserved.</p>
      </div>
    </div>
  );
}