-- Migration: 006_create_billing_payment_tables.sql
-- Description: Creates client_bills and client_payments tables, sequence, triggers, indexes, and RLS policies.

-- 1. Sequence for concurrency-safe sequential bill numbers (BILL-0001, BILL-0002, etc.)
CREATE SEQUENCE IF NOT EXISTS client_bill_number_seq START WITH 1 INCREMENT BY 1;

-- 2. Client Bills Table
CREATE TABLE IF NOT EXISTS public.client_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  bill_number VARCHAR(30) UNIQUE NOT NULL DEFAULT ('BILL-' || LPAD(nextval('client_bill_number_seq')::TEXT, 4, '0')),
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_type TEXT NOT NULL CHECK (billing_type IN ('kg', 'fixed', 'mixed')),
  billable_weight_kg NUMERIC(12, 3),
  rate_per_kg NUMERIC(12, 2),
  fixed_amount NUMERIC(12, 2),
  additional_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (additional_amount >= 0),
  gross_amount NUMERIC(12, 2) NOT NULL CHECK (gross_amount >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount >= 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  pending_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (pending_amount >= 0),
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Client Payments Table (Immutable ledger of payments)
CREATE TABLE IF NOT EXISTS public.client_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.client_bills(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank', 'upi', 'other')),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Triggers: Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS trg_client_bills_updated_at ON public.client_bills;
CREATE TRIGGER trg_client_bills_updated_at
  BEFORE UPDATE ON public.client_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_client_bills_client_id ON public.client_bills (client_id);
CREATE INDEX IF NOT EXISTS idx_client_bills_order_id ON public.client_bills (order_id);
CREATE INDEX IF NOT EXISTS idx_client_bills_bill_date ON public.client_bills (bill_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_bills_status ON public.client_bills (status);
CREATE INDEX IF NOT EXISTS idx_client_bills_created_at ON public.client_bills (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_payments_bill_id ON public.client_payments (bill_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_client_id ON public.client_payments (client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_payment_date ON public.client_payments (payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_payments_created_at ON public.client_payments (created_at DESC);

-- 6. Row Level Security (RLS)
ALTER TABLE public.client_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

-- Client Bills Policies
DROP POLICY IF EXISTS "Allow authorized roles to view client bills" ON public.client_bills;
CREATE POLICY "Allow authorized roles to view client bills"
  ON public.client_bills
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create client bills" ON public.client_bills;
CREATE POLICY "Allow authorized roles to create client bills"
  ON public.client_bills
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to update client bills" ON public.client_bills;
CREATE POLICY "Allow authorized roles to update client bills"
  ON public.client_bills
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

-- Client Payments Policies
DROP POLICY IF EXISTS "Allow authorized roles to view client payments" ON public.client_payments;
CREATE POLICY "Allow authorized roles to view client payments"
  ON public.client_payments
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );

DROP POLICY IF EXISTS "Allow authorized roles to create client payments" ON public.client_payments;
CREATE POLICY "Allow authorized roles to create client payments"
  ON public.client_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('owner', 'admin', 'manager')
  );
