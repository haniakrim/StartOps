import { useState } from "react";
import { LifeBuoy, Search, MessageSquare, Book, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How do I invite team members?",
    a: "Go to Organization > Team Members and click 'Invite Member'. Enter their email and select a role. They'll receive an invitation link via email.",
  },
  {
    q: "Can I import contacts from a CSV file?",
    a: "Yes. Navigate to Contacts and click the Import button. Upload a CSV with columns for name, email, company, and phone. We'll map the fields automatically.",
  },
  {
    q: "How does the deal pipeline work?",
    a: "Deals move through customizable stages (e.g., Lead, Qualified, Proposal, Closed Won). Drag and drop deals between stages or click to edit details and set probabilities.",
  },
  {
    q: "Is there an API available?",
    a: "Yes. Go to API & Webhooks in the sidebar to generate an API key and configure webhooks for real-time event notifications.",
  },
  {
    q: "How do I enable SSO?",
    a: "Navigate to Security > SSO Providers. Click 'Connect' next to your identity provider (Google Workspace, Azure AD, or Okta) and follow the setup instructions.",
  },
];

const Support = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Support</h1>
        <p className="text-white/50 mt-1">Get help and find answers</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#18191b] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18191b] border-white/10 hover:border-[#6452db]/30 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Book className="w-6 h-6 text-[#6452db] mb-3" />
            <p className="text-sm font-medium text-white">Documentation</p>
            <p className="text-xs text-white/40 mt-1">Read the full docs</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10 hover:border-[#6452db]/30 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <MessageSquare className="w-6 h-6 text-[#6452db] mb-3" />
            <p className="text-sm font-medium text-white">Live Chat</p>
            <p className="text-xs text-white/40 mt-1">Talk to our team</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18191b] border-white/10 hover:border-[#6452db]/30 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Mail className="w-6 h-6 text-[#6452db] mb-3" />
            <p className="text-sm font-medium text-white">Email Support</p>
            <p className="text-xs text-white/40 mt-1">support@startops.com</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-[#6452db]" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  {openIndex === i ? (
                    <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                  )}
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-white/40 text-center py-8">No results found for "{search}"</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;