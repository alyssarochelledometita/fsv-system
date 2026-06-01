-- F&S Velasco Commercial Building
-- PostgreSQL Schema
-- Run this in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- BOOKKEEPERS (staff who can log in)
-- ─────────────────────────────────────────
CREATE TABLE bookkeepers (
  id          TEXT PRIMARY KEY DEFAULT 'BK' || lpad(nextval('bk_seq')::text, 3, '0'),
  name        TEXT NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,   -- store plain for demo; use bcrypt in production
  email       TEXT,
  contact     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE bk_seq START 1;

-- ─────────────────────────────────────────
-- ATTORNEYS
-- ─────────────────────────────────────────
CREATE TABLE attorneys (
  id           TEXT PRIMARY KEY DEFAULT 'ATT' || lpad(nextval('att_seq')::text, 3, '0'),
  name         TEXT NOT NULL,
  email        TEXT,
  contact      TEXT,
  bookkeeper_id TEXT REFERENCES bookkeepers(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE att_seq START 1;

-- ─────────────────────────────────────────
-- SPACES
-- ─────────────────────────────────────────
CREATE TABLE spaces (
  id           TEXT PRIMARY KEY DEFAULT 'SP' || lpad(nextval('sp_seq')::text, 3, '0'),
  unit_number  TEXT NOT NULL,
  floor        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'Available'
                 CHECK (status IN ('Available','Occupied','Under Maintenance')),
  monthly_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE sp_seq START 1;

-- ─────────────────────────────────────────
-- INQUIRERS (public submissions + admin-created)
-- ─────────────────────────────────────────
CREATE TABLE inquirers (
  id            TEXT PRIMARY KEY DEFAULT 'INQ' || lpad(nextval('inq_seq')::text, 3, '0'),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  contact       TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'New'
                  CHECK (status IN ('New','Contacted','Assigned','Declined','Closed')),
  bookkeeper_id TEXT REFERENCES bookkeepers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE inq_seq START 1;

-- Space interests from inquirers (many-to-many)
CREATE TABLE inquirer_spaces (
  inquirer_id TEXT REFERENCES inquirers(id) ON DELETE CASCADE,
  space_id    TEXT REFERENCES spaces(id) ON DELETE CASCADE,
  PRIMARY KEY (inquirer_id, space_id)
);

-- ─────────────────────────────────────────
-- TENANTS (assigned from inquirers)
-- ─────────────────────────────────────────
CREATE TABLE tenants (
  id            TEXT PRIMARY KEY DEFAULT 'TN' || lpad(nextval('tn_seq')::text, 3, '0'),
  inquirer_id   TEXT UNIQUE REFERENCES inquirers(id) ON DELETE SET NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  contact       TEXT,
  business_name TEXT,
  business_type TEXT,
  move_in_date  DATE,
  bookkeeper_id TEXT REFERENCES bookkeepers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE tn_seq START 1;

-- ─────────────────────────────────────────
-- CONTRACTS (tenant can have multiple, for multiple spaces)
-- ─────────────────────────────────────────
CREATE TABLE contracts (
  id               TEXT PRIMARY KEY DEFAULT 'CON' || lpad(nextval('con_seq')::text, 3, '0'),
  tenant_id        TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  space_id         TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  extension_years  INT NOT NULL DEFAULT 0,
  early_end_date   DATE,         -- set if tenant leaves early
  termination_note TEXT,
  status           TEXT NOT NULL DEFAULT 'Active'
                     CHECK (status IN ('Active','Extended','Early Terminated','Expired')),
  created_at       TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE con_seq START 1;

-- ─────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────
CREATE TABLE payments (
  id          TEXT PRIMARY KEY DEFAULT 'PAY' || lpad(nextval('pay_seq')::text, 3, '0'),
  contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method      TEXT NOT NULL DEFAULT 'Cash'
                CHECK (method IN ('Cash','Bank Transfer','GCash','Check')),
  status      TEXT NOT NULL DEFAULT 'Paid'
                CHECK (status IN ('Paid','Pending')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE SEQUENCE pay_seq START 1;

-- ─────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────
INSERT INTO bookkeepers (id, name, username, password, email, contact) VALUES
  ('BK001', 'Rosa Mendoza',   'rosa',  'bk2024', 'rosa@fsvelasco.com',  '09221234567'),
  ('BK002', 'Carlo Bautista', 'carlo', 'bk2024', 'carlo@fsvelasco.com', '09231234567');

INSERT INTO attorneys (id, name, email, contact, bookkeeper_id) VALUES
  ('ATT001', 'Atty. Clarissa Navarro', 'clarissa@law.com', '09281234567', 'BK001'),
  ('ATT002', 'Atty. Juan Reyes',       'jreyes@law.com',   '09291234567', 'BK002');

INSERT INTO spaces (id, unit_number, floor, status, monthly_rate) VALUES
  ('SP001', '101', '1st Floor', 'Occupied',          15000),
  ('SP002', '102', '1st Floor', 'Occupied',          18000),
  ('SP003', '103', '1st Floor', 'Available',         15000),
  ('SP004', '201', '2nd Floor', 'Occupied',          20000),
  ('SP005', '202', '2nd Floor', 'Available',         22000),
  ('SP006', '203', '2nd Floor', 'Under Maintenance', 20000),
  ('SP007', '301', '3rd Floor', 'Occupied',          25000),
  ('SP008', '302', '3rd Floor', 'Available',         25000);

INSERT INTO inquirers (id, first_name, last_name, email, contact, message, status, bookkeeper_id) VALUES
  ('INQ001', 'Ana',  'Lim',  'ana@email.com',  '09221234567', 'Interested in retail space',    'New',      'BK001'),
  ('INQ002', 'Mark', 'Cruz', 'mark@email.com', '09321234567', 'Looking for office space',      'Contacted','BK002'),
  ('INQ003', 'Lisa', 'Tan',  'lisa@email.com', '09421234567', 'Interested in top floor unit',  'New',      'BK001'),
  ('INQ004', 'Rico', 'Vega', 'rico@email.com', '09521234567', 'Need commercial space urgently','New',      'BK002');

INSERT INTO inquirer_spaces VALUES
  ('INQ001','SP003'),('INQ001','SP005'),
  ('INQ002','SP005'),
  ('INQ003','SP008'),
  ('INQ004','SP003');

INSERT INTO tenants (id, first_name, last_name, email, contact, business_name, business_type, move_in_date, bookkeeper_id) VALUES
  ('TN001', 'Juan',  'Dela Cruz', 'juan@email.com',  '09171234567', 'JDC Retail Store',  'Retail',          '2024-01-15', 'BK001'),
  ('TN002', 'Maria', 'Santos',    'maria@email.com', '09181234567', 'Santos Tech Shop',  'Technology',      '2024-03-01', 'BK001'),
  ('TN003', 'Pedro', 'Reyes',     'pedro@email.com', '09191234567', 'Reyes Food Court',  'Food & Beverage', '2023-11-20', 'BK002'),
  ('TN004', 'Jose',  'Garcia',    'jose@email.com',  '09231234567', 'Garcia Clothing',   'Apparel',         '2024-06-01', 'BK001');

-- TN001 has 2 spaces
INSERT INTO contracts (id, tenant_id, space_id, start_date, end_date, status) VALUES
  ('CON001', 'TN001', 'SP001', '2024-01-15', '2026-06-15', 'Active'),
  ('CON002', 'TN002', 'SP002', '2024-03-01', '2026-06-01', 'Active'),
  ('CON003', 'TN003', 'SP004', '2023-11-20', '2026-07-20', 'Active'),
  ('CON004', 'TN004', 'SP007', '2024-06-01', '2026-12-01', 'Active');

INSERT INTO payments (id, contract_id, amount, payment_date, method, status) VALUES
  ('PAY001', 'CON001', 15000, '2026-05-01', 'Bank Transfer', 'Paid'),
  ('PAY002', 'CON002', 18000, '2026-05-01', 'GCash',         'Paid'),
  ('PAY003', 'CON003', 20000, '2026-05-01', 'Bank Transfer', 'Pending'),
  ('PAY004', 'CON004', 25000, '2026-05-01', 'Cash',          'Paid'),
  ('PAY005', 'CON001', 15000, '2026-04-01', 'Bank Transfer', 'Paid'),
  ('PAY006', 'CON002', 18000, '2026-04-01', 'GCash',         'Paid');

-- ─────────────────────────────────────────
-- USEFUL VIEWS
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW v_active_contracts AS
SELECT
  c.id, c.tenant_id, c.space_id, c.start_date, c.end_date,
  c.extension_years, c.early_end_date, c.termination_note, c.status,
  t.first_name || ' ' || t.last_name AS tenant_name,
  t.business_name, t.contact AS tenant_contact,
  s.unit_number, s.floor, s.monthly_rate,
  (c.end_date - CURRENT_DATE) AS days_remaining
FROM contracts c
JOIN tenants t ON c.tenant_id = t.id
JOIN spaces s ON c.space_id = s.id;

CREATE OR REPLACE VIEW v_space_occupancy AS
SELECT
  s.*,
  COUNT(c.id) FILTER (WHERE c.status = 'Active') AS active_contracts,
  STRING_AGG(t.first_name || ' ' || t.last_name, ', ') FILTER (WHERE c.status = 'Active') AS tenant_names
FROM spaces s
LEFT JOIN contracts c ON s.id = c.space_id AND c.status = 'Active'
LEFT JOIN tenants t ON c.tenant_id = t.id
GROUP BY s.id;