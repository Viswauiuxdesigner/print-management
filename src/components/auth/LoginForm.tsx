"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  locale: string;
}

/**
 * Login form component.
 * Handles email/password validation, Supabase auth, loading and error states.
 */
export function LoginForm({ locale: _locale }: LoginFormProps) {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setGlobalError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        // Map Supabase errors to user-friendly messages (no technical details)
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_credentials")
        ) {
          setGlobalError(tErr("invalid_credentials"));
        } else if (
          error.message.includes("rate") ||
          error.message.includes("too many")
        ) {
          setGlobalError(tErr("too_many_requests"));
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          setGlobalError(tErr("network_error"));
        } else {
          setGlobalError(tErr("unexpected_error"));
        }
        return;
      }

      // Successful login — redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setGlobalError(tErr("network_error"));
    }
  }

  // Get translated field errors from validation keys
  function getFieldError(key?: string): string | undefined {
    if (!key) return undefined;
    try {
      return tErr(key as Parameters<typeof tErr>[0]);
    } catch {
      return key;
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-label="Sign in form"
    >
      {/* Global error alert */}
      {globalError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{globalError}</span>
        </div>
      )}

      {/* Email field */}
      <Input
        id="email"
        type="email"
        label={t("email_label")}
        placeholder={t("email_placeholder")}
        autoComplete="email"
        inputMode="email"
        error={getFieldError(errors.email?.message)}
        {...register("email")}
      />

      {/* Password field */}
      <div className="w-full">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {t("password_label")}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("password_placeholder")}
            autoComplete="current-password"
            aria-invalid={errors.password ? "true" : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={cn(
              "w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm text-slate-900",
              "placeholder:text-slate-400",
              "transition-colors duration-150",
              "outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
              "min-h-[48px]",
              errors.password
                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                : "border-slate-200"
            )}
            {...register("password")}
          />
          {/* Password visibility toggle */}
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "flex h-8 w-8 items-center justify-center",
              "rounded-md text-slate-400 hover:text-slate-600",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            )}
            aria-label={showPassword ? t("hide_password") : t("show_password")}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            role="alert"
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {getFieldError(errors.password?.message)}
          </p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded border-slate-300 text-brand-600",
                "focus:ring-2 focus:ring-brand-500 focus:ring-offset-0",
                "cursor-pointer accent-brand-600"
              )}
              {...register("rememberMe")}
            />
          </div>
          <span className="text-sm text-slate-600">{t("remember_me")}</span>
        </label>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
        aria-label={isSubmitting ? t("signing_in") : t("sign_in")}
      >
        {isSubmitting ? t("signing_in") : t("sign_in")}
      </Button>
    </form>
  );
}
