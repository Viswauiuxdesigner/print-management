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
  ChevronRight,
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

  // Close mobile drawer on escape key
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

  // All 9 major application modules in requested standard order
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

  // Derive active module title for desktop top bar
  const activeNavItem = navItems.find((item) => item.active) || navItems[0];

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await promptInstall();
    } finally {
      setInstalling(false);
    }
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          1. DESKTOP PERSISTENT LEFT SIDEBAR (>= 1024px)
          Fixed width 256px (w-64), sticky/fixed full height
      ────────────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 h-full bg-white border-r border-slate-200 z-40 flex-col justify-between overflow-y-auto no-scrollbar select-none"
        aria-label="Desktop Sidebar Navigation"
      >
        {/* Top: Branding & Navigation Links */}
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-2xs shrink-0">
                <Printer className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate block">
                  {APP_NAME}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Management System
                </span>
              </div>
            </Link>
          </div>

          {/* MAIN Module Navigation */}
          <nav className="p-3 space-y-1" aria-label="Main Modules">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t("main_section")}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium transition-all group min-h-[44px]",
                    item.active
                      ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 xl:h-4.5 xl:w-4.5 shrink-0 transition-colors",
                      item.active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span className="truncate leading-snug">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Utility, Account & Logout Area */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          {/* PWA In-App Install Button (Only when installable on desktop Chrome/Edge) */}
          {isInstallable && (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[38px]"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>{t("install_app")}</span>
            </button>
          )}

          {isInstalled && (
            <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{t("app_installed")}</span>
            </div>
          )}

          {/* Language Switcher in Sidebar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-slate-500">Language</span>
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {/* User Profile Card */}
          {userEmail && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="h-7 w-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-mono text-slate-800 font-medium truncate block" title={userEmail}>
                  {userEmail}
                </span>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <div className="pt-0.5">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          2. DESKTOP SIMPLE TOP BAR (>= 1024px)
          Fixed top bar offset by sidebar (lg:ml-64)
      ────────────────────────────────────────────────────────── */}
      <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xs border-b border-slate-200 lg:ml-64 items-center justify-between px-6 lg:px-8">
        {/* Left: Breadcrumb / Section Title */}
        <div className="flex items-center gap-2 text-slate-800">
          <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <activeNavItem.icon className="h-4 w-4 text-brand-600" />
            <span>{activeNavItem.label}</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Overview</span>
        </div>

        {/* Right: Quick actions & user info */}
        <div className="flex items-center gap-3">
          {isInstallable && (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={installing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t("install_app")}</span>
            </button>
          )}

          <LanguageSwitcher currentLocale={locale} />

          {userEmail && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-7 w-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <span className="text-xs font-mono text-slate-600 max-w-[150px] truncate" title={userEmail}>
                {userEmail}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          3. MOBILE & TABLET TOP HEADER (< 1024px)
          Compact top bar with hamburger toggle
      ────────────────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 flex items-center justify-between px-4">
        {/* Brand Logo & Title */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 shadow-2xs">
            <Printer className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[160px] sm:max-w-none">
            {APP_NAME}
          </span>
        </Link>

        {/* Right: Language switcher & Hamburger button */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          4. MOBILE & TABLET FULL NAVIGATION DRAWER (< 1024px)
      ────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
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
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile Badge in Drawer */}
              {userEmail && (
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 truncate flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                      Signed in
                    </span>
                    <span className="font-medium font-mono text-slate-800 truncate block">
                      {userEmail}
                    </span>
                  </div>
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[48px]",
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
                      <span className="leading-snug">{item.label}</span>
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
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[48px]"
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
