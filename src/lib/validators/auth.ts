import { z } from "zod";

/**
 * Login form validation schema.
 * Used by react-hook-form for client-side validation.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "email_required")
    .email("email_invalid"),
  password: z
    .string()
    .min(1, "password_required")
    .min(8, "password_min"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Forgot password form validation schema.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "email_required")
    .email("email_invalid"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
