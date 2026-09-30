"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

/**
 * Sign Out button — client component.
 * Signs out from Supabase and redirects to login.
 */
export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="flex items-center gap-1.5 text-slate-600"
      aria-label={t("sign_out")}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{t("sign_out")}</span>
    </Button>
  );
}
