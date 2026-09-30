import { z } from "zod";

export const orderSchema = z.object({
  client_id: z.string().min(1, "client_required"),
  order_date: z.string().min(1, "order_date_required"),
  number_of_rolls: z.coerce
    .number({ invalid_type_error: "rolls_number_invalid" })
    .int("rolls_number_integer")
    .min(1, "rolls_number_min"),
  received_weight_kg: z.coerce
    .number({ invalid_type_error: "weight_invalid" })
    .positive("weight_positive"),
  notes: z.string().trim().max(1000, "notes_max").optional().or(z.literal("")),
  status: z
    .enum(["received", "processing", "printing", "completed", "delivered", "cancelled"])
    .optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const rollSchema = z.object({
  roll_number: z.string().trim().min(1, "roll_number_required").max(50, "roll_number_max"),
  received_weight_kg: z.coerce
    .number({ invalid_type_error: "weight_invalid" })
    .nonnegative("weight_nonnegative"),
  color: z.string().trim().max(50).optional().or(z.literal("")),
  pattern: z.string().trim().max(100).optional().or(z.literal("")),
  design_info: z.string().trim().max(150).optional().or(z.literal("")),
  screen_number: z.string().trim().max(50).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["pending", "printing", "printed", "delivered"]).default("pending"),
});

export type RollFormValues = z.infer<typeof rollSchema>;

export const productionEntrySchema = z.object({
  order_id: z.string().min(1, "order_id_required"),
  order_roll_id: z.string().optional().nullable().or(z.literal("")),
  entry_date: z.string().min(1, "entry_date_required"),
  printed_weight_kg: z.coerce
    .number({ invalid_type_error: "weight_invalid" })
    .positive("weight_positive"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ProductionEntryFormValues = z.infer<typeof productionEntrySchema>;

export const deliveryEntrySchema = z.object({
  order_id: z.string().min(1, "order_id_required"),
  delivery_date: z.string().min(1, "delivery_date_required"),
  delivered_weight_kg: z.coerce
    .number({ invalid_type_error: "weight_invalid" })
    .positive("weight_positive"),
  received_by: z.string().trim().max(100).optional().or(z.literal("")),
  delivery_notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type DeliveryEntryFormValues = z.infer<typeof deliveryEntrySchema>;
