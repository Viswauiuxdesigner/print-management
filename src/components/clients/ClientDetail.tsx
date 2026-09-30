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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {client.client_code}
              </span>
              <Badge variant={client.is_active ? "success" : "neutral"} size="md">
                {client.is_active ? t("status_active") : t("status_inactive")}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {client.name}
            </h1>

            {client.company_name && (
              <p className="flex items-center gap-2 text-base font-medium text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                {client.company_name}
              </p>
            )}
          </div>

          {/* Action buttons: Edit & Deactivate */}
          <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
            <Link href={`/clients/${client.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-1.5" />
                {t("action_edit")}
              </Button>
            </Link>

            <ClientStatusToggle clientId={client.id} isActive={client.is_active} />
          </div>
        </div>
      </div>

      {/* Grid: Contact & Address Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-600" />
            {t("detail_contact_info")}
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
                    className="font-mono text-brand-600 hover:underline font-medium text-base"
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
                    className="font-mono text-slate-700 hover:text-brand-600 hover:underline"
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
                    className="inline-flex items-center gap-1.5 text-brand-600 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {client.email}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Address & Location Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-600" />
            {t("detail_location_info")}
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
              <dd className="mt-1 text-slate-700 whitespace-pre-line leading-relaxed">
                {client.address || <span className="text-slate-400 italic font-normal">Not provided</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Notes Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-600" />
          {t("detail_notes")}
        </h2>
        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {client.notes ? (
            client.notes
          ) : (
            <span className="text-slate-400 italic">{t("detail_no_notes")}</span>
          )}
        </div>
      </div>

      {/* ── FUTURE EXTENSION FOUNDATIONS (CLEAN EMPTY STATES) ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Orders Foundation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400" />
              {t("detail_orders_title")}
            </h2>
            <span className="text-xs font-medium text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
              Phase 3
            </span>
          </div>
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="max-w-xs mx-auto text-xs text-slate-400">
              {t("detail_orders_empty")}
            </p>
          </div>
        </div>

        {/* Financial Summary Foundation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              {t("detail_financial_title")}
            </h2>
            <span className="text-xs font-medium text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
              Phase 5
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-2xs font-medium text-slate-400 uppercase">{t("detail_billed")}</p>
              <p className="text-sm font-bold text-slate-700 mt-1">₹0</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-2xs font-medium text-slate-400 uppercase">{t("detail_paid")}</p>
              <p className="text-sm font-bold text-slate-700 mt-1">₹0</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-2xs font-medium text-slate-400 uppercase">{t("detail_outstanding")}</p>
              <p className="text-sm font-bold text-slate-700 mt-1">₹0</p>
            </div>
          </div>

          <p className="text-center text-2xs text-slate-400">
            {t("detail_financial_empty")}
          </p>
        </div>
      </div>

      {/* Activity & Audit Foundation */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {t("detail_created_on")}: <strong className="text-slate-700">{formattedCreatedAt}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {t("detail_last_updated")}: <strong className="text-slate-700">{formattedUpdatedAt}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
