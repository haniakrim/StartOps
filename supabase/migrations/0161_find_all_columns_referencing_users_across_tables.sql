SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('user_id', 'owner_id', 'created_by', 'assigned_to', 'contact_id', 'employee_id')
  AND table_name IN ('activities','campaigns','comments','communications','deals','documents','employees','projects','quotes','workflows','goals','contacts','companies','products','project_tasks','quotes','quote_items','invoices','expenses','vendors','subscriptions','forecasts','custom_fields','pipelines','support_tickets','time_entries','audit_logs','api_keys','webhooks','departments','teams','skills','employee_skills','key_results','deal_stage_history','sla_policies','email_templates')
ORDER BY table_name, column_name;