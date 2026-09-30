"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle } from "lucide-react";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/**
 * ForgotPasswordForm component.
 * Sends a password reset email via Supabase Auth.
 *
 * IMPORTANT: The redirect URL in Supabase must be configured in:
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 * Add: https://your-domain.com/reset-password
 */
export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");

  const [sent, setSent] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setGlobalError(null);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          // ← Update this to your actual domain when deploying
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        if (error.message.includes("rate")) {
          setGlobalError(tErr("too_many_requests"));
        } else {
          setGlobalError(tErr("unexpected_error"));
        }
        return;
      }

      // Always show success to prevent email enumeration attacks
      setSent(true);
    } catch {
      setGlobalError(tErr("network_error"));
    }
  }

  function getFieldError(key?: string): string | undefined {
    if (!key) return undefined;
    try {
      return tErr(key as Parameters<typeof tErr>[0]);
    } catch {
      return key;
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-2" role="status" aria-live="polite">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-600">{t("reset_link_sent")}</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 focus:outline-none focus-visible:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("back_to_login")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-label="Reset password form"
    >
      {globalError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{globalError}</span>
        </div>
      )}

      <Input
        id="reset-email"
        type="email"
        label={t("email_label")}
        placeholder={t("email_placeholder")}
        autoComplete="email"
        inputMode="email"
        error={getFieldError(errors.email?.message)}
        {...register("email")}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? t("sending") : t("send_reset_link")}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t("back_to_login")}
        </Link>
      </div>
    </form>
  );
}
