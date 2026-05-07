-- =============================================
-- TAAKKAD STAFF DIRECTORY TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS staff_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('Zone 1', 'Zone 2', 'Aml', 'HQ')),
  department TEXT NOT NULL CHECK (department IN ('Medical', 'Nursing', 'Dental', 'Radiology', 'Operations', 'Patient Experience', 'Clinical', 'Finance', 'HR', 'IT')),
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff_directory ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see staff in their organization
CREATE POLICY "staff_directory_select_org"
  ON staff_directory
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "staff_directory_insert_org"
  ON staff_directory
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "staff_directory_update_org"
  ON staff_directory
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "staff_directory_delete_org"
  ON staff_directory
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_staff_directory_org ON staff_directory(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_directory_zone ON staff_directory(zone);
CREATE INDEX IF NOT EXISTS idx_staff_directory_dept ON staff_directory(department);

-- Seed data for demo
INSERT INTO staff_directory (name, job_title, zone, department, phone, email, photo_url, bio)
VALUES
  ('Dr. Layla Al-Rashidi', 'Medical Director', 'Zone 1', 'Medical', '+966 50 123 4567', 'l.alrashidi@taakkad.health.sa', '', 'Board-certified family physician with 14 years of experience across KSA and the UK. Joined Taakkad to shape a new standard of primary care in Riyadh. Speaks Arabic, English, and French. Particular interest in preventive medicine and chronic disease management.'),
  ('Ahmed Al-Harbi', 'Zone 2 Operations Manager', 'Zone 2', 'Operations', '+966 55 234 5678', 'a.alharbi@taakkad.health.sa', '', 'Operations specialist with a background in large-scale health screening programmes. Oversees daily operations at the Taakkad Generation 2 Drive-Through Screening hub — patient flow, capacity planning, and contractor coordination. Previously with MOH for eight years.'),
  ('Fatima Al-Dosari', 'Head of Nursing', 'Zone 1', 'Nursing', '+966 54 345 6789', 'f.aldosari@taakkad.health.sa', '', 'Registered nurse with 11 years in primary care and emergency settings. Leads the nursing team at Zone 1 and is the CBAHI accreditation lead for clinical safety. Passionate about patient advocacy and staff mentorship.'),
  ('Dr. Khalid Al-Otaibi', 'Consultant Dental Surgeon', 'Zone 1', 'Dental', '+966 56 456 7890', 'k.alotaibi@taakkad.health.sa', '', 'Specialist in restorative and cosmetic dentistry with a fellowship from the Royal College of Surgeons. Heads the dental unit at Zone 1, building the service from the ground up. Committed to making quality dental care accessible across Riyadh.'),
  ('Sarah Thompson', 'Head of Patient Experience', 'HQ', 'Patient Experience', '+966 59 567 8901', 's.thompson@taakkad.health.sa', '', 'British national with 10 years of experience in healthcare CX and Press Ganey performance improvement. Responsible for patient satisfaction scoring, complaint management, and the Beneficiary Experience programme across all Taakkad zones. Leads the NPS methodology rollout.'),
  ('Dr. Mohammed Al-Qahtani', 'Consultant Radiologist', 'Zone 2', 'Radiology', '+966 50 678 9012', 'm.alqahtani@taakkad.health.sa', '', 'Fellowship-trained radiologist specialising in diagnostic imaging and CT interpretation. Key to Zone 2 throughput — manages radiology TAT and reporting queue. Working with the operations team to optimise capacity scheduling. FRCR qualified.')
ON CONFLICT DO NOTHING;
