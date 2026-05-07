import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const ALLOWED_ORIGINS = [
  'https://dtrwtbmxvscrfkzdpsqt.supabase.co',
  'http://localhost:5173',
  'http://localhost:3000',
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("[seed-demo] Starting demo seed process")

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[seed-demo] Missing Authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify the JWT token and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error("[seed-demo] Invalid token:", authError?.message)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      console.error("[seed-demo] User is not admin:", profileError?.message || profile?.role)
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    // Parse request body for options
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    // Require confirmation for destructive operations
    const confirmCleanup = body?.confirm === true
    const dryRun = body?.dryRun === true

    // Generate random demo password instead of hardcoding
    const demoPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const demoEmail = 'demo@example.com'

    // 1. Create or get demo auth user
    console.log("[seed-demo] Checking for demo user")
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    let demoUser = listData?.users?.find((u: any) => u.email === demoEmail)
    let demoUserId: string

    if (demoUser) {
      demoUserId = demoUser.id
      await supabaseAdmin.auth.admin.updateUserById(demoUserId, { password: demoPassword })
      console.log("[seed-demo] Updated demo user password")
    } else {
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { first_name: 'Demo', last_name: 'User' }
      })
      if (createError) throw createError
      demoUserId = newUserData.user!.id
      console.log("[seed-demo] Created demo user:", demoUserId)
    }

    // Ensure profile exists with user role (not admin)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', demoUserId)
      .maybeSingle()

    if (!existingProfile) {
      await supabaseAdmin.from('profiles').insert({
        id: demoUserId,
        first_name: 'Demo',
        last_name: 'User',
        email: demoEmail,
        role: 'user'
      })
      console.log("[seed-demo] Created demo profile")
    } else {
      // Ensure role is user, not admin
      await supabaseAdmin.from('profiles').update({ role: 'user' }).eq('id', demoUserId)
    }

    // 2. Create or get demo organization
    console.log("[seed-demo] Checking for demo organization")
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', 'demo-organization')
      .maybeSingle()

    let demoOrgId: string
    if (existingOrg) {
      demoOrgId = existingOrg.id
      console.log("[seed-demo] Found demo organization:", demoOrgId)
    } else {
      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: 'Demo Organization', slug: 'demo-organization', plan: 'enterprise' })
        .select()
        .single()
      if (orgError) throw orgError
      demoOrgId = newOrg.id
      console.log("[seed-demo] Created demo organization:", demoOrgId)
    }

    // 3. Link demo user to org as admin
    const { data: existingMember } = await supabaseAdmin
      .from('organization_members')
      .select('id')
      .eq('organization_id', demoOrgId)
      .eq('user_id', demoUserId)
      .maybeSingle()

    if (!existingMember) {
      await supabaseAdmin.from('organization_members').insert({
        organization_id: demoOrgId,
        user_id: demoUserId,
        role: 'admin'
      })
      console.log("[seed-demo] Linked demo user to organization")
    }

    // 4. Cleanup: delete all non-demo data from tables with organization_id
    console.log("[seed-demo] Cleaning up non-demo data")
    const tablesWithOrgId = [
      'quote_items', 'documents', 'subscriptions', 'campaigns',
      'forecasts', 'workflows', 'custom_fields', 'api_keys', 'webhooks',
      'support_tickets', 'sla_policies', 'audit_logs', 'invoices', 'expenses',
      'vendors', 'time_entries', 'employees', 'skills',
      'departments', 'teams', 'activities', 'communications', 'deals',
      'contacts', 'companies', 'pipelines', 'products', 'quotes', 'goals',
      'email_templates', 'organization_members'
    ]

    if (dryRun) {
      const wouldDelete: Record<string, number> = {}
      for (const table of tablesWithOrgId) {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true })
          .neq('organization_id', demoOrgId)
        if (!error) wouldDelete[table] = count || 0
      }
      return new Response(JSON.stringify({
        dryRun: true,
        wouldDelete,
        demoUserId,
        demoOrgId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (!confirmCleanup) {
      return new Response(JSON.stringify({
        error: 'Destructive cleanup requires confirm: true in request body. Use dryRun: true to preview what would be deleted.',
        demoUserId,
        demoOrgId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    for (const table of tablesWithOrgId) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('organization_id', demoOrgId)
      if (error) {
        console.error(`[seed-demo] Error deleting from ${table}:`, error.message)
      }
    }

    // Delete from tables without organization_id that reference demo data
    // These will be re-seeded below
    const childTablesNoOrg = ['comments', 'key_results', 'project_tasks', 'deal_stage_history', 'employee_skills']
    for (const table of childTablesNoOrg) {
      const { error } = await supabaseAdmin.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000')
      if (error) {
        console.error(`[seed-demo] Error deleting from ${table}:`, error.message)
      }
    }

    // 5. Seed demo data
    console.log("[seed-demo] Seeding demo data")

    // Generate IDs
    const cids = Array.from({ length: 6 }, () => crypto.randomUUID())
    const contactIds = Array.from({ length: 12 }, () => crypto.randomUUID())
    const pipelineId = crypto.randomUUID()
    const dealIds = Array.from({ length: 8 }, () => crypto.randomUUID())
    const projectIds = Array.from({ length: 3 }, () => crypto.randomUUID())
    const productIds = Array.from({ length: 5 }, () => crypto.randomUUID())
    const quoteIds = Array.from({ length: 3 }, () => crypto.randomUUID())
    const goalIds = Array.from({ length: 3 }, () => crypto.randomUUID())

    // Companies
    const companies = [
      { id: cids[0], organization_id: demoOrgId, name: 'Acme Corp', industry: 'Technology', size: '500-1000', location: 'San Francisco, CA', website: 'https://acme.example.com', revenue: '$50M', health: 85, status: 'Customer', notes: 'Long-time customer, expanding usage' },
      { id: cids[1], organization_id: demoOrgId, name: 'Globex Corporation', industry: 'Manufacturing', size: '1000-5000', location: 'Springfield, IL', website: 'https://globex.example.com', revenue: '$200M', health: 72, status: 'Prospect', notes: 'Evaluating enterprise plan' },
      { id: cids[2], organization_id: demoOrgId, name: 'Initech', industry: 'Software', size: '100-500', location: 'Austin, TX', website: 'https://initech.example.com', revenue: '$15M', health: 60, status: 'Prospect', notes: 'Interested in automation features' },
      { id: cids[3], organization_id: demoOrgId, name: 'Hooli', industry: 'Technology', size: '5000+', location: 'Palo Alto, CA', website: 'https://hooli.example.com', revenue: '$1B', health: 90, status: 'Customer', notes: 'Strategic enterprise account' },
      { id: cids[4], organization_id: demoOrgId, name: 'Stark Industries', industry: 'Defense', size: '1000-5000', location: 'New York, NY', website: 'https://stark.example.com', revenue: '$500M', health: 95, status: 'Customer', notes: 'High-value account, renewal upcoming' },
      { id: cids[5], organization_id: demoOrgId, name: 'Wayne Enterprises', industry: 'Conglomerate', size: '5000+', location: 'Gotham, NJ', website: 'https://wayne.example.com', revenue: '$2B', health: 88, status: 'Customer', notes: 'Multi-division rollout in progress' },
    ]
    await supabaseAdmin.from('companies').insert(companies)
    console.log("[seed-demo] Seeded companies")

    // Contacts
    const contacts = [
      { id: contactIds[0], organization_id: demoOrgId, first_name: 'John', last_name: 'Smith', email: 'john.smith@acme.example.com', phone: '+1-555-0101', company: 'Acme Corp', title: 'CEO', status: 'customer', source: 'Inbound' },
      { id: contactIds[1], organization_id: demoOrgId, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@acme.example.com', phone: '+1-555-0102', company: 'Acme Corp', title: 'CTO', status: 'customer', source: 'Referral' },
      { id: contactIds[2], organization_id: demoOrgId, first_name: 'Michael', last_name: 'Chen', email: 'm.chen@globex.example.com', phone: '+1-555-0103', company: 'Globex Corporation', title: 'VP Sales', status: 'lead', source: 'Outbound' },
      { id: contactIds[3], organization_id: demoOrgId, first_name: 'Emily', last_name: 'Davis', email: 'emily.d@globex.example.com', phone: '+1-555-0104', company: 'Globex Corporation', title: 'Director of Operations', status: 'lead', source: 'Trade Show' },
      { id: contactIds[4], organization_id: demoOrgId, first_name: 'Peter', last_name: 'Gibbons', email: 'peter@initech.example.com', phone: '+1-555-0105', company: 'Initech', title: 'Software Manager', status: 'lead', source: 'Website' },
      { id: contactIds[5], organization_id: demoOrgId, first_name: 'Bill', last_name: 'Lumbergh', email: 'bill.l@initech.example.com', phone: '+1-555-0106', company: 'Initech', title: 'VP Engineering', status: 'prospect', source: 'Inbound' },
      { id: contactIds[6], organization_id: demoOrgId, first_name: 'Gavin', last_name: 'Belson', email: 'gavin@hooli.example.com', phone: '+1-555-0107', company: 'Hooli', title: 'CEO', status: 'customer', source: 'Referral' },
      { id: contactIds[7], organization_id: demoOrgId, first_name: 'Richard', last_name: 'Hendricks', email: 'richard@hooli.example.com', phone: '+1-555-0108', company: 'Hooli', title: 'Founder', status: 'lead', source: 'Conference' },
      { id: contactIds[8], organization_id: demoOrgId, first_name: 'Pepper', last_name: 'Potts', email: 'pepper@stark.example.com', phone: '+1-555-0109', company: 'Stark Industries', title: 'COO', status: 'customer', source: 'Inbound' },
      { id: contactIds[9], organization_id: demoOrgId, first_name: 'Tony', last_name: 'Stark', email: 'tony@stark.example.com', phone: '+1-555-0110', company: 'Stark Industries', title: 'CEO', status: 'customer', source: 'Partner' },
      { id: contactIds[10], organization_id: demoOrgId, first_name: 'Lucius', last_name: 'Fox', email: 'lucius@wayne.example.com', phone: '+1-555-0111', company: 'Wayne Enterprises', title: 'CFO', status: 'customer', source: 'Referral' },
      { id: contactIds[11], organization_id: demoOrgId, first_name: 'Bruce', last_name: 'Wayne', email: 'bruce@wayne.example.com', phone: '+1-555-0112', company: 'Wayne Enterprises', title: 'CEO', status: 'customer', source: 'Inbound' },
    ]
    await supabaseAdmin.from('contacts').insert(contacts)
    console.log("[seed-demo] Seeded contacts")

    // Pipeline
    await supabaseAdmin.from('pipelines').insert({
      id: pipelineId,
      organization_id: demoOrgId,
      name: 'Sales Pipeline',
      description: 'Default 5-stage sales pipeline',
      stages: [
        { id: 'lead', name: 'Lead', color: '#6452db', order: 1 },
        { id: 'qualified', name: 'Qualified', color: '#5683da', order: 2 },
        { id: 'proposal', name: 'Proposal', color: '#ff8964', order: 3 },
        { id: 'negotiation', name: 'Negotiation', color: '#f0ad4e', order: 4 },
        { id: 'closed', name: 'Closed Won', color: '#8dc572', order: 5 }
      ]
    })
    console.log("[seed-demo] Seeded pipeline")

    // Deals
    const deals = [
      { id: dealIds[0], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[0], name: 'Acme Corp Enterprise Expansion', value: 125000, currency: 'USD', stage: 'negotiation', probability: 80, expected_close_date: '2025-03-15', description: 'Expanding to 500 seats', status: 'open', source: 'Inbound' },
      { id: dealIds[1], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[2], name: 'Globex Manufacturing Suite', value: 85000, currency: 'USD', stage: 'proposal', probability: 60, expected_close_date: '2025-04-01', description: 'Full manufacturing module rollout', status: 'open', source: 'Outbound' },
      { id: dealIds[2], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[4], name: 'Initech Automation Package', value: 45000, currency: 'USD', stage: 'qualified', probability: 40, expected_close_date: '2025-04-20', description: 'Workflow automation for 50 users', status: 'open', source: 'Website' },
      { id: dealIds[3], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[6], name: 'Hooli Data Platform', value: 250000, currency: 'USD', stage: 'closed', probability: 100, expected_close_date: '2025-01-10', actual_close_date: '2025-01-10', description: 'Enterprise data integration', status: 'won', source: 'Referral' },
      { id: dealIds[4], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[8], name: 'Stark Defense Contract', value: 180000, currency: 'USD', stage: 'closed', probability: 100, expected_close_date: '2025-02-01', actual_close_date: '2025-02-01', description: 'Secure communications module', status: 'won', source: 'Partner' },
      { id: dealIds[5], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[10], name: 'Wayne Enterprises Rollout', value: 95000, currency: 'USD', stage: 'proposal', probability: 55, expected_close_date: '2025-03-30', description: 'Multi-division deployment', status: 'open', source: 'Referral' },
      { id: dealIds[6], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[7], name: 'Hooli Startup Initiative', value: 15000, currency: 'USD', stage: 'lead', probability: 20, expected_close_date: '2025-05-15', description: 'Small team pilot', status: 'open', source: 'Conference' },
      { id: dealIds[7], organization_id: demoOrgId, pipeline_id: pipelineId, contact_id: contactIds[3], name: 'Globex Supply Chain', value: 62000, currency: 'USD', stage: 'qualified', probability: 45, expected_close_date: '2025-04-10', description: 'Supply chain visibility tools', status: 'open', source: 'Trade Show' },
    ]
    await supabaseAdmin.from('deals').insert(deals)
    console.log("[seed-demo] Seeded deals")

    // Activities
    const activities = [
      { organization_id: demoOrgId, contact_id: contactIds[0], deal_id: dealIds[0], type: 'call', subject: 'Discovery call with John', description: 'Discussed expansion needs and timeline', due_date: '2025-01-15T10:00:00Z', status: 'completed', priority: 'high' },
      { organization_id: demoOrgId, contact_id: contactIds[2], deal_id: dealIds[1], type: 'meeting', subject: 'Demo for Globex team', description: 'Product demo for manufacturing suite', due_date: '2025-01-20T14:00:00Z', status: 'completed', priority: 'high' },
      { organization_id: demoOrgId, contact_id: contactIds[4], type: 'email', subject: 'Follow-up on automation', description: 'Sent pricing and feature list', due_date: '2025-01-22T09:00:00Z', status: 'completed', priority: 'medium' },
      { organization_id: demoOrgId, contact_id: contactIds[6], deal_id: dealIds[3], type: 'call', subject: 'Contract negotiation', description: 'Final terms discussion', due_date: '2025-01-08T11:00:00Z', status: 'completed', priority: 'high' },
      { organization_id: demoOrgId, contact_id: contactIds[8], deal_id: dealIds[4], type: 'meeting', subject: 'Security review', description: 'Compliance and security assessment', due_date: '2025-01-25T13:00:00Z', status: 'pending', priority: 'high' },
      { organization_id: demoOrgId, contact_id: contactIds[10], deal_id: dealIds[5], type: 'task', subject: 'Prepare proposal for Wayne', description: 'Custom proposal for multi-division', due_date: '2025-02-05T17:00:00Z', status: 'pending', priority: 'medium' },
      { organization_id: demoOrgId, contact_id: contactIds[1], type: 'email', subject: 'Technical documentation', description: 'Sent API docs and integration guide', due_date: '2025-01-18T10:00:00Z', status: 'completed', priority: 'low' },
      { organization_id: demoOrgId, contact_id: contactIds[3], type: 'call', subject: 'Check-in call', description: 'Quarterly business review', due_date: '2025-02-10T15:00:00Z', status: 'pending', priority: 'medium' },
      { organization_id: demoOrgId, contact_id: contactIds[5], type: 'meeting', subject: 'Requirements gathering', description: 'Detailed requirements for Initech', due_date: '2025-01-28T11:00:00Z', status: 'pending', priority: 'high' },
      { organization_id: demoOrgId, contact_id: contactIds[7], type: 'email', subject: 'Pilot program details', description: 'Information about startup pricing', due_date: '2025-02-01T09:00:00Z', status: 'pending', priority: 'low' },
      { organization_id: demoOrgId, contact_id: contactIds[9], type: 'call', subject: 'Renewal discussion', description: 'Annual contract renewal', due_date: '2025-02-15T10:00:00Z', status: 'pending', priority: 'high' },
      { organization_id: demoOrgId, contact_id: contactIds[11], type: 'task', subject: 'Schedule onboarding', description: 'Coordinate training sessions', due_date: '2025-02-20T14:00:00Z', status: 'pending', priority: 'medium' },
      { organization_id: demoOrgId, type: 'task', subject: 'Update sales forecast', description: 'Q1 forecast review and update', due_date: '2025-01-30T17:00:00Z', status: 'pending', priority: 'medium' },
      { organization_id: demoOrgId, type: 'meeting', subject: 'Team standup', description: 'Weekly sales team standup', due_date: '2025-01-24T09:00:00Z', status: 'pending', priority: 'low' },
      { organization_id: demoOrgId, contact_id: contactIds[0], type: 'email', subject: 'Proposal follow-up', description: 'Follow up on sent proposal', due_date: '2025-02-03T11:00:00Z', status: 'pending', priority: 'medium' },
    ]
    await supabaseAdmin.from('activities').insert(activities)
    console.log("[seed-demo] Seeded activities")

    // Communications
    const communications = [
      { organization_id: demoOrgId, contact_id: contactIds[0], deal_id: dealIds[0], type: 'email', direction: 'inbound', subject: 'Re: Enterprise Expansion', content: 'Thanks for the proposal. Can we discuss pricing?', sentiment: 'positive' },
      { organization_id: demoOrgId, contact_id: contactIds[2], deal_id: dealIds[1], type: 'email', direction: 'outbound', subject: 'Manufacturing Suite Demo', content: 'Here is the recording from our demo session.', sentiment: 'neutral' },
      { organization_id: demoOrgId, contact_id: contactIds[4], type: 'email', direction: 'inbound', subject: 'Automation Questions', content: 'We need more info on the workflow builder.', sentiment: 'neutral' },
      { organization_id: demoOrgId, contact_id: contactIds[6], deal_id: dealIds[3], type: 'email', direction: 'outbound', subject: 'Contract Finalized', content: 'Please find the signed contract attached.', sentiment: 'positive' },
      { organization_id: demoOrgId, contact_id: contactIds[8], deal_id: dealIds[4], type: 'call', direction: 'inbound', subject: 'Security Review Call', content: 'Discussed compliance requirements and certifications.', sentiment: 'positive' },
      { organization_id: demoOrgId, contact_id: contactIds[10], deal_id: dealIds[5], type: 'email', direction: 'outbound', subject: 'Multi-Division Proposal', content: 'Attached is the customized proposal for your review.', sentiment: 'neutral' },
      { organization_id: demoOrgId, contact_id: contactIds[1], type: 'email', direction: 'inbound', subject: 'Integration Support', content: 'Our team needs help with the API integration.', sentiment: 'neutral' },
      { organization_id: demoOrgId, contact_id: contactIds[3], type: 'call', direction: 'outbound', subject: 'Quarterly Review', content: 'Reviewed usage and discussed expansion opportunities.', sentiment: 'positive' },
      { organization_id: demoOrgId, contact_id: contactIds[5], type: 'email', direction: 'inbound', subject: 'Requirements Document', content: 'Please find our detailed requirements attached.', sentiment: 'neutral' },
      { organization_id: demoOrgId, contact_id: contactIds[9], type: 'email', direction: 'outbound', subject: 'Renewal Offer', content: 'Early renewal offer with 10% discount included.', sentiment: 'positive' },
    ]
    await supabaseAdmin.from('communications').insert(communications)
    console.log("[seed-demo] Seeded communications")

    // Projects
    const projects = [
      { id: projectIds[0], organization_id: demoOrgId, name: 'Website Redesign', description: 'Complete overhaul of corporate website', status: 'in_progress', priority: 'high', start_date: '2025-01-01', end_date: '2025-03-31', budget: 50000, actual_cost: 22000, progress: 45 },
      { id: projectIds[1], organization_id: demoOrgId, name: 'Q4 Product Rollout', description: 'Launch new features for Q4', status: 'planning', priority: 'high', start_date: '2025-02-01', end_date: '2025-04-30', budget: 120000, actual_cost: 5000, progress: 10 },
      { id: projectIds[2], organization_id: demoOrgId, name: 'Client Onboarding', description: 'Streamline new client onboarding process', status: 'in_progress', priority: 'medium', start_date: '2025-01-15', end_date: '2025-02-28', budget: 25000, actual_cost: 12000, progress: 60 },
    ]
    await supabaseAdmin.from('projects').insert(projects)
    console.log("[seed-demo] Seeded projects")

    // Project Tasks
    const taskIds = Array.from({ length: 9 }, () => crypto.randomUUID())
    const projectTasks = [
      { id: taskIds[0], project_id: projectIds[0], name: 'Design mockups', description: 'Create Figma mockups for all pages', status: 'in_progress', priority: 'high', estimated_hours: 40, actual_hours: 35, due_date: '2025-01-31' },
      { id: taskIds[1], project_id: projectIds[0], name: 'Frontend development', description: 'Build React components', status: 'todo', priority: 'high', estimated_hours: 80, actual_hours: 10, due_date: '2025-02-28' },
      { id: taskIds[2], project_id: projectIds[0], name: 'Content migration', description: 'Migrate existing content to new CMS', status: 'todo', priority: 'medium', estimated_hours: 20, actual_hours: 0, due_date: '2025-03-15' },
      { id: taskIds[3], project_id: projectIds[1], name: 'Feature specification', description: 'Write detailed specs for new features', status: 'in_progress', priority: 'high', estimated_hours: 30, actual_hours: 15, due_date: '2025-02-15' },
      { id: taskIds[4], project_id: projectIds[1], name: 'Backend API updates', description: 'Update APIs for new features', status: 'todo', priority: 'high', estimated_hours: 60, actual_hours: 0, due_date: '2025-03-31' },
      { id: taskIds[5], project_id: projectIds[1], name: 'QA testing', description: 'End-to-end testing of new features', status: 'todo', priority: 'medium', estimated_hours: 40, actual_hours: 0, due_date: '2025-04-15' },
      { id: taskIds[6], project_id: projectIds[2], name: 'Process mapping', description: 'Map current onboarding process', status: 'completed', priority: 'high', estimated_hours: 16, actual_hours: 18, due_date: '2025-01-25' },
      { id: taskIds[7], project_id: projectIds[2], name: 'Automation setup', description: 'Configure workflow automation', status: 'in_progress', priority: 'high', estimated_hours: 24, actual_hours: 12, due_date: '2025-02-15' },
      { id: taskIds[8], project_id: projectIds[2], name: 'Documentation', description: 'Write onboarding documentation', status: 'todo', priority: 'low', estimated_hours: 12, actual_hours: 0, due_date: '2025-02-25' },
    ]
    await supabaseAdmin.from('project_tasks').insert(projectTasks)
    console.log("[seed-demo] Seeded project tasks")

    // Products
    const products = [
      { id: productIds[0], organization_id: demoOrgId, name: 'CRM Pro', sku: 'CRM-PRO-001', description: 'Professional CRM plan for growing teams', unit_price: 49, cost_price: 15, quantity_on_hand: 9999, reorder_point: 100, category: 'Software', is_active: true },
      { id: productIds[1], organization_id: demoOrgId, name: 'Enterprise Plan', sku: 'ENT-001', description: 'Enterprise-grade CRM with advanced features', unit_price: 149, cost_price: 45, quantity_on_hand: 9999, reorder_point: 50, category: 'Software', is_active: true },
      { id: productIds[2], organization_id: demoOrgId, name: 'Consulting Package', sku: 'CONS-001', description: '10 hours of implementation consulting', unit_price: 2500, cost_price: 800, quantity_on_hand: 100, reorder_point: 10, category: 'Services', is_active: true },
      { id: productIds[3], organization_id: demoOrgId, name: 'Implementation Services', sku: 'IMPL-001', description: 'Full implementation and onboarding', unit_price: 15000, cost_price: 5000, quantity_on_hand: 50, reorder_point: 5, category: 'Services', is_active: true },
      { id: productIds[4], organization_id: demoOrgId, name: 'Training Program', sku: 'TRAIN-001', description: 'Comprehensive team training sessions', unit_price: 5000, cost_price: 1500, quantity_on_hand: 200, reorder_point: 20, category: 'Services', is_active: true },
    ]
    await supabaseAdmin.from('products').insert(products)
    console.log("[seed-demo] Seeded products")

    // Quotes
    const quotes = [
      { id: quoteIds[0], organization_id: demoOrgId, quote_number: 'Q-2025-001', title: 'Acme Corp Expansion Quote', deal_id: dealIds[0], contact_id: contactIds[0], status: 'sent', subtotal: 125000, tax_rate: 8, tax_amount: 10000, total: 135000, valid_until: '2025-03-15', notes: 'Includes implementation and training', terms: 'Net 30' },
      { id: quoteIds[1], organization_id: demoOrgId, quote_number: 'Q-2025-002', title: 'Globex Manufacturing Suite', deal_id: dealIds[1], contact_id: contactIds[2], status: 'draft', subtotal: 85000, tax_rate: 8, tax_amount: 6800, total: 91800, valid_until: '2025-04-01', notes: 'Pending approval', terms: 'Net 30' },
      { id: quoteIds[2], organization_id: demoOrgId, quote_number: 'Q-2025-003', title: 'Wayne Enterprises Rollout', deal_id: dealIds[5], contact_id: contactIds[10], status: 'accepted', subtotal: 95000, tax_rate: 8, tax_amount: 7600, total: 102600, valid_until: '2025-03-30', notes: 'Signed and approved', terms: 'Net 30' },
    ]
    await supabaseAdmin.from('quotes').insert(quotes)
    console.log("[seed-demo] Seeded quotes")

    // Quote Items
    const quoteItemIds = Array.from({ length: 9 }, () => crypto.randomUUID())
    const quoteItems = [
      { id: quoteItemIds[0], quote_id: quoteIds[0], product_id: productIds[1], description: 'Enterprise Plan - 500 users', quantity: 500, unit_price: 149, discount_percent: 10, total: 67050, organization_id: demoOrgId },
      { id: quoteItemIds[1], quote_id: quoteIds[0], product_id: productIds[3], description: 'Implementation Services', quantity: 1, unit_price: 15000, discount_percent: 0, total: 15000, organization_id: demoOrgId },
      { id: quoteItemIds[2], quote_id: quoteIds[0], product_id: productIds[4], description: 'Training Program', quantity: 5, unit_price: 5000, discount_percent: 20, total: 20000, organization_id: demoOrgId },
      { id: quoteItemIds[3], quote_id: quoteIds[1], product_id: productIds[1], description: 'Enterprise Plan - 300 users', quantity: 300, unit_price: 149, discount_percent: 5, total: 42465, organization_id: demoOrgId },
      { id: quoteItemIds[4], quote_id: quoteIds[1], product_id: productIds[2], description: 'Consulting Package', quantity: 10, unit_price: 2500, discount_percent: 10, total: 22500, organization_id: demoOrgId },
      { id: quoteItemIds[5], quote_id: quoteIds[1], product_id: productIds[3], description: 'Implementation Services', quantity: 1, unit_price: 15000, discount_percent: 0, total: 15000, organization_id: demoOrgId },
      { id: quoteItemIds[6], quote_id: quoteIds[2], product_id: productIds[1], description: 'Enterprise Plan - 400 users', quantity: 400, unit_price: 149, discount_percent: 8, total: 54832, organization_id: demoOrgId },
      { id: quoteItemIds[7], quote_id: quoteIds[2], product_id: productIds[3], description: 'Implementation Services', quantity: 1, unit_price: 15000, discount_percent: 0, total: 15000, organization_id: demoOrgId },
      { id: quoteItemIds[8], quote_id: quoteIds[2], product_id: productIds[4], description: 'Training Program', quantity: 5, unit_price: 5000, discount_percent: 15, total: 21250, organization_id: demoOrgId },
    ]
    await supabaseAdmin.from('quote_items').insert(quoteItems)
    console.log("[seed-demo] Seeded quote items")

    // Goals
    const goals = [
      { id: goalIds[0], organization_id: demoOrgId, name: 'Q1 Revenue Target', description: 'Achieve $2M in new ARR for Q1 2025', period: 'Q1 2025', status: 'on_track', progress: 65, owner_id: demoUserId },
      { id: goalIds[1], organization_id: demoOrgId, name: 'Customer Retention', description: 'Maintain 95% customer retention rate', period: '2025', status: 'on_track', progress: 92, owner_id: demoUserId },
      { id: goalIds[2], organization_id: demoOrgId, name: 'NPS Score', description: 'Achieve NPS score of 50+', period: '2025', status: 'at_risk', progress: 78, owner_id: demoUserId },
    ]
    await supabaseAdmin.from('goals').insert(goals)
    console.log("[seed-demo] Seeded goals")

    // Key Results
    const keyResultIds = Array.from({ length: 9 }, () => crypto.randomUUID())
    const keyResults = [
      { id: keyResultIds[0], goal_id: goalIds[0], name: 'Close 10 enterprise deals', current_value: 6, target_value: 10, unit: 'deals', status: 'on_track', progress: 60 },
      { id: keyResultIds[1], goal_id: goalIds[0], name: 'Generate $500K in pipeline', current_value: 420000, target_value: 500000, unit: 'USD', status: 'on_track', progress: 84 },
      { id: keyResultIds[2], goal_id: goalIds[0], name: 'Onboard 50 new customers', current_value: 32, target_value: 50, unit: 'customers', status: 'on_track', progress: 64 },
      { id: keyResultIds[3], goal_id: goalIds[1], name: 'Reduce churn to <5%', current_value: 4.2, target_value: 5, unit: '%', status: 'on_track', progress: 95 },
      { id: keyResultIds[4], goal_id: goalIds[1], name: 'Achieve 90% renewal rate', current_value: 88, target_value: 90, unit: '%', status: 'at_risk', progress: 88 },
      { id: keyResultIds[5], goal_id: goalIds[1], name: 'Launch customer success program', current_value: 1, target_value: 1, unit: 'program', status: 'completed', progress: 100 },
      { id: keyResultIds[6], goal_id: goalIds[2], name: 'Survey 200 customers', current_value: 150, target_value: 200, unit: 'responses', status: 'on_track', progress: 75 },
      { id: keyResultIds[7], goal_id: goalIds[2], name: 'Improve support response time to <2h', current_value: 2.5, target_value: 2, unit: 'hours', status: 'at_risk', progress: 60 },
      { id: keyResultIds[8], goal_id: goalIds[2], name: 'Launch 3 product improvements', current_value: 2, target_value: 3, unit: 'features', status: 'on_track', progress: 67 },
    ]
    await supabaseAdmin.from('key_results').insert(keyResults)
    console.log("[seed-demo] Seeded key results")

    // Comments
    const commentIds = Array.from({ length: 8 }, () => crypto.randomUUID())
    const comments = [
      { id: commentIds[0], entity_type: 'deal', entity_id: dealIds[0], text: 'John is very interested in expanding. Need to follow up on pricing.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[1], entity_type: 'deal', entity_id: dealIds[0], text: 'Competitor quoted lower, but our features are stronger.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[2], entity_type: 'deal', entity_id: dealIds[1], text: 'Globex team loved the demo. Moving to proposal stage.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[3], entity_type: 'deal', entity_id: dealIds[3], text: 'Hooli contract signed! Great win for the team.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[4], entity_type: 'contact', entity_id: contactIds[0], text: 'Met John at the tech conference. Very forward-thinking leader.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[5], entity_type: 'contact', entity_id: contactIds[6], text: 'Gavin can be demanding but fair. Focus on ROI in conversations.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[6], entity_type: 'deal', entity_id: dealIds[5], text: 'Wayne Enterprises needs custom onboarding for each division.', author_name: 'Demo User', user_id: demoUserId },
      { id: commentIds[7], entity_type: 'contact', entity_id: contactIds[10], text: 'Lucius is the key decision maker for budget approvals.', author_name: 'Demo User', user_id: demoUserId },
    ]
    await supabaseAdmin.from('comments').insert(comments)
    console.log("[seed-demo] Seeded comments")

    // Email Templates
    const templateIds = Array.from({ length: 3 }, () => crypto.randomUUID())
    const emailTemplates = [
      { id: templateIds[0], organization_id: demoOrgId, name: 'Welcome Email', category: 'Onboarding', subject: 'Welcome to StartOps!', body: '<h1>Welcome!</h1><p>Thank you for joining StartOps. We are excited to help you grow your business.</p><p>Get started by exploring your dashboard and setting up your first pipeline.</p><p>Best regards,<br>The StartOps Team</p>', usage_count: 45 },
      { id: templateIds[1], organization_id: demoOrgId, name: 'Follow-Up', category: 'Sales', subject: 'Following up on our conversation', body: '<p>Hi {{first_name}},</p><p>I wanted to follow up on our recent conversation about {{company}}.</p><p>Please let me know if you have any questions or if there is anything else I can help with.</p><p>Best,<br>{{sender_name}}</p>', usage_count: 32 },
      { id: templateIds[2], organization_id: demoOrgId, name: 'Proposal', category: 'Sales', subject: 'Your customized proposal from StartOps', body: '<p>Hi {{first_name}},</p><p>Thank you for the opportunity to work with {{company}}.</p><p>Attached is your customized proposal. I look forward to discussing it with you.</p><p>Best regards,<br>{{sender_name}}</p>', usage_count: 18 },
    ]
    await supabaseAdmin.from('email_templates').insert(emailTemplates)
    console.log("[seed-demo] Seeded email templates")

    // Deal Stage History
    const dealStageHistory = [
      { deal_id: dealIds[0], from_stage: 'lead', to_stage: 'qualified', reason: 'Initial qualification call completed', confidence: 0.7, inferred_by: 'manual' },
      { deal_id: dealIds[0], from_stage: 'qualified', to_stage: 'proposal', reason: 'Proposal sent and accepted for review', confidence: 0.8, inferred_by: 'manual' },
      { deal_id: dealIds[0], from_stage: 'proposal', to_stage: 'negotiation', reason: 'Entering final pricing negotiations', confidence: 0.85, inferred_by: 'manual' },
      { deal_id: dealIds[1], from_stage: 'lead', to_stage: 'qualified', reason: 'Demo completed successfully', confidence: 0.6, inferred_by: 'manual' },
      { deal_id: dealIds[1], from_stage: 'qualified', to_stage: 'proposal', reason: 'Requirements gathered, proposal in progress', confidence: 0.65, inferred_by: 'manual' },
      { deal_id: dealIds[3], from_stage: 'lead', to_stage: 'qualified', reason: 'Initial meeting positive', confidence: 0.75, inferred_by: 'manual' },
      { deal_id: dealIds[3], from_stage: 'qualified', to_stage: 'proposal', reason: 'Technical requirements approved', confidence: 0.8, inferred_by: 'manual' },
      { deal_id: dealIds[3], from_stage: 'proposal', to_stage: 'negotiation', reason: 'Contract terms discussion', confidence: 0.9, inferred_by: 'manual' },
      { deal_id: dealIds[3], from_stage: 'negotiation', to_stage: 'closed', reason: 'Contract signed', confidence: 1.0, inferred_by: 'manual' },
    ]
    await supabaseAdmin.from('deal_stage_history').insert(dealStageHistory)
    console.log("[seed-demo] Seeded deal stage history")

    console.log("[seed-demo] Demo seed completed successfully")

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo data seeded successfully',
      demoUserId,
      demoOrgId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error: any) {
    console.error('[seed-demo] Fatal error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})