-- Migration: 003_create_expense_tables.sql
-- Description: Creates expense_categories and expenses tables, seeds default categories, triggers, indexes, and RLS policies.

-- 1. Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank', 'upi', 'other')),
  reference_number TEXT,
  notes TEXT,
  is_void BOOLEAN NOT NULL DEFAULT false,
  void_reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Seed Default Categories
INSERT INTO public.expense_categories (name_en, name_ta, sort_order)
VALUES
  ('Colors / Materials', 'வர்ணங்கள் / மூலப்பொருட்கள்', 1),
  ('Screens / Designs', 'திரைகள் / டிசைன்கள்', 2),
  ('Patterns', 'பேட்டர்ன்கள்', 3),
  ('Travel / Vehicle', 'பயணம் / வாகனம்', 4),
  ('Electricity', 'மின்சாரம்', 5),
  ('Tea / Food', 'தேநீர் / உணவு', 6),
  ('Maintenance', 'பராமரிப்பு', 7),
  ('Other', 'மற்றவை', 8)
ON CONFLICT DO NOTHING;

-- 4. Triggers: Auto-update updated_at timestamps
DROP TRIGGER IF EXISTS trg_expense_categories_updated_at ON public.expense_categories;
CREATE TRIGGER trg_expense_categories_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses (category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON public.expenses (payment_method);
CREATE INDEX IF NOT EXISTS idx_expenses_is_void ON public.expenses (is_void);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expense_categories_sort_order ON public.expense_categories (sort_order ASC);

-- 6. Row Level Security (RLS)
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Expense Categories Policies
DROP POLICY IF EXISTS "Allow authorized roles to view expense categories" ON public.expense_categories;
CREATE POLICY "Allow authorized roles to view expense categories"
  ON public.expense_categories FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow owners and admins to manage expense categories" ON public.expense_categories;
CREATE POLICY "Allow owners and admins to manage expense categories"
  ON public.expense_categories FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin'));

-- Expenses Policies (No DELETE policy allowed - voiding used instead)
DROP POLICY IF EXISTS "Allow authorized roles to view expenses" ON public.expenses;
CREATE POLICY "Allow authorized roles to view expenses"
  ON public.expenses FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to create expenses" ON public.expenses;
CREATE POLICY "Allow authorized roles to create expenses"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));

DROP POLICY IF EXISTS "Allow authorized roles to update expenses" ON public.expenses;
CREATE POLICY "Allow authorized roles to update expenses"
  ON public.expenses FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('owner', 'admin', 'manager'))
  WITH CHECK (public.get_current_user_role() IN ('owner', 'admin', 'manager'));
