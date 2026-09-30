import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Edit2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Package,
  CreditCard,
} from "lucide-react";
import type { Client } from "@/lib/types/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ClientStatusToggle } from "@/components/clients/ClientStatusToggle";

interface ClientDetailProps {
  client: Client;
}

export async function ClientDetail({ client }: ClientDetailProps) {
  const t = await getTranslations("clients");

  // Format dates safely
  const formattedCreatedAt = new Date(client.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedUpdatedAt = new Date(client.updated_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("action_back")}
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {client.client_code}
              </span>
              <Badge variant={client.is_active ? "success" : "neutral"} size="md">
                {client.is_active ? t("status_active") : t("status_inactive")}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words">
              {client.name}
            </h1>

            {client.company_name && (
              <p className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-600 break-words">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{client.company_name}</span>
              </p>
            )}
          </div>

          {/* Action buttons: Edit & Deactivate — responsive 2-column on mobile, inline on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
            <Link href={`/clients/${client.id}/edit`} className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto justify-center whitespace-nowrap">
                <Edit2 className="h-4 w-4 mr-1.5 shrink-0" />
                <span>{t("action_edit")}</span>
              </Button>
            </Link>

            <div className="w-full sm:w-auto">
              <ClientStatusToggle clientId={client.id} isActive={client.is_active} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Contact & Address Information */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* Contact Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("detail_contact_info")}</span>
          </h2>

          <dl className="space-y-3.5 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t("field_phone")}
              </dt>
              <dd className="mt-1">
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="font-mono text-brand-600 hover:underline font-medium text-base inline-block"
                  >
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </dd>
            </div>

            {client.alternate_phone && (
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t("field_alt_phone")}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${client.alternate_phone}`}
                    className="font-mono text-slate-700 hover:text-brand-600 hover:underline inline-block"
                  >
                    {client.alternate_phone}
                  </a>
                </dd>
              </div>
            )}

            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t("field_email")}
              </dt>
              <dd className="mt-1">
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="inline-flex items-center gap-1.5 text-brand-600 hover:underline break-all"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span>{client.email}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Address & Location Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
            <span>{t("detail_location_info")}</span>
          </h2>

          <dl className="space-y-3.5 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t("field_city")}
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {client.city || <span className="text-slate-400 italic font-normal">Not provided</span>}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t("field_address")}
              </dt>
              <dd className="mt-1 text-slate-700 whitespace-pre-line leading-relaxed break-words">
                {client.address || <span className="text-slate-400 italic font-normal">Not provided</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Notes Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-600 shrink-0" />
          <span>{t("detail_notes")}</span>
        </h2>
        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed break-words">
          {client.notes ? (
            client.notes
          ) : (
            <span className="text-slate-400 italic">{t("detail_no_notes")}</span>
          )}
        </div>
      </div>

      {/* ── FUTURE EXTENSION FOUNDATIONS (CLEAN EMPTY STATES) ── */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* Orders Foundation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{t("detail_orders_title")}</span>
            </h2>
            <span className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
              Phase 3
            </span>
          </div>
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="max-w-xs mx-auto text-xs text-slate-400 leading-relaxed">
              {t("detail_orders_empty")}
            </p>
          </div>
        </div>

        {/* Financial Summary Foundation — Balanced Mobile & Desktop Layout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{t("detail_financial_title")}</span>
            </h2>
            <span className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
              Phase 5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-1">
            <div className="flex sm:flex-col items-center justify-between sm:justify-center rounded-xl bg-slate-50 border border-slate-100 p-3 text-left sm:text-center">
              <span className="text-xs font-medium text-slate-600">{t("detail_billed")}</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 sm:mt-1 font-mono">₹0</span>
            </div>
            <div className="flex sm:flex-col items-center justify-between sm:justify-center rounded-xl bg-slate-50 border border-slate-100 p-3 text-left sm:text-center">
              <span className="text-xs font-medium text-slate-600">{t("detail_paid")}</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 sm:mt-1 font-mono">₹0</span>
            </div>
            <div className="flex sm:flex-col items-center justify-between sm:justify-center rounded-xl bg-slate-50 border border-slate-100 p-3 text-left sm:text-center">
              <span className="text-xs font-medium text-slate-600">{t("detail_outstanding")}</span>
              <span className="text-base sm:text-lg font-bold text-slate-900 sm:mt-1 font-mono">₹0</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pt-1">
            {t("detail_financial_empty")}
          </p>
        </div>
      </div>

      {/* Activity & Audit Foundation */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {t("detail_created_on")}: <strong className="text-slate-800 font-semibold">{formattedCreatedAt}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            {t("detail_last_updated")}: <strong className="text-slate-800 font-semibold">{formattedUpdatedAt}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
