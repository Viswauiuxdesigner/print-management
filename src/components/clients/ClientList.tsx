"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Building2,
  Phone,
  MapPin,
  Eye,
  Edit2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import type { Client, ClientStatusFilter } from "@/lib/types/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toggleClientStatusAction } from "@/lib/actions/clients";

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const t = useTranslations("clients");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>("all");

  // Dialog state for soft deactivation / reactivation
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Client-side instant search & filter
  const filteredClients = useMemo(() => {
    return initialClients.filter((client) => {
      // Status filter
      if (statusFilter === "active" && !client.is_active) return false;
      if (statusFilter === "inactive" && client.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = client.name.toLowerCase().includes(q);
        const matchCompany = client.company_name?.toLowerCase().includes(q) ?? false;
        const matchPhone = client.phone?.toLowerCase().includes(q) ?? false;
        const matchAltPhone = client.alternate_phone?.toLowerCase().includes(q) ?? false;
        const matchCode = client.client_code?.toLowerCase().includes(q) ?? false;
        const matchCity = client.city?.toLowerCase().includes(q) ?? false;

        return (
          matchName ||
          matchCompany ||
          matchPhone ||
          matchAltPhone ||
          matchCode ||
          matchCity
        );
      }

      return true;
    });
  }, [initialClients, searchQuery, statusFilter]);

  // Handle status toggle (deactivate/activate)
  async function handleToggleStatus() {
    if (!selectedClient) return;

    setIsActionLoading(true);
    try {
      const newStatus = !selectedClient.is_active;
      const res = await toggleClientStatusAction(selectedClient.id, newStatus);
      if (res.success) {
        setIsDeactivateOpen(false);
        setSelectedClient(null);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setIsActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        <Link href="/clients/new">
          <Button variant="primary" size="md" className="w-full sm:w-auto shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t("add_client")}
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div
          className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto"
          role="group"
          aria-label="Filter clients by status"
        >
          {(["all", "active", "inactive"] as ClientStatusFilter[]).map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  active
                    ? "bg-white text-brand-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t(`filter_${tab}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state indicator */}
      {isPending && (
        <div className="text-center py-2 text-xs text-slate-400">
          Updating...
        </div>
      )}

      {/* ── EMPTY STATES ── */}
      {filteredClients.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Users className="h-8 w-8" aria-hidden="true" />
          </div>
          {searchQuery ? (
            <div className="mt-4 space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                {t("empty_search_title")}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t("empty_search_desc")}
              </p>
              <div className="pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </div>
            </div>
          ) : statusFilter === "inactive" ? (
            <div className="mt-4 space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                {t("empty_inactive_title")}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t("empty_inactive_desc")}
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                {t("empty_title")}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t("empty_desc")}
              </p>
              <div className="pt-4">
                <Link href="/clients/new">
                  <Button variant="primary" size="md">
                    <Plus className="h-4 w-4 mr-1.5" />
                    {t("add_client")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DESKTOP VIEW: CLEAN TABLE ── */}
      {filteredClients.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                  {t("col_code")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_client")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_company")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_phone")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_city")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_status")}
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                  {t("col_actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-50/75 transition-colors cursor-pointer"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-mono font-medium text-slate-500 sm:pl-6">
                    {client.client_code}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 font-semibold text-slate-900">
                    <Link
                      href={`/clients/${client.id}`}
                      className="hover:text-brand-600 focus:outline-none focus-visible:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                    {client.company_name ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {client.company_name}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600 font-mono text-xs">
                    {client.phone ? (
                      <a
                        href={`tel:${client.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 hover:text-brand-600 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {client.phone}
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600 text-xs">
                    {client.city ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {client.city}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <Badge variant={client.is_active ? "success" : "neutral"} size="sm">
                      {client.is_active ? t("status_active") : t("status_inactive")}
                    </Badge>
                  </td>
                  <td
                    className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/clients/${client.id}`}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title={t("action_view")}
                        aria-label={`${t("action_view")} ${client.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/clients/${client.id}/edit`}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title={t("action_edit")}
                        aria-label={`${t("action_edit")} ${client.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDeactivateOpen(true);
                        }}
                        className={`rounded-md p-1.5 transition-colors ${
                          client.is_active
                            ? "text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                            : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                        title={client.is_active ? t("action_deactivate") : t("action_activate")}
                        aria-label={
                          client.is_active
                            ? `${t("action_deactivate")} ${client.name}`
                            : `${t("action_activate")} ${client.name}`
                        }
                      >
                        {client.is_active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MOBILE VIEW: RESPONSIVE CARDS ── */}
      {filteredClients.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs active:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      {client.client_code}
                    </span>
                    <Badge variant={client.is_active ? "success" : "neutral"} size="sm">
                      {client.is_active ? t("status_active") : t("status_inactive")}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 pt-0.5">
                    {client.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/clients/${client.id}/edit`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`${t("action_edit")} ${client.name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {client.company_name && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">{client.company_name}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 font-mono text-slate-700 font-medium hover:text-brand-600"
                  >
                    <Phone className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">No phone</span>
                )}

                {client.city && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {client.city}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Soft Deactivation / Activation */}
      {selectedClient && (
        <ConfirmDialog
          isOpen={isDeactivateOpen}
          onClose={() => {
            setIsDeactivateOpen(false);
            setSelectedClient(null);
          }}
          onConfirm={handleToggleStatus}
          isLoading={isActionLoading}
          variant={selectedClient.is_active ? "danger" : "primary"}
          title={
            selectedClient.is_active
              ? t("deactivate_confirm_title")
              : t("activate_confirm_title")
          }
          description={
            selectedClient.is_active
              ? t("deactivate_confirm_desc")
              : t("activate_confirm_desc")
          }
          confirmText={
            selectedClient.is_active
              ? t("action_deactivate")
              : t("action_activate")
          }
          cancelText={t("action_cancel")}
        />
      )}
    </div>
  );
}
