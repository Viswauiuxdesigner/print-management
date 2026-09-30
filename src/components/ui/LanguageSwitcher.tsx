"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  currentLocale: string;
  className?: string;
}

/**
 * Language switcher — toggles between English and Tamil.
 * Saves the preference as a cookie and reloads the page so
 * the server re-renders with the new locale.
 */
export function LanguageSwitcher({
  currentLocale,
  className,
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    startTransition(() => {
      // Set locale cookie
      document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      // Reload to apply new locale
      window.location.reload();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5",
        isPending && "opacity-60 pointer-events-none",
        className
      )}
      role="group"
      aria-label="Select language"
    >
      <button
        onClick={() => switchLocale("en")}
        disabled={isPending}
        aria-pressed={currentLocale === "en"}
        className={cn(
          "px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          currentLocale === "en"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("ta")}
        disabled={isPending}
        aria-pressed={currentLocale === "ta"}
        className={cn(
          "px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          currentLocale === "ta"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        தமிழ்
      </button>
    </div>
  );
}
