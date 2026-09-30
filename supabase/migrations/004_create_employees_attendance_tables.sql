-- Migration: 004_create_employees_attendance_tables.sql
-- Description: Create employees and attendance tables, sequence, triggers, indexes, and RLS policies.

-- 1. Sequence for concurrency-safe sequential employee codes (EMP-0001, EMP-0002, etc.)
CREATE SEQUENCE IF NOT EXISTS employee_code_seq START WITH 1 INCREMENT BY 1;

-- 2. Create Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(30) UNIQUE NOT NULL DEFAULT ('EMP-' || LPAD(nextval('employee_code_seq')::TEXT, 4, '0')),
  full_name TEXT NOT NULL,
  phone TEXT,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  designation TEXT,
  joining_date DATE,
  salary_type TEXT NOT NULL DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'daily')),
  salary_amount NUMERIC(12, 2) DEFAULT 0 CHECK (salary_amount >= 0),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Trigger Function: Concurrency-Safe Employee Code Auto-Assignment
CREATE OR REPLACE FUNCTION public.set_employee_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
    NEW.employee_code := 'EMP-' || LPAD(nextval('employee_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_employee_code ON public.employees;
CREATE TRIGGER trg_set_employee_code
  BEFORE INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_employee_code();

-- 4. Trigger Function: Auto-update updated_at timestamp on employees
DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, attendance_date)
);

-- 6. Trigger Function: Auto-update updated_at timestamp on attendance
DROP TRIGGER IF EXISTS trg_attendance_updated_at ON public.attendance;
CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees (employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_full_name ON public.employees (full_name);
CREATE INDEX IF NOT EXISTS idx_employees_phone ON public.employees (phone);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON public.employees (designation);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees (is_active);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON public.employees (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance (status);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON public.attendance (employee_id, attendance_date);

-- 8. Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Employees RLS Policies
DROP POLICY IF EXISTS "Allow authorized roles to view employees" ON public.employees;
CREATE POLICY "Allow authorized roles to view employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create employees" ON public.employees;
CREATE POLICY "Allow authorized roles to create employees"
  ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to update employees" ON public.employees;
CREATE POLICY "Allow authorized roles to update employees"
  ON public.employees
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- Attendance RLS Policies
DROP POLICY IF EXISTS "Allow authorized roles to view attendance" ON public.attendance;
CREATE POLICY "Allow authorized roles to view attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create attendance" ON public.attendance;
CREATE POLICY "Allow authorized roles to create attendance"
  ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to update attendance" ON public.attendance;
CREATE POLICY "Allow authorized roles to update attendance"
  ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );
