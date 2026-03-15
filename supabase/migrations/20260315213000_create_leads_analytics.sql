CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  value NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Data
INSERT INTO leads (name, source, status, value, cost, created_at) VALUES
('Lead 1', 'Google', 'converted', 1500, 150, now() - interval '1 day'),
('Lead 2', 'Instagram', 'contacted', 0, 50, now() - interval '2 days'),
('Lead 3', 'Google', 'new', 0, 150, now() - interval '3 days'),
('Lead 4', 'Referral', 'converted', 2000, 0, now() - interval '4 days'),
('Lead 5', 'Facebook', 'converted', 800, 80, now() - interval '5 days'),
('Lead 6', 'WhatsApp', 'contacted', 0, 20, now() - interval '6 days'),
('Lead 7', 'Google', 'converted', 1200, 150, now() - interval '8 days'),
('Lead 8', 'Instagram', 'new', 0, 50, now() - interval '12 days'),
('Lead 9', 'Referral', 'converted', 2500, 0, now() - interval '15 days'),
('Lead 10', 'Facebook', 'contacted', 0, 80, now() - interval '18 days'),
('Lead 11', 'WhatsApp', 'converted', 500, 20, now() - interval '22 days'),
('Lead 12', 'Google', 'contacted', 0, 150, now() - interval '25 days'),
('Lead 13', 'Instagram', 'converted', 900, 50, now() - interval '28 days'),
('Lead 14', 'Referral', 'new', 0, 0, now() - interval '35 days'),
('Lead 15', 'Facebook', 'converted', 1100, 80, now() - interval '45 days'),
('Lead 16', 'Google', 'converted', 1800, 150, now() - interval '55 days'),
('Lead 17', 'Instagram', 'contacted', 0, 50, now() - interval '65 days'),
('Lead 18', 'WhatsApp', 'new', 0, 20, now() - interval '75 days'),
('Lead 19', 'Referral', 'converted', 3000, 0, now() - interval '85 days'),
('Lead 20', 'Facebook', 'new', 0, 80, now() - interval '88 days');
