import { Building2 } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6452db] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">StartOps</span>
          </div>

          <div className="flex items-center gap-6">
            {["Dashboard", "Contacts", "Deals", "Finance", "Analytics"].map(
              (link) => (
                <span
                  key={link}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-default"
                >
                  {link}
                </span>
              )
            )}
          </div>

          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} StartOps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
