import { z } from "zod";

export const employeeSchema = z.object({
  full_name: z
    .string({ required_error: "full_name_required" })
    .trim()
    .min(1, "full_name_required")
    .max(150, "full_name_max"),
  phone: z
    .string()
    .trim()
    .max(20, "phone_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  alternate_phone: z
    .string()
    .trim()
    .max(20, "alt_phone_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  email: z
    .string()
    .trim()
    .email("email_invalid")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : null)),
  address: z
    .string()
    .trim()
    .max(500, "address_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  designation: z
    .string()
    .trim()
    .max(100, "designation_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  joining_date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  salary_type: z.enum(["monthly", "daily"], {
    required_error: "salary_type_required",
  }).default("monthly"),
  salary_amount: z.coerce
    .number({ invalid_type_error: "salary_amount_invalid" })
    .min(0, "salary_amount_min")
    .max(9999999.99, "salary_amount_max")
    .default(0),
  notes: z
    .string()
    .trim()
    .max(1000, "notes_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const attendanceRecordSchema = z.object({
  employee_id: z.string().uuid("employee_required"),
  attendance_date: z.string().min(1, "attendance_date_required"),
  status: z.enum(["present", "absent", "half_day", "leave"], {
    required_error: "status_required",
  }),
  notes: z
    .string()
    .trim()
    .max(500, "notes_max")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type AttendanceRecordValues = z.infer<typeof attendanceRecordSchema>;
