-- Migration: 001_create_clients_table.sql
-- Description: Create clients table, sequence-based client_code generator, indexes, triggers, and RLS policies.

-- 1. Sequence for concurrency-safe sequential client codes (CL-0001, CL-0002, etc.)
CREATE SEQUENCE IF NOT EXISTS client_code_seq START WITH 1 INCREMENT BY 1;

-- 2. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code VARCHAR(30) UNIQUE NOT NULL DEFAULT ('CL-' || LPAD(nextval('client_code_seq')::TEXT, 4, '0')),
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Trigger Function: Concurrency-Safe Client Code Auto-Assignment
CREATE OR REPLACE FUNCTION public.set_client_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_code IS NULL OR NEW.client_code = '' THEN
    NEW.client_code := 'CL-' || LPAD(nextval('client_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_client_code ON public.clients;
CREATE TRIGGER trg_set_client_code
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_code();

-- 4. Trigger Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Search & Performance Indexes
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients (name);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients (company_name);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_client_code ON public.clients (client_code);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients (is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients (created_at DESC);

-- 6. Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    'owner' -- Default fallback for authenticated admin/owner if role meta is unpopulated
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: SELECT clients (Owner, Admin, Manager have access; Staff restricted)
DROP POLICY IF EXISTS "Allow authorized roles to view clients" ON public.clients;
CREATE POLICY "Allow authorized roles to view clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- Policy: INSERT clients (Owner, Admin, Manager have access; Staff restricted)
DROP POLICY IF EXISTS "Allow authorized roles to create clients" ON public.clients;
CREATE POLICY "Allow authorized roles to create clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- Policy: UPDATE clients (Owner, Admin, Manager have access; Staff restricted)
DROP POLICY IF EXISTS "Allow authorized roles to update clients" ON public.clients;
CREATE POLICY "Allow authorized roles to update clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- NOTE on DELETE: No DELETE policy is defined. Direct hard-delete is strictly disabled
-- to preserve historical audit trails and ensure data safety. Deactivation is managed via is_active = false.
