import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import { PrinterIcon } from "lucide-react";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: t("forgot_password_title"),
  };
}

/**
 * Forgot Password Page
 *
 * CONFIGURATION REQUIRED:
 * Before this works end-to-end, you must:
 * 1. Go to Supabase Dashboard → Authentication → URL Configuration
 * 2. Add your domain to "Redirect URLs": https://your-domain.com/reset-password
 * 3. (Optional) Customize the email template in Supabase Dashboard → Authentication → Email Templates
 */
export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const t = await getTranslations();

  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Print Management";

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 sm:px-8 border-b border-slate-100 bg-white">
        <Link
          href="/login"
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <PrinterIcon className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{APP_NAME}</span>
        </Link>
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* Form area */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("auth.forgot_password_title")}
            </h1>
            <p className="text-sm text-slate-500">
              {t("auth.forgot_password_subtitle")}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 sm:p-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
