-- Migration: 005_create_salary_payroll_tables.sql
-- Description: Create salary_records, salary_advances, and salary_payments tables, indexes, triggers, and RLS policies.

-- 1. Create Salary Records Table
CREATE TABLE IF NOT EXISTS public.salary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  payroll_year INTEGER NOT NULL CHECK (payroll_year >= 2020 AND payroll_year <= 2100),
  payroll_month INTEGER NOT NULL CHECK (payroll_month >= 1 AND payroll_month <= 12),
  salary_type TEXT NOT NULL CHECK (salary_type IN ('monthly', 'daily')),
  base_salary NUMERIC(12, 2) NOT NULL CHECK (base_salary >= 0),
  working_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  present_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  half_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  absent_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  leave_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  payable_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
  attendance_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (attendance_deduction >= 0),
  advance_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (advance_deduction >= 0),
  other_deduction NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (other_deduction >= 0),
  gross_salary NUMERIC(12, 2) NOT NULL CHECK (gross_salary >= 0),
  net_salary NUMERIC(12, 2) NOT NULL CHECK (net_salary >= 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  pending_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (pending_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank', 'upi', 'other') OR payment_method IS NULL),
  payment_reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_employee_payroll_period UNIQUE (employee_id, payroll_year, payroll_month)
);

-- 2. Create Salary Advances Table
CREATE TABLE IF NOT EXISTS public.salary_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  advance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  reason TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank', 'upi', 'other')),
  reference_number TEXT,
  notes TEXT,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  settled_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (settled_amount >= 0),
  settled_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Salary Payments Table (History of actual disbursements)
CREATE TABLE IF NOT EXISTS public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_record_id UUID NOT NULL REFERENCES public.salary_records(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank', 'upi', 'other')),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Triggers: Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS trg_salary_records_updated_at ON public.salary_records;
CREATE TRIGGER trg_salary_records_updated_at
  BEFORE UPDATE ON public.salary_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_salary_advances_updated_at ON public.salary_advances;
CREATE TRIGGER trg_salary_advances_updated_at
  BEFORE UPDATE ON public.salary_advances
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_salary_records_employee_id ON public.salary_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_period ON public.salary_records (payroll_year DESC, payroll_month DESC);
CREATE INDEX IF NOT EXISTS idx_salary_records_status ON public.salary_records (status);
CREATE INDEX IF NOT EXISTS idx_salary_records_created_at ON public.salary_records (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_salary_advances_employee_id ON public.salary_advances (employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_date ON public.salary_advances (advance_date DESC);
CREATE INDEX IF NOT EXISTS idx_salary_advances_is_settled ON public.salary_advances (is_settled);
CREATE INDEX IF NOT EXISTS idx_salary_advances_created_at ON public.salary_advances (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_salary_payments_record_id ON public.salary_payments (salary_record_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_date ON public.salary_payments (payment_date DESC);

-- 6. Row Level Security (RLS)
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- Salary Records Policies
DROP POLICY IF EXISTS "Allow authorized roles to view salary records" ON public.salary_records;
CREATE POLICY "Allow authorized roles to view salary records"
  ON public.salary_records
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create salary records" ON public.salary_records;
CREATE POLICY "Allow authorized roles to create salary records"
  ON public.salary_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to update salary records" ON public.salary_records;
CREATE POLICY "Allow authorized roles to update salary records"
  ON public.salary_records
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- Salary Advances Policies
DROP POLICY IF EXISTS "Allow authorized roles to view salary advances" ON public.salary_advances;
CREATE POLICY "Allow authorized roles to view salary advances"
  ON public.salary_advances
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create salary advances" ON public.salary_advances;
CREATE POLICY "Allow authorized roles to create salary advances"
  ON public.salary_advances
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to update salary advances" ON public.salary_advances;
CREATE POLICY "Allow authorized roles to update salary advances"
  ON public.salary_advances
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- Salary Payments Policies
DROP POLICY IF EXISTS "Allow authorized roles to view salary payments" ON public.salary_payments;
CREATE POLICY "Allow authorized roles to view salary payments"
  ON public.salary_payments
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create salary payments" ON public.salary_payments;
CREATE POLICY "Allow authorized roles to create salary payments"
  ON public.salary_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );
