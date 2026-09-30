-- Migration: 002_create_orders_and_production_tables.sql
-- Description: Creates orders, order_rolls, production_entries, delivery_entries tables, sequence, triggers, indexes, and RLS policies.

-- 1. Sequence for concurrency-safe sequential order numbers (ORD-0001, ORD-0002, etc.)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  order_number VARCHAR(30) UNIQUE NOT NULL DEFAULT ('ORD-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  number_of_rolls INTEGER NOT NULL DEFAULT 1 CHECK (number_of_rolls > 0),
  received_weight_kg NUMERIC(10, 2) NOT NULL CHECK (received_weight_kg > 0),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'printing', 'completed', 'delivered', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Order Rolls Table (Roll-level tracking)
CREATE TABLE IF NOT EXISTS public.order_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  roll_number VARCHAR(30) NOT NULL,
  received_weight_kg NUMERIC(10, 2) NOT NULL CHECK (received_weight_kg >= 0),
  color TEXT,
  pattern TEXT,
  design_info TEXT,
  screen_number TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'printed', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Production Entries Table (Log of printing activities)
CREATE TABLE IF NOT EXISTS public.production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_roll_id UUID REFERENCES public.order_rolls(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  printed_weight_kg NUMERIC(10, 2) NOT NULL CHECK (printed_weight_kg >= 0),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Delivery Entries Table (Log of client delivery handovers)
CREATE TABLE IF NOT EXISTS public.delivery_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivered_weight_kg NUMERIC(10, 2) NOT NULL CHECK (delivered_weight_kg > 0),
  delivery_notes TEXT,
  received_by TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Trigger Function: Concurrency-Safe Order Number Auto-Assignment
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON public.orders;
CREATE TRIGGER trg_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- 7. Trigger Functions: Auto-update updated_at timestamps
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_order_rolls_updated_at ON public.order_rolls;
CREATE TRIGGER trg_order_rolls_updated_at
  BEFORE UPDATE ON public.order_rolls
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_production_entries_updated_at ON public.production_entries;
CREATE TRIGGER trg_production_entries_updated_at
  BEFORE UPDATE ON public.production_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_delivery_entries_updated_at ON public.delivery_entries;
CREATE TRIGGER trg_delivery_entries_updated_at
  BEFORE UPDATE ON public.delivery_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 8. Indexes for Performance & Search
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders (client_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_rolls_order_id ON public.order_rolls (order_id);
CREATE INDEX IF NOT EXISTS idx_order_rolls_status ON public.order_rolls (status);

CREATE INDEX IF NOT EXISTS idx_production_entries_order_id ON public.production_entries (order_id);
CREATE INDEX IF NOT EXISTS idx_production_entries_order_roll_id ON public.production_entries (order_roll_id);
CREATE INDEX IF NOT EXISTS idx_production_entries_entry_date ON public.production_entries (entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_entries_order_id ON public.delivery_entries (order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_entries_delivery_date ON public.delivery_entries (delivery_date DESC);

-- 9. Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_entries ENABLE ROW LEVEL SECURITY;

-- Orders Policies
DROP POLICY IF EXISTS "Allow authorized roles to view orders" ON public.orders;
CREATE POLICY "Allow authorized roles to view orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to create orders" ON public.orders;
CREATE POLICY "Allow authorized roles to create orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to update orders" ON public.orders;
CREATE POLICY "Allow authorized roles to update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'))
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

-- Order Rolls Policies
DROP POLICY IF EXISTS "Allow authorized roles to view rolls" ON public.order_rolls;
CREATE POLICY "Allow authorized roles to view rolls"
  ON public.order_rolls FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to create rolls" ON public.order_rolls;
CREATE POLICY "Allow authorized roles to create rolls"
  ON public.order_rolls FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to update rolls" ON public.order_rolls;
CREATE POLICY "Allow authorized roles to update rolls"
  ON public.order_rolls FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'))
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to delete rolls" ON public.order_rolls;
CREATE POLICY "Allow authorized roles to delete rolls"
  ON public.order_rolls FOR DELETE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

-- Production Entries Policies
DROP POLICY IF EXISTS "Allow authorized roles to view production" ON public.production_entries;
CREATE POLICY "Allow authorized roles to view production"
  ON public.production_entries FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to create production" ON public.production_entries;
CREATE POLICY "Allow authorized roles to create production"
  ON public.production_entries FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to update production" ON public.production_entries;
CREATE POLICY "Allow authorized roles to update production"
  ON public.production_entries FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'))
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

-- Delivery Entries Policies
DROP POLICY IF EXISTS "Allow authorized roles to view delivery" ON public.delivery_entries;
CREATE POLICY "Allow authorized roles to view delivery"
  ON public.delivery_entries FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to create delivery" ON public.delivery_entries;
CREATE POLICY "Allow authorized roles to create delivery"
  ON public.delivery_entries FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to update delivery" ON public.delivery_entries;
CREATE POLICY "Allow authorized roles to update delivery"
  ON public.delivery_entries FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'))
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));
