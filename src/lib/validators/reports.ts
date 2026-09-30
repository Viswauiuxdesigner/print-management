import { z } from "zod";

export const reportFilterSchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    client_id: z.string().optional(),
    employee_id: z.string().optional(),
    category_id: z.string().optional(),
    status: z.string().optional(),
    billing_type: z.string().optional(),
    payment_method: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

export type ReportFilterFormValues = z.infer<typeof reportFilterSchema>;
