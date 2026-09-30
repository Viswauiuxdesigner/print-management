import { z } from "zod";

export const expenseSchema = z.object({
  expense_date: z.string().min(1, "expense_date_required"),
  category_id: z.string().uuid("category_required"),
  amount: z.coerce
    .number({ invalid_type_error: "amount_invalid" })
    .positive("amount_positive")
    .max(99999999.99, "amount_max"),
  payment_method: z.enum(["cash", "bank", "upi", "other"], {
    required_error: "payment_method_required",
  }),
  description: z.string().max(500, "description_max").optional().nullable(),
  reference_number: z.string().max(100, "reference_number_max").optional().nullable(),
  notes: z.string().max(1000, "notes_max").optional().nullable(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const voidExpenseSchema = z.object({
  void_reason: z
    .string()
    .min(2, "void_reason_required")
    .max(500, "void_reason_max"),
});

export type VoidExpenseFormValues = z.infer<typeof voidExpenseSchema>;
