import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demodemo123";
const DEMO_ORG_NAME = "StartOps Demo";
const DEMO_ORG_SLUG = "startops-demo";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log("[seed-demo] Starting demo setup...");

    // ── Step 1: Create or find demo auth user ──
    const { data: existingUsers, error: listErr } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", DEMO_EMAIL);

    let demoUserId: string;

    if (listErr) {
      console.error("[seed-demo] Error listing profiles:", listErr);
      return Response.json({ error: listErr.message }, { status: 500, headers: corsHeaders });
    }

    if (existingUsers && existingUsers.length > 0) {
      demoUserId = existingUsers[0].id;
      console.log("[seed-demo] Found existing demo user:", demoUserId);
    } else {
      const { data: authData, error: authErr } = await admin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: "Demo",
          last_name: "User",
        },
      });

      if (authErr) {
        console.error("[seed-demo] Error creating auth user:", authErr);
        return Response.json({ error: authErr.message }, { status: 500, headers: corsHeaders });
      }

      demoUserId = authData.user.id;
      console.log("[seed-demo] Created demo auth user:", demoUserId);

      // Update profile with email
      await admin
        .from("profiles")
        .update({ email: DEMO_EMAIL, first_name: "Demo", last_name: "User", role: "admin" })
        .eq("id", demoUserId);
    }

    // ── Step 2: Create or find demo organization ──
    const { data: existingOrgs } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", DEMO_ORG_SLUG);

    let demoOrgId: string;

    if (existingOrgs && existingOrgs.length > 0) {
      demoOrgId = existingOrgs[0].id;
      console.log("[seed-demo] Found existing demo org:", demoOrgId);
    } else {
      const { data: orgData, error: orgErr } = await admin
        .from("organizations")
        .insert({
          name: DEMO_ORG_NAME,
          slug: DEMO_ORG_SLUG,
          plan: "pro",
          primary_color: "#6452db",
          secondary_color: "#ff8964",
        })
        .select()
        .single();

      if (orgErr) {
        console.error("[seed-demo] Error creating org:", orgErr);
        return Response.json({ error: orgErr.message }, { status: 500, headers: corsHeaders });
      }

      demoOrgId = orgData.id;
      console.log("[seed-demo] Created demo org:", demoOrgId);
    }

    // ── Step 3: Link demo user to org ──
    const { data: existingMember } = await admin
      .from("organization_members")
      .select("id")
      .eq("organization_id", demoOrgId)
      .eq("user_id", demoUserId)
      .maybeSingle();

    if (!existingMember) {
      await admin.from("organization_members").insert({
        organization_id: demoOrgId,
        user_id: demoUserId,
        role: "admin",
      });
      console.log("[seed-demo] Linked demo user to org");
    }

    // ── Step 4: Delete all data from non-demo organizations ──
    console.log("[seed-demo] Cleaning data from non-demo organizations...");

    const { data: allOrgs } = await admin.from("organizations").select("id");
    const nonDemoOrgIds = (allOrgs || [])
      .map((o: any) => o.id)
      .filter((id: string) => id !== demoOrgId);

    if (nonDemoOrgIds.length > 0) {
      // Delete in dependency order
      const orgTables = [
        "quote_items",
        "quotes",
        "key_results",
        "goals",
        "project_tasks",
        "projects",
        "communications",
        "activities",
        "deals",
        "contacts",
        "companies",
        "products",
        "pipelines",
        "email_templates",
        "documents",
        "invoices",
        "expenses",
        "forecasts",
        "support_tickets",
        "subscriptions",
        "campaigns",
        "webhooks",
        "audit_logs",
        "custom_fields",
        "time_entries",
        "vendors",
        "sla_policies",
        "api_keys",
      ];

      for (const table of orgTables) {
        try {
          const { error: delErr } = await admin
            .from(table)
            .delete()
            .in("organization_id", nonDemoOrgIds);
          if (delErr) {
            console.log(`[seed-demo] Note: could not delete from ${table}: ${delErr.message}`);
          }
        } catch {
          // Table may not have organization_id column
        }
      }

      // Delete organization_members for non-demo orgs
      await admin.from("organization_members").delete().in("organization_id", nonDemoOrgIds);

      // Delete comments referencing non-demo deals/contacts
      const { data: nonDemoDeals } = await admin.from("deals").select("id").in("organization_id", nonDemoOrgIds);
      const { data: nonDemoContacts } = await admin.from("contacts").select("id").in("organization_id", nonDemoOrgIds);
      const nonDemoDealIds = (nonDemoDeals || []).map((d: any) => d.id);
      const nonDemoContactIds = (nonDemoContacts || []).map((c: any) => c.id);
      if (nonDemoDealIds.length > 0) {
        try { await admin.from("comments").delete().in("entity_id", nonDemoDealIds); } catch {}
      }
      if (nonDemoContactIds.length > 0) {
        try { await admin.from("comments").delete().in("entity_id", nonDemoContactIds); } catch {}
      }
      if (nonDemoDealIds.length > 0) {
        try { await admin.from("deal_stage_history").delete().in("deal_id", nonDemoDealIds); } catch {}
      }

      // Delete non-demo organizations
      await admin.from("organizations").delete().in("id", nonDemoOrgIds);
      console.log("[seed-demo] Cleaned up", nonDemoOrgIds.length, "non-demo organizations");
    }

    // ── Step 5: Clean existing demo data and reseed ──
    console.log("[seed-demo] Cleaning existing demo data for fresh seed...");

    // Delete demo data in reverse dependency order
    const demoCleanupTables = [
      "quote_items",
      "quotes",
      "key_results",
      "goals",
      "project_tasks",
      "projects",
      "communications",
      "activities",
      "deals",
      "contacts",
      "companies",
      "products",
      "pipelines",
      "email_templates",
      "documents",
      "invoices",
      "expenses",
      "forecasts",
      "support_tickets",
      "subscriptions",
      "campaigns",
      "time_entries",
      "vendors",
    ];

    for (const table of demoCleanupTables) {
      try {
        await admin.from(table).delete().eq("organization_id", demoOrgId);
      } catch {
        // Table may not exist or lack organization_id
      }
    }

    // Handle tables without organization_id
    try { await admin.from("comments").delete().eq("user_id", demoUserId); } catch {}
    try {
      const { data: demoDeals } = await admin.from("deals").select("id").eq("organization_id", demoOrgId);
      const demoDealIds = (demoDeals || []).map((d: any) => d.id);
      if (demoDealIds.length > 0) {
        await admin.from("deal_stage_history").delete().in("deal_id", demoDealIds);
      }
    } catch {}

    // ── Step 6: Seed demo data ──
    console.log("[seed-demo] Seeding demo data...");

    // --- Pipeline ---
    const { data: pipeline } = await admin
      .from("pipelines")
      .insert({
        organization_id: demoOrgId,
        name: "Sales Pipeline",
        description: "Default sales pipeline for demo",
        stages: [
          { id: "lead", name: "Lead", color: "#6452db", order: 1 },
          { id: "qualified", name: "Qualified", color: "#5683da", order: 2 },
          { id: "proposal", name: "Proposal", color: "#ff8964", order: 3 },
          { id: "negotiation", name: "Negotiation", color: "#f0ad4e", order: 4 },
          { id: "closed", name: "Closed Won", color: "#8dc572", order: 5 },
        ],
      })
      .select()
      .single();
    const pipelineId = pipeline?.id;
    console.log("[seed-demo] Created pipeline");

    // --- Companies ---
    const companiesData = [
      { name: "Acme Corp", industry: "Technology", size: "500-1000", location: "San Francisco, CA", website: "https://acme.dev", revenue: "$50M", health: 92, status: "Customer", notes: "Long-term customer, expanding contract" },
      { name: "Globex Inc", industry: "Finance", size: "1000-5000", location: "New York, NY", website: "https://globex.com", revenue: "$200M", health: 78, status: "Customer", notes: "Enterprise account, quarterly reviews" },
      { name: "Initech", industry: "SaaS", size: "50-200", location: "Austin, TX", website: "https://initech.io", revenue: "$15M", health: 65, status: "Prospect", notes: "Evaluating our enterprise plan" },
      { name: "Hooli", industry: "Technology", size: "5000+", location: "Palo Alto, CA", website: "https://hooli.com", revenue: "$1B+", health: 88, status: "Customer", notes: "Strategic partner" },
      { name: "Stark Industries", industry: "Manufacturing", size: "1000-5000", location: "Los Angeles, CA", website: "https://starkind.com", revenue: "$500M", health: 95, status: "Customer", notes: "Premium tier, high engagement" },
      { name: "Wayne Enterprises", industry: "Conglomerate", size: "5000+", location: "Gotham, NJ", website: "https://wayneent.com", revenue: "$2B", health: 72, status: "Prospect", notes: "Initial conversations started" },
    ];

    const { data: companies } = await admin
      .from("companies")
      .insert(companiesData.map((c) => ({ ...c, organization_id: demoOrgId })))
      .select();
    const companyIds = (companies || []).map((c: any) => c.id);
    console.log("[seed-demo] Created", companyIds.length, "companies");

    // --- Contacts ---
    const contactsData = [
      { first_name: "Sarah", last_name: "Chen", email: "sarah.chen@acme.dev", phone: "+1-415-555-0101", company: "Acme Corp", title: "VP of Engineering", status: "customer", source: "referral", tags: ["decision-maker", "tech"], last_contacted_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { first_name: "Marcus", last_name: "Rivera", email: "marcus.r@globex.com", phone: "+1-212-555-0202", company: "Globex Inc", title: "Director of IT", status: "customer", source: "website", tags: ["enterprise", "renewal"], last_contacted_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { first_name: "Emily", last_name: "Watson", email: "emily.w@initech.io", phone: "+1-512-555-0303", company: "Initech", title: "CTO", status: "lead", source: "webinar", tags: ["evaluator", "tech"], last_contacted_at: new Date(Date.now() - 14 * 86400000).toISOString() },
      { first_name: "James", last_name: "Parker", email: "james.p@hooli.com", phone: "+1-650-555-0404", company: "Hooli", title: "Head of Operations", status: "customer", source: "partner", tags: ["strategic", "ops"], last_contacted_at: new Date(Date.now() - 1 * 86400000).toISOString() },
      { first_name: "Diana", last_name: "Prince", email: "diana.p@wayneent.com", phone: "+1-555-555-0505", company: "Wayne Enterprises", title: "Chief Strategy Officer", status: "lead", source: "conference", tags: ["c-suite", "strategy"], last_contacted_at: new Date(Date.now() - 21 * 86400000).toISOString() },
      { first_name: "Tony", last_name: "Stark", email: "tony.s@starkind.com", phone: "+1-310-555-0606", company: "Stark Industries", title: "CEO", status: "customer", source: "referral", tags: ["c-suite", "vip"], last_contacted_at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { first_name: "Natasha", last_name: "Romanova", email: "nat.r@starkind.com", phone: "+1-310-555-0607", company: "Stark Industries", title: "Security Director", status: "customer", source: "referral", tags: ["security", "tech"], last_contacted_at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { first_name: "Bruce", last_name: "Wayne", email: "bruce.w@wayneent.com", phone: "+1-555-555-0508", company: "Wayne Enterprises", title: "CEO", status: "lead", source: "conference", tags: ["c-suite", "decision-maker"], last_contacted_at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { first_name: "Lois", last_name: "Lane", email: "lois.l@acme.dev", phone: "+1-415-555-0109", company: "Acme Corp", title: "Marketing Director", status: "customer", source: "website", tags: ["marketing", "champion"], last_contacted_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { first_name: "Clark", last_name: "Kent", email: "clark.k@globex.com", phone: "+1-212-555-0210", company: "Globex Inc", title: "Product Manager", status: "customer", source: "website", tags: ["product", "evaluator"], last_contacted_at: new Date(Date.now() - 6 * 86400000).toISOString() },
      { first_name: "Barry", last_name: "Allen", email: "barry.a@initech.io", phone: "+1-512-555-0311", company: "Initech", title: "Lead Developer", status: "lead", source: "webinar", tags: ["tech", "influencer"], last_contacted_at: new Date(Date.now() - 18 * 86400000).toISOString() },
      { first_name: "Selina", last_name: "Kyle", email: "selina.k@hooli.com", phone: "+1-650-555-0412", company: "Hooli", title: "Procurement Lead", status: "customer", source: "cold", tags: ["procurement", "renewal"], last_contacted_at: new Date(Date.now() - 8 * 86400000).toISOString() },
    ];

    const { data: contacts } = await admin
      .from("contacts")
      .insert(contactsData.map((c) => ({ ...c, organization_id: demoOrgId, owner_id: demoUserId })))
      .select();
    const contactIds = (contacts || []).map((c: any) => c.id);
    console.log("[seed-demo] Created", contactIds.length, "contacts");

    // --- Deals ---
    const dealsData = [
      { name: "Acme Platform Expansion", value: 125000, stage: "negotiation", probability: 75, status: "open", source: "referral", description: "Expanding Acme's current plan to include analytics suite", expected_close_date: futureDate(30), contact_id: contactIds[0], owner_id: demoUserId },
      { name: "Globex Enterprise Renewal", value: 250000, stage: "proposal", probability: 60, status: "open", source: "website", description: "Annual enterprise license renewal with expanded seats", expected_close_date: futureDate(45), contact_id: contactIds[1], owner_id: demoUserId },
      { name: "Initech Cloud Migration", value: 85000, stage: "qualified", probability: 40, status: "open", source: "webinar", description: "Full cloud migration package for Initech's legacy systems", expected_close_date: futureDate(60), contact_id: contactIds[2], owner_id: demoUserId },
      { name: "Hooli Strategic Partnership", value: 500000, stage: "closed", probability: 100, status: "won", source: "partner", description: "Multi-year strategic partnership agreement", actual_close_date: pastDate(10), contact_id: contactIds[3], owner_id: demoUserId },
      { name: "Stark Industries Security Suite", value: 180000, stage: "negotiation", probability: 80, status: "open", source: "referral", description: "Enterprise security and compliance package", expected_close_date: futureDate(15), contact_id: contactIds[5], owner_id: demoUserId },
      { name: "Wayne Enterprises Digital Transformation", value: 350000, stage: "lead", probability: 15, status: "open", source: "conference", description: "Full digital transformation consulting engagement", expected_close_date: futureDate(90), contact_id: contactIds[4], owner_id: demoUserId },
      { name: "Acme Analytics Add-on", value: 45000, stage: "closed", probability: 100, status: "won", source: "referral", description: "Analytics dashboard add-on for existing contract", actual_close_date: pastDate(30), contact_id: contactIds[8], owner_id: demoUserId },
      { name: "Globex Data Integration", value: 67000, stage: "proposal", probability: 50, status: "open", source: "website", description: "Custom data integration with Globex's ERP system", expected_close_date: futureDate(40), contact_id: contactIds[9], owner_id: demoUserId },
    ];

    const { data: deals } = await admin
      .from("deals")
      .insert(dealsData.map((d) => ({ ...d, organization_id: demoOrgId, pipeline_id: pipelineId })))
      .select();
    const dealIds = (deals || []).map((d: any) => d.id);
    console.log("[seed-demo] Created", dealIds.length, "deals");

    // --- Activities ---
    const activitiesData = [
      { type: "call", subject: "Discovery call with Sarah Chen", description: "Discussed platform expansion requirements and timeline", status: "completed", priority: "high", owner_id: demoUserId, contact_id: contactIds[0], deal_id: dealIds[0], completed_at: pastTimestamp(2) },
      { type: "meeting", subject: "Product demo for Initech", description: "Full product walkthrough with CTO and engineering team", status: "completed", priority: "high", owner_id: demoUserId, contact_id: contactIds[2], deal_id: dealIds[2], completed_at: pastTimestamp(5) },
      { type: "email", subject: "Follow-up proposal to Globex", description: "Sent revised pricing proposal with volume discounts", status: "completed", priority: "medium", owner_id: demoUserId, contact_id: contactIds[1], deal_id: dealIds[1], completed_at: pastTimestamp(3) },
      { type: "task", subject: "Prepare security compliance docs for Stark", description: "Compile SOC2 and GDPR compliance documentation", status: "pending", priority: "high", owner_id: demoUserId, contact_id: contactIds[5], deal_id: dealIds[4], due_date: futureDate(5) },
      { type: "call", subject: "Quarterly review with Hooli", description: "Review partnership KPIs and discuss expansion", status: "completed", priority: "medium", owner_id: demoUserId, contact_id: contactIds[3], deal_id: dealIds[3], completed_at: pastTimestamp(1) },
      { type: "meeting", subject: "Wayne Enterprises intro meeting", description: "Initial meeting to understand digital transformation needs", status: "pending", priority: "high", owner_id: demoUserId, contact_id: contactIds[4], deal_id: dealIds[5], due_date: futureDate(7) },
      { type: "email", subject: "Send contract renewal to Acme", description: "Draft and send annual contract renewal with expansion terms", status: "pending", priority: "medium", owner_id: demoUserId, contact_id: contactIds[0], deal_id: dealIds[0], due_date: futureDate(3) },
      { type: "task", subject: "Update CRM data for Q4 reporting", description: "Ensure all deal stages and values are current", status: "pending", priority: "low", owner_id: demoUserId, due_date: futureDate(10) },
      { type: "call", subject: "Check-in with Natasha Romanova", description: "Discuss security audit findings and next steps", status: "completed", priority: "medium", owner_id: demoUserId, contact_id: contactIds[6], completed_at: pastTimestamp(7) },
      { type: "meeting", subject: "Globex integration planning session", description: "Technical planning for ERP integration", status: "pending", priority: "high", owner_id: demoUserId, contact_id: contactIds[1], deal_id: dealIds[7], due_date: futureDate(12) },
      { type: "email", subject: "Welcome package to Bruce Wayne", description: "Send intro materials and case studies", status: "completed", priority: "low", owner_id: demoUserId, contact_id: contactIds[7], completed_at: pastTimestamp(10) },
      { type: "task", subject: "Prepare demo environment for Initech POC", description: "Set up sandbox with sample data for proof of concept", status: "in_progress", priority: "high", owner_id: demoUserId, contact_id: contactIds[2], deal_id: dealIds[2], due_date: futureDate(4) },
      { type: "call", subject: "Negotiation call with Stark team", description: "Final pricing discussion and contract terms", status: "pending", priority: "high", owner_id: demoUserId, contact_id: contactIds[5], deal_id: dealIds[4], due_date: futureDate(2) },
      { type: "meeting", subject: "Acme analytics review", description: "Review analytics dashboard performance and usage", status: "completed", priority: "medium", owner_id: demoUserId, contact_id: contactIds[8], deal_id: dealIds[6], completed_at: pastTimestamp(15) },
      { type: "email", subject: "Follow up with Selina Kyle on renewal", description: "Send renewal reminder and updated terms", status: "pending", priority: "medium", owner_id: demoUserId, contact_id: contactIds[11], due_date: futureDate(6) },
    ];

    await admin
      .from("activities")
      .insert(activitiesData.map((a) => ({ ...a, organization_id: demoOrgId })));
    console.log("[seed-demo] Created activities");

    // --- Communications ---
    const commsData = [
      { type: "email", direction: "outbound", subject: "Platform expansion proposal", content: "Hi Sarah,\n\nFollowing our call yesterday, I've prepared a detailed proposal for expanding your analytics capabilities. The new modules would include real-time dashboards, custom reporting, and API access.\n\nLooking forward to your feedback!\n\nBest,\nDemo User", summary: "Sent expansion proposal to Sarah Chen", sentiment: "positive", contact_id: contactIds[0], deal_id: dealIds[0], occurred_at: pastTimestamp(2) },
      { type: "email", direction: "inbound", subject: "Re: Platform expansion proposal", content: "Hi Demo,\n\nThanks for the proposal — it looks great! I've shared it with our engineering team for review. We should have feedback by end of week.\n\nBest,\nSarah", summary: "Sarah Chen acknowledged proposal, sharing with team", sentiment: "positive", contact_id: contactIds[0], deal_id: dealIds[0], occurred_at: pastTimestamp(1) },
      { type: "email", direction: "outbound", subject: "Enterprise renewal terms", content: "Hi Marcus,\n\nAs discussed, here are the renewal terms for your enterprise license. We've included a 15% volume discount for the additional 200 seats.\n\nLet me know if you'd like to schedule a call to discuss.\n\nRegards,\nDemo User", summary: "Sent renewal terms with volume discount to Globex", sentiment: "neutral", contact_id: contactIds[1], deal_id: dealIds[1], occurred_at: pastTimestamp(3) },
      { type: "call", direction: "outbound", subject: "Discovery call", content: "Discussed Initech's current pain points with legacy systems and their interest in cloud migration. Emily expressed strong interest in a POC.", summary: "Discovery call with Initech CTO about cloud migration", sentiment: "positive", contact_id: contactIds[2], deal_id: dealIds[2], occurred_at: pastTimestamp(5) },
      { type: "email", direction: "inbound", subject: "Partnership agreement signed", content: "Hi team,\n\nWe're pleased to confirm that the partnership agreement has been signed by our executive team. Looking forward to a great collaboration!\n\nBest,\nJames", summary: "Hooli partnership agreement confirmed", sentiment: "positive", contact_id: contactIds[3], deal_id: dealIds[3], occurred_at: pastTimestamp(10) },
      { type: "email", direction: "outbound", subject: "Security compliance documentation", content: "Dear Tony,\n\nPlease find attached the SOC2 Type II report and our GDPR compliance certification. We've also included the security questionnaire responses.\n\nLet us know if you need any additional information.\n\nBest regards,\nDemo User", summary: "Sent security compliance docs to Stark Industries", sentiment: "neutral", contact_id: contactIds[5], deal_id: dealIds[4], occurred_at: pastTimestamp(4) },
      { type: "email", direction: "inbound", subject: "Interest in digital transformation", content: "Hello,\n\nWe're exploring options for our digital transformation initiative and your platform was recommended. Could we schedule an introductory call?\n\nRegards,\nDiana Prince", summary: "Wayne Enterprises expressing interest in digital transformation", sentiment: "positive", contact_id: contactIds[4], deal_id: dealIds[5], occurred_at: pastTimestamp(21) },
      { type: "call", direction: "inbound", subject: "Urgent support request", content: "Natasha called about a security audit finding that needs immediate attention. She requested a call back within 24 hours.", summary: "Urgent security audit follow-up from Stark Industries", sentiment: "negative", contact_id: contactIds[6], occurred_at: pastTimestamp(7) },
      { type: "email", direction: "outbound", subject: "Analytics dashboard performance report", content: "Hi Lois,\n\nHere's the monthly analytics dashboard performance report. Usage is up 34% from last month and all SLAs are being met.\n\nBest,\nDemo User", summary: "Sent monthly analytics report to Acme marketing", sentiment: "positive", contact_id: contactIds[8], deal_id: dealIds[6], occurred_at: pastTimestamp(15) },
      { type: "email", direction: "outbound", subject: "Data integration proposal", content: "Hi Clark,\n\nFollowing our technical discussion, I've outlined the integration approach for connecting our platform with Globex's ERP system. The estimated timeline is 6-8 weeks.\n\nBest,\nDemo User", summary: "Sent data integration proposal to Globex PM", sentiment: "neutral", contact_id: contactIds[9], deal_id: dealIds[7], occurred_at: pastTimestamp(6) },
    ];

    await admin
      .from("communications")
      .insert(commsData.map((c) => ({ ...c, organization_id: demoOrgId })));
    console.log("[seed-demo] Created communications");

    // --- Products ---
    const productsData = [
      { name: "CRM Pro", sku: "CRM-PRO-001", description: "Professional CRM with advanced analytics and automation", unit_price: 49, cost_price: 12, quantity_on_hand: 999, reorder_point: 0, category: "Software", is_active: true },
      { name: "Enterprise Plan", sku: "ENT-PLN-001", description: "Full enterprise suite with unlimited users and priority support", unit_price: 149, cost_price: 35, quantity_on_hand: 999, reorder_point: 0, category: "Software", is_active: true },
      { name: "Security & Compliance Pack", sku: "SEC-CMP-001", description: "SOC2, GDPR, and HIPAA compliance modules", unit_price: 79, cost_price: 20, quantity_on_hand: 999, reorder_point: 0, category: "Add-on", is_active: true },
      { name: "Data Integration Service", sku: "DAT-INT-001", description: "Custom API and ERP integration consulting", unit_price: 200, cost_price: 80, quantity_on_hand: 999, reorder_point: 0, category: "Service", is_active: true },
      { name: "Analytics Dashboard", sku: "ANL-DSH-001", description: "Real-time analytics with custom reporting and KPI tracking", unit_price: 39, cost_price: 8, quantity_on_hand: 999, reorder_point: 0, category: "Add-on", is_active: true },
    ];

    const { data: products } = await admin
      .from("products")
      .insert(productsData.map((p) => ({ ...p, organization_id: demoOrgId })))
      .select();
    const productIds = (products || []).map((p: any) => p.id);
    console.log("[seed-demo] Created", productIds.length, "products");

    // --- Quotes ---
    const quotesData = [
      { quote_number: "QT-2024-001", title: "Acme Platform Expansion", status: "sent", deal_id: dealIds[0], contact_id: contactIds[0], subtotal: 9800, tax_rate: 8.5, tax_amount: 833, total: 10633, valid_until: futureDate(30), notes: "Includes analytics suite and API access", terms: "Net 30" },
      { quote_number: "QT-2024-002", title: "Globex Enterprise Renewal", status: "draft", deal_id: dealIds[1], contact_id: contactIds[1], subtotal: 22500, tax_rate: 8.5, tax_amount: 1912.5, total: 24412.5, valid_until: futureDate(45), notes: "Annual renewal with 200 additional seats", terms: "Net 45" },
      { quote_number: "QT-2024-003", title: "Stark Security Package", status: "accepted", deal_id: dealIds[4], contact_id: contactIds[5], subtotal: 15800, tax_rate: 8.5, tax_amount: 1343, total: 17143, valid_until: futureDate(15), notes: "Enterprise security and compliance bundle", terms: "Net 30" },
    ];

    const { data: quotes } = await admin
      .from("quotes")
      .insert(quotesData.map((q) => ({ ...q, organization_id: demoOrgId })))
      .select();
    const quoteIds = (quotes || []).map((q: any) => q.id);
    console.log("[seed-demo] Created", quoteIds.length, "quotes");

    // --- Quote Items ---
    if (quoteIds.length >= 3 && productIds.length >= 5) {
      const quoteItemsData = [
        // Quote 1 - Acme
        { quote_id: quoteIds[0], product_id: productIds[4], description: "Analytics Dashboard - 100 users", quantity: 100, unit_price: 39, discount_percent: 10, total: 3510, organization_id: demoOrgId },
        { quote_id: quoteIds[0], product_id: productIds[3], description: "Data Integration Service - Setup", quantity: 1, unit_price: 200, discount_percent: 0, total: 200, organization_id: demoOrgId },
        { quote_id: quoteIds[0], product_id: productIds[0], description: "CRM Pro - 100 seats (monthly)", quantity: 100, unit_price: 49, discount_percent: 15, total: 4165, organization_id: demoOrgId },
        // Quote 2 - Globex
        { quote_id: quoteIds[1], product_id: productIds[1], description: "Enterprise Plan - 200 additional seats", quantity: 200, unit_price: 149, discount_percent: 15, total: 25330, organization_id: demoOrgId },
        { quote_id: quoteIds[1], product_id: productIds[2], description: "Security & Compliance Pack", quantity: 200, unit_price: 79, discount_percent: 10, total: 14220, organization_id: demoOrgId },
        // Quote 3 - Stark
        { quote_id: quoteIds[2], product_id: productIds[2], description: "Security & Compliance Pack - Enterprise", quantity: 150, unit_price: 79, discount_percent: 20, total: 9480, organization_id: demoOrgId },
        { quote_id: quoteIds[2], product_id: productIds[3], description: "Custom Integration - Security Audit", quantity: 2, unit_price: 200, discount_percent: 0, total: 400, organization_id: demoOrgId },
        { quote_id: quoteIds[2], product_id: productIds[4], description: "Analytics Dashboard - 50 users", quantity: 50, unit_price: 39, discount_percent: 10, total: 1755, organization_id: demoOrgId },
      ];

      await admin.from("quote_items").insert(quoteItemsData);
      console.log("[seed-demo] Created quote items");
    }

    // --- Projects ---
    const projectsData = [
      { name: "Website Redesign", description: "Complete overhaul of marketing website with new branding and improved UX", status: "in_progress", priority: "high", start_date: pastDate(30), end_date: futureDate(30), budget: 50000, actual_cost: 28000, progress: 65, client_id: companyIds[0], manager_id: demoUserId },
      { name: "Q4 Product Launch", description: "Launch new analytics dashboard feature for Q4 release", status: "in_progress", priority: "high", start_date: pastDate(14), end_date: futureDate(45), budget: 75000, actual_cost: 22000, progress: 35, manager_id: demoUserId },
      { name: "Client Onboarding Automation", description: "Automate the client onboarding workflow to reduce time-to-value", status: "planning", priority: "medium", start_date: futureDate(7), end_date: futureDate(60), budget: 30000, actual_cost: 0, progress: 10, manager_id: demoUserId },
    ];

    const { data: projects } = await admin
      .from("projects")
      .insert(projectsData.map((p) => ({ ...p, organization_id: demoOrgId })))
      .select();
    const projectIds = (projects || []).map((p: any) => p.id);
    console.log("[seed-demo] Created", projectIds.length, "projects");

    // --- Project Tasks ---
    if (projectIds.length >= 3) {
      const tasksData = [
        // Website Redesign
        { name: "Design homepage mockups", description: "Create 3 homepage design concepts for review", status: "done", priority: "high", assignee_id: demoUserId, estimated_hours: 16, actual_hours: 14, due_date: pastDate(20), completed_at: pastTimestamp(18), project_id: projectIds[0] },
        { name: "Implement responsive navigation", description: "Build mobile-first responsive nav component", status: "in_progress", priority: "high", assignee_id: demoUserId, estimated_hours: 12, actual_hours: 8, due_date: futureDate(5), project_id: projectIds[0] },
        { name: "Content migration", description: "Migrate all existing content to new CMS", status: "todo", priority: "medium", assignee_id: demoUserId, estimated_hours: 24, actual_hours: 0, due_date: futureDate(15), project_id: projectIds[0] },
        // Q4 Product Launch
        { name: "Define analytics feature specs", description: "Write detailed product requirements for analytics dashboard", status: "done", priority: "high", assignee_id: demoUserId, estimated_hours: 20, actual_hours: 18, due_date: pastDate(7), completed_at: pastTimestamp(5), project_id: projectIds[1] },
        { name: "Build dashboard components", description: "Implement chart widgets and KPI cards", status: "in_progress", priority: "high", assignee_id: demoUserId, estimated_hours: 40, actual_hours: 22, due_date: futureDate(20), project_id: projectIds[1] },
        { name: "QA testing and bug fixes", description: "Comprehensive testing across browsers and devices", status: "todo", priority: "high", assignee_id: demoUserId, estimated_hours: 16, actual_hours: 0, due_date: futureDate(35), project_id: projectIds[1] },
        // Onboarding Automation
        { name: "Map current onboarding workflow", description: "Document all steps in the current manual onboarding process", status: "todo", priority: "medium", assignee_id: demoUserId, estimated_hours: 8, actual_hours: 0, due_date: futureDate(14), project_id: projectIds[2] },
        { name: "Design automation triggers", description: "Define trigger events and automated actions", status: "todo", priority: "medium", assignee_id: demoUserId, estimated_hours: 12, actual_hours: 0, due_date: futureDate(25), project_id: projectIds[2] },
        { name: "Build onboarding email sequence", description: "Create automated welcome and setup email series", status: "todo", priority: "low", assignee_id: demoUserId, estimated_hours: 10, actual_hours: 0, due_date: futureDate(40), project_id: projectIds[2] },
      ];

      await admin.from("project_tasks").insert(tasksData);
      console.log("[seed-demo] Created project tasks");
    }

    // --- Goals ---
    const goalsData = [
      { name: "Q4 Revenue Target", description: "Achieve $1.5M in new ARR for Q4 2024", period: "Q4 2024", status: "on_track", progress: 62, owner_id: demoUserId, organization_id: demoOrgId },
      { name: "Customer Retention Rate", description: "Maintain 95%+ customer retention rate", period: "2024", status: "on_track", progress: 78, owner_id: demoUserId, organization_id: demoOrgId },
      { name: "Net Promoter Score", description: "Achieve NPS of 50+ across all customer segments", period: "2024", status: "at_risk", progress: 45, owner_id: demoUserId, organization_id: demoOrgId },
    ];

    const { data: goals } = await admin
      .from("goals")
      .insert(goalsData)
      .select();
    const goalIds = (goals || []).map((g: any) => g.id);
    console.log("[seed-demo] Created", goalIds.length, "goals");

    // --- Key Results ---
    if (goalIds.length >= 3) {
      const keyResultsData = [
        // Q4 Revenue
        { name: "New MRR from enterprise deals", current_value: 420000, target_value: 800000, unit: "$", status: "on_track", progress: 52, goal_id: goalIds[0] },
        { name: "Upsell revenue from existing customers", current_value: 310000, target_value: 500000, unit: "$", status: "on_track", progress: 62, goal_id: goalIds[0] },
        { name: "Average deal size increase", current_value: 15, target_value: 25, unit: "%", status: "on_track", progress: 60, goal_id: goalIds[0] },
        // Retention
        { name: "Monthly churn rate", current_value: 3.8, target_value: 5, unit: "%", status: "on_track", progress: 76, goal_id: goalIds[1] },
        { name: "Customer health score average", current_value: 82, target_value: 90, unit: "pts", status: "on_track", progress: 91, goal_id: goalIds[1] },
        // NPS
        { name: "NPS survey response rate", current_value: 35, target_value: 60, unit: "%", status: "at_risk", progress: 58, goal_id: goalIds[2] },
        { name: "Promoter percentage", current_value: 42, target_value: 70, unit: "%", status: "at_risk", progress: 60, goal_id: goalIds[2] },
        { name: "Detractor reduction", current_value: 12, target_value: 5, unit: "%", status: "behind", progress: 30, goal_id: goalIds[2] },
      ];

      await admin.from("key_results").insert(keyResultsData);
      console.log("[seed-demo] Created key results");
    }

    // --- Comments ---
    const commentsData = [
      { entity_type: "deal", entity_id: dealIds[0], text: "Sarah seems very interested in the analytics expansion. Let's prioritize the proposal.", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "deal", entity_id: dealIds[0], text: "Updated pricing to include a 10% early-adopter discount for the first year.", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "deal", entity_id: dealIds[1], text: "Globex wants to add 200 more seats. Great upsell opportunity!", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "deal", entity_id: dealIds[4], text: "Security docs sent. Tony's team is reviewing — expect feedback by Friday.", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "deal", entity_id: dealIds[5], text: "Initial contact made at the conference. Diana is the key decision-maker.", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "contact", entity_id: contactIds[0], text: "Sarah is our main champion at Acme. Very responsive and engaged.", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "contact", entity_id: contactIds[5], text: "Tony prefers email communication. Calls should be scheduled in advance.", author_name: "Demo User", user_id: demoUserId },
      { entity_type: "contact", entity_id: contactIds[4], text: "Diana mentioned they're evaluating 3 vendors. We need to stand out in the demo.", author_name: "Demo User", user_id: demoUserId },
    ];

    await admin.from("comments").insert(commentsData);
    console.log("[seed-demo] Created comments");

    // --- Email Templates ---
    const emailTemplatesData = [
      { name: "Initial Outreach", category: "Sales", subject: "Following up on your interest", body: "Hi {{first_name}},\n\nI hope this email finds you well. I wanted to follow up on your recent interest in our solutions.\n\nWould you be available for a quick call next week?\n\nBest regards,\nDemo User", usage_count: 24 },
      { name: "Demo Follow-up", category: "Sales", subject: "Thanks for attending the demo", body: "Hi {{first_name}},\n\nThank you for taking the time to attend our demo today. It was great learning more about {{company}}'s needs.\n\nAs discussed, I've attached the proposal for your review.\n\nLet me know if you have any questions!\n\nBest,\nDemo User", usage_count: 18 },
      { name: "Welcome Email", category: "Onboarding", subject: "Welcome to the team!", body: "Hi {{first_name}},\n\nWelcome aboard! We're excited to have {{company}} as a partner.\n\nYour account manager will reach out shortly to kick off the onboarding process.\n\nCheers,\nThe StartOps Team", usage_count: 31 },
    ];

    await admin.from("email_templates").insert(
      emailTemplatesData.map((t) => ({ ...t, organization_id: demoOrgId }))
    );
    console.log("[seed-demo] Created email templates");

    console.log("[seed-demo] ✅ Demo setup complete!");
    return Response.json(
      {
        success: true,
        message: "Demo user and data created successfully",
        demoUser: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
        demoOrgId,
        stats: {
          companies: companyIds.length,
          contacts: contactIds.length,
          deals: dealIds.length,
          products: productIds.length,
          quotes: quoteIds.length,
          projects: projectIds.length,
          goals: goalIds.length,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[seed-demo] Fatal error:", error);
    return Response.json(
      { error: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
});

function futureDate(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

function pastDate(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
}

function pastTimestamp(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}