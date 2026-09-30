import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { PrinterIcon, LayoutDashboard } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { SignOutButton } from "@/components/auth/SignOutButton";

/**
 * Dashboard Page — Placeholder
 *
 * This is a minimal placeholder to confirm:
 * - Authentication is working
 * - Protected routes redirect correctly
 * - Session persists after login
 *
 * The actual dashboard will be built in a later module.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extra safety — middleware handles this, but guard here too
  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = await getTranslations();

  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Print Management";

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <PrinterIcon className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{APP_NAME}</span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <SignOutButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100">
              <LayoutDashboard
                className="h-10 w-10 text-brand-600"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {t("dashboard.welcome")} 👋
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("dashboard.signed_in_message")}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {t("dashboard.coming_soon")}
            </p>
          </div>

          {/* User info */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card text-left space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-sm font-medium text-slate-800 break-all">
              {user.email}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
