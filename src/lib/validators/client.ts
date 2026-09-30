import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "client_name_required")
    .max(100, "client_name_max"),
  company_name: z
    .string()
    .trim()
    .max(150, "company_name_max")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "phone_max")
    .optional()
    .or(z.literal("")),
  alternate_phone: z
    .string()
    .trim()
    .max(20, "phone_max")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("email_invalid")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(500, "address_max")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, "city_max")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "notes_max")
    .optional()
    .or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
