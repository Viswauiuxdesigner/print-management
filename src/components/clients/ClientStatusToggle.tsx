"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toggleClientStatusAction } from "@/lib/actions/clients";

interface ClientStatusToggleProps {
  clientId: string;
  isActive: boolean;
}

export function ClientStatusToggle({ clientId, isActive }: ClientStatusToggleProps) {
  const t = useTranslations("clients");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    try {
      const res = await toggleClientStatusAction(clientId, !isActive);
      if (res.success) {
        setIsOpen(false);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={isActive ? "outline" : "secondary"}
        size="sm"
        onClick={() => setIsOpen(true)}
        className={
          isActive
            ? "text-slate-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
            : "text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
        }
      >
        {isActive ? (
          <>
            <UserX className="h-4 w-4 mr-1.5 text-slate-400" />
            {t("action_deactivate")}
          </>
        ) : (
          <>
            <UserCheck className="h-4 w-4 mr-1.5 text-emerald-600" />
            {t("action_activate")}
          </>
        )}
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleToggle}
        isLoading={isLoading}
        variant={isActive ? "danger" : "primary"}
        title={
          isActive
            ? t("deactivate_confirm_title")
            : t("activate_confirm_title")
        }
        description={
          isActive
            ? t("deactivate_confirm_desc")
            : t("activate_confirm_desc")
        }
        confirmText={
          isActive
            ? t("action_deactivate")
            : t("action_activate")
        }
        cancelText={t("action_cancel")}
      />
    </>
  );
}
