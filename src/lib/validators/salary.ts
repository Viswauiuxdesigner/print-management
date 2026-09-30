import { z } from "zod";

export const salaryPaymentSchema = z.object({
  salary_record_id: z.string().uuid("salary_record_required"),
  payment_date: z.string().min(1, "payment_date_required"),
  amount: z.coerce
    .number({ invalid_type_error: "payment_amount_invalid" })
    .positive("payment_amount_positive")
    .max(9999999.99, "payment_amount_max"),
  payment_method: z.enum(["cash", "bank", "upi", "other"], {
    required_error: "payment_method_required",
  }),
  reference_number: z
    .string()
    .trim()
    .max(100, "reference_number_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  notes: z
    .string()
    .trim()
    .max(500, "notes_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type SalaryPaymentFormValues = z.infer<typeof salaryPaymentSchema>;

export const salaryAdvanceSchema = z.object({
  employee_id: z.string().uuid("employee_required"),
  advance_date: z.string().min(1, "advance_date_required"),
  amount: z.coerce
    .number({ invalid_type_error: "advance_amount_invalid" })
    .positive("advance_amount_positive")
    .max(9999999.99, "advance_amount_max"),
  reason: z
    .string()
    .trim()
    .max(250, "reason_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  payment_method: z.enum(["cash", "bank", "upi", "other"], {
    required_error: "payment_method_required",
  }),
  reference_number: z
    .string()
    .trim()
    .max(100, "reference_number_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  notes: z
    .string()
    .trim()
    .max(500, "notes_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type SalaryAdvanceFormValues = z.infer<typeof salaryAdvanceSchema>;

export const generateSalarySchema = z.object({
  employee_id: z.string().uuid("employee_required"),
  payroll_year: z.coerce.number().int().min(2020).max(2100),
  payroll_month: z.coerce.number().int().min(1).max(12),
  advance_deduction: z.coerce.number().min(0).default(0),
  other_deduction: z.coerce.number().min(0).default(0),
  notes: z
    .string()
    .trim()
    .max(500, "notes_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type GenerateSalaryFormValues = z.infer<typeof generateSalarySchema>;
