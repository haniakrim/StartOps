import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#6452db] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            StartOps
          </h1>
          <p className="text-sm text-white/50 mt-2">
            Sign in to your enterprise CRM workspace
          </p>
        </div>

        <div className="bg-[#18191b] border border-white/10 rounded-lg p-6">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#6452db",
                    brandAccent: "#ff8964",
                    inputBackground: "#0b0d10",
                    inputText: "#ffffff",
                    inputBorder: "rgba(255,255,255,0.1)",
                    inputBorderHover: "rgba(255,255,255,0.2)",
                    inputBorderFocus: "#6452db",
                    messageText: "#ffffff",
                    messageTextDanger: "#be6464",
                    anchorTextColor: "#ff8964",
                    dividerBackground: "rgba(255,255,255,0.1)",
                    defaultButtonBackground: "#6452db",
                    defaultButtonBackgroundHover: "#6452db/90",
                    defaultButtonText: "#ffffff",
                  },
                  space: {
                    buttonPadding: "10px 16px",
                    inputPadding: "10px 12px",
                  },
                  borderWidths: {
                    buttonBorderWidth: "0px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "6px",
                    buttonBorderRadius: "6px",
                    inputBorderRadius: "6px",
                  },
                },
              },
            }}
            theme="dark"
          />
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Enterprise-grade security with SSO, SAML, and 2FA support
        </p>
      </div>
    </div>
  );
}