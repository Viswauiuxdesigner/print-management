import { z } from "zod";

export const createBillSchema = z
  .object({
    client_id: z.string().uuid("Please select a valid client"),
    order_id: z
      .string()
      .uuid("Invalid order selection")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    bill_date: z.string().min(1, "Bill date is required"),
    billing_type: z.enum(["kg", "fixed", "mixed"] as const, {
      required_error: "Please select a billing type",
    }),
    billable_weight_kg: z.coerce.number().min(0).nullable().optional(),
    rate_per_kg: z.coerce.number().min(0).nullable().optional(),
    fixed_amount: z.coerce.number().min(0).nullable().optional(),
    additional_amount: z.coerce.number().min(0).default(0),
    discount_amount: z.coerce.number().min(0).default(0),
    notes: z.string().nullable().optional().or(z.literal("").transform(() => null)),
  })
  .superRefine((data, ctx) => {
    if (data.billing_type === "kg") {
      if (!data.billable_weight_kg || data.billable_weight_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billable weight is required and must be greater than 0",
          path: ["billable_weight_kg"],
        });
      }
      if (!data.rate_per_kg || data.rate_per_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rate per kg is required and must be greater than 0",
          path: ["rate_per_kg"],
        });
      }
    } else if (data.billing_type === "fixed") {
      if (!data.fixed_amount || data.fixed_amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed amount is required and must be greater than 0",
          path: ["fixed_amount"],
        });
      }
    } else if (data.billing_type === "mixed") {
      if (!data.billable_weight_kg || data.billable_weight_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billable weight is required and must be greater than 0",
          path: ["billable_weight_kg"],
        });
      }
      if (!data.rate_per_kg || data.rate_per_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rate per kg is required and must be greater than 0",
          path: ["rate_per_kg"],
        });
      }
    }
  });

export type CreateBillFormValues = z.infer<typeof createBillSchema>;

export const updateBillSchema = createBillSchema;
export type UpdateBillFormValues = z.infer<typeof updateBillSchema>;

export const clientPaymentSchema = z.object({
  bill_id: z.string().uuid("Invalid bill ID"),
  client_id: z.string().uuid("Invalid client ID"),
  payment_date: z.string().min(1, "Payment date is required"),
  amount: z.coerce
    .number({ invalid_type_error: "Payment amount must be a number" })
    .positive("Payment amount must be greater than 0"),
  payment_method: z.enum(["cash", "bank", "upi", "other"] as const, {
    required_error: "Please select a payment method",
  }),
  reference_number: z
    .string()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  notes: z
    .string()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

export type ClientPaymentFormValues = z.infer<typeof clientPaymentSchema>;

export const cancelBillSchema = z.object({
  bill_id: z.string().uuid("Invalid bill ID"),
  reason: z.string().min(3, "Please provide a reason for cancelling this bill"),
});

export type CancelBillFormValues = z.infer<typeof cancelBillSchema>;
