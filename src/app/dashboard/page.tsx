import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import {
  LayoutDashboard,
  Users,
  ArrowRight,
  Package,
  Receipt,
  UserCheck,
  CalendarCheck,
  CreditCard,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";

/**
 * Dashboard Page — Protected Landing
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

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full">
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
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-2">
            <Link href="/attendance" className="block w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-between shadow-xs group"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-brand-200 group-hover:text-white" />
                  {t("dashboard.view_attendance")}
                </span>
                <ArrowRight className="h-4 w-4 text-brand-200 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>

            <Link href="/orders" className="block w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-between shadow-xs group"
              >
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-slate-400 group-hover:text-slate-700" />
                  {t("dashboard.view_orders")}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>

            <Link href="/expenses" className="block w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-between shadow-xs group"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-400 group-hover:text-slate-700" />
                  {t("dashboard.view_expenses")}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Link href="/billing" className="block w-full">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center text-xs sm:text-sm"
                >
                  <CreditCard className="h-4 w-4 mr-1.5 text-brand-600" />
                  <span>{t("dashboard.view_billing")}</span>
                </Button>
              </Link>

              <Link href="/salary" className="block w-full">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center text-xs sm:text-sm"
                >
                  <Receipt className="h-4 w-4 mr-1.5 text-slate-500" />
                  <span>{t("dashboard.view_salary")}</span>
                </Button>
              </Link>

              <Link href="/clients" className="block w-full">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center text-xs sm:text-sm"
                >
                  <Users className="h-4 w-4 mr-1.5 text-slate-400" />
                  <span>{t("dashboard.view_clients")}</span>
                </Button>
              </Link>

              <Link href="/employees" className="block w-full">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center text-xs sm:text-sm"
                >
                  <UserCheck className="h-4 w-4 mr-1.5 text-slate-400" />
                  <span>{t("dashboard.view_employees")}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* User info */}
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-2xs text-left space-y-1">
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
