import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { PrinterIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: t("sign_in"),
  };
}

/**
 * Login Page — Server Component
 * Layout: two-column on desktop, single-column on mobile.
 */
export default async function LoginPage() {
  const locale = await getLocale();
  const t = await getTranslations();

  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Print Management";

  return (
    <div className="min-h-dvh flex">
      {/* ── LEFT PANEL (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between bg-slate-900 p-12 overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Brand mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
              <PrinterIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              {APP_NAME}
            </span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              {t("branding.left_title")}
            </h1>
            <p className="text-lg text-slate-400 max-w-sm leading-relaxed">
              {t("branding.left_subtitle")}
            </p>
          </div>

          {/* Feature points */}
          <ul className="space-y-3" role="list">
            {[
              t("branding.left_point1"),
              t("branding.left_point2"),
              t("branding.left_point3"),
              t("branding.left_point4"),
            ].map((point) => (
              <li key={point} className="flex items-center gap-3 text-slate-300">
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600/20 ring-1 ring-brand-500/30"
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-brand-400" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                  </svg>
                </span>
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (login form) ── */}
      <div className="flex flex-1 flex-col min-h-dvh">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <PrinterIcon className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">{APP_NAME}</span>
          </div>
          {/* Desktop spacer */}
          <div className="hidden lg:block" />

          {/* Language switcher */}
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-sm space-y-8">
            {/* Heading */}
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t("auth.welcome_back")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("auth.sign_in_subtitle")}
              </p>
            </div>

            {/* Login form */}
            <LoginForm locale={locale} />

            {/* Forgot password link */}
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus-visible:underline transition-colors"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom safe area for mobile PWA */}
        <div className="h-safe-bottom" aria-hidden="true" />
      </div>
    </div>
  );
}
