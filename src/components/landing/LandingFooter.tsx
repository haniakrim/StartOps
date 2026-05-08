import HeroLogo from "@/components/landing/HeroLogo";

const footerLinks = [
  {
    title: "Product",
    links: ["Dashboard", "CRM", "Analytics", "Reports", "AI Assistant"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Support", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Cookies"],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <HeroLogo className="w-8 h-8" />
              <span className="text-lg font-semibold text-white">StartOps</span>
            </div>
            <p className="text-sm text-white/40 max-w-xs">
              The all-in-one platform for startups to manage, grow, and scale
              their business.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-white/30 hover:text-white/60 transition-colors cursor-default">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/20">
            © {new Date().getFullYear()} StartOps. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "GitHub", "LinkedIn", "Discord"].map((social) => (
              <span
                key={social}
                className="text-sm text-white/20 hover:text-white/40 transition-colors cursor-default"
              >
                {social}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
