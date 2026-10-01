"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Printer,
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  UserCheck,
  CalendarCheck,
  Wallet,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Download,
  CheckCircle2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { usePwaInstall } from "@/components/pwa/PwaProvider";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  locale: string;
  userEmail?: string | null;
}

export function AppHeader({ locale, userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [installing, setInstalling] = useState(false);

  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Print Management";

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // All 9 major application modules in requested order
  const navItems = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/clients",
      label: t("clients"),
      icon: Users,
      active: pathname.startsWith("/clients"),
    },
    {
      href: "/orders",
      label: t("orders"),
      icon: Package,
      active: pathname.startsWith("/orders"),
    },
    {
      href: "/expenses",
      label: t("expenses"),
      icon: Receipt,
      active: pathname.startsWith("/expenses"),
    },
    {
      href: "/employees",
      label: t("employees"),
      icon: UserCheck,
      active: pathname.startsWith("/employees"),
    },
    {
      href: "/attendance",
      label: t("attendance"),
      icon: CalendarCheck,
      active: pathname.startsWith("/attendance"),
    },
    {
      href: "/salary",
      label: t("salary"),
      icon: Wallet,
      active: pathname.startsWith("/salary"),
    },
    {
      href: "/billing",
      label: t("billing"),
      icon: CreditCard,
      active: pathname.startsWith("/billing"),
    },
    {
      href: "/reports",
      label: t("reports"),
      icon: BarChart3,
      active: pathname.startsWith("/reports"),
    },
  ];

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await promptInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs shadow-2xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 sm:gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand-600 shadow-2xs">
                  <Printer className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate max-w-[140px] sm:max-w-none">
                  {APP_NAME}
                </span>
              </Link>

              {/* Desktop Horizontal Navigation (>= lg screens) */}
              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all whitespace-nowrap",
                        item.active
                          ? "bg-brand-50 text-brand-700 font-semibold shadow-2xs border border-brand-100/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0",
                          item.active ? "text-brand-600" : "text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Header Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Optional PWA In-App Install Button on Desktop/Tablet if available */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                  title={t("install_app")}
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{t("install_app")}</span>
                </button>
              )}

              {/* Language Switcher */}
              <LanguageSwitcher currentLocale={locale} />

              {/* User Email Pill (Desktop) */}
              {userEmail && (
                <span
                  className="hidden 2xl:inline text-xs font-mono text-slate-500 max-w-[140px] truncate bg-slate-100 px-2 py-1 rounded-md"
                  title={userEmail}
                >
                  {userEmail}
                </span>
              )}

              {/* Sign Out Button (Desktop) */}
              <div className="hidden sm:block">
                <SignOutButton />
              </div>

              {/* Mobile / Tablet Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 cursor-pointer touch-target flex items-center justify-center"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Full-Featured Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 safe-top safe-bottom">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 shadow-2xs">
                    <Printer className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm tracking-tight">
                    {APP_NAME}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile Badge in Drawer */}
              {userEmail && (
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 truncate">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Signed in
                  </span>
                  <span className="font-medium font-mono text-slate-800 truncate block">
                    {userEmail}
                  </span>
                </div>
              )}

              {/* Navigation Items grouped under "MAIN" */}
              <div className="p-3 space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("main_section")}
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors touch-target",
                        item.active
                          ? "bg-brand-50 text-brand-700 font-semibold border border-brand-100/80 shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          item.active ? "text-brand-600" : "text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
              {/* In-App Install Option for Mobile */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleInstallClick();
                    setMobileMenuOpen(false);
                  }}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer touch-target"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>{t("install_app")}</span>
                </button>
              )}

              {isInstalled && (
                <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t("app_installed")}</span>
                </div>
              )}

              {/* Mobile Sign Out */}
              <div className="pt-1">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
