"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Package,
  Calendar,
  Layers,
  Eye,
  Edit2,
  Building2,
} from "lucide-react";
import type { OrderListItem, OrderStatus } from "@/lib/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface OrderListProps {
  initialOrders: OrderListItem[];
}

export function OrderList({ initialOrders }: OrderListProps) {
  const t = useTranslations("orders");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = order.order_number.toLowerCase().includes(q);
        const matchClient = order.client?.name?.toLowerCase().includes(q) ?? false;
        const matchCompany = order.client?.company_name?.toLowerCase().includes(q) ?? false;
        const matchNotes = order.notes?.toLowerCase().includes(q) ?? false;
        return matchNum || matchClient || matchCompany || matchNotes;
      }

      return true;
    });
  }, [initialOrders, searchQuery, statusFilter]);

  function getStatusBadgeVariant(
    status: OrderStatus
  ): "brand" | "warning" | "success" | "neutral" | "danger" {
    switch (status) {
      case "received":
        return "brand";
      case "processing":
      case "printing":
        return "warning";
      case "completed":
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "neutral";
    }
  }

  const statusTabs: (OrderStatus | "all")[] = [
    "all",
    "received",
    "processing",
    "printing",
    "completed",
    "delivered",
  ];

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        <Link href="/orders/new">
          <Button variant="primary" size="md" className="w-full sm:w-auto shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t("add_order")}
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search Bar */}
        <div className="relative w-full">
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

        {/* Status Filter Tabs (Scrollable on small screens) */}
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
          role="group"
          aria-label="Filter orders by status"
        >
          {statusTabs.map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {t(`filter_${tab}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EMPTY STATES ── */}
      {filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Package className="h-8 w-8" aria-hidden="true" />
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
          ) : (
            <div className="mt-4 space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                {t("empty_title")}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t("empty_desc")}
              </p>
              <div className="pt-4">
                <Link href="/orders/new">
                  <Button variant="primary" size="md">
                    <Plus className="h-4 w-4 mr-1.5" />
                    {t("add_order")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DESKTOP VIEW: CLEAN TABLE ── */}
      {filteredOrders.length > 0 && (
        <div className="hidden lg:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                  {t("col_order_num")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_client")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  {t("col_date")}
                </th>
                <th scope="col" className="px-3 py-3.5 text-center">
                  {t("col_rolls")}
                </th>
                <th scope="col" className="px-3 py-3.5 text-right font-mono">
                  {t("col_received_wt")}
                </th>
                <th scope="col" className="px-3 py-3.5 text-right font-mono">
                  {t("col_printed_wt")}
                </th>
                <th scope="col" className="px-3 py-3.5 text-right font-mono">
                  {t("col_delivered_wt")}
                </th>
                <th scope="col" className="px-3 py-3.5 text-right font-mono">
                  {t("col_remaining_wt")}
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
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/75 transition-colors cursor-pointer"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-mono font-bold text-brand-600 sm:pl-6">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="font-semibold text-slate-900">
                      {order.client?.name ?? "Unknown Client"}
                    </div>
                    {order.client?.company_name && (
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        <span>{order.client.company_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600 text-xs">
                    {order.order_date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      <Layers className="h-3 w-3 text-slate-400" />
                      {order.number_of_rolls}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right font-mono font-medium text-slate-800">
                    {order.received_weight_kg.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right font-mono text-slate-600">
                    {order.total_printed_weight.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right font-mono text-slate-600">
                    {order.total_delivered_weight.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right font-mono font-semibold text-brand-600">
                    {order.remaining_weight.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                      {t(`status_${order.status}`)}
                    </Badge>
                  </td>
                  <td
                    className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/orders/${order.id}`}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title={t("action_view")}
                        aria-label={`${t("action_view")} ${order.order_number}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/orders/${order.id}/edit`}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title={t("action_edit")}
                        aria-label={`${t("action_edit")} ${order.order_number}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MOBILE & TABLET VIEW: RESPONSIVE CARDS ── */}
      {filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 lg:hidden">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs active:bg-slate-50/80 transition-colors cursor-pointer space-y-3.5"
            >
              {/* Top Row: Order #, Status, Client */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {order.order_number}
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                      {t(`status_${order.status}`)}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {order.client?.name ?? "Unknown Client"}
                  </h3>
                  {order.client?.company_name && (
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{order.client.company_name}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/orders/${order.id}/edit`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`${t("action_edit")} ${order.order_number}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Middle Row: Date & Roll Count */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{order.order_date}</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  <Layers className="h-3 w-3 text-slate-500" />
                  <span>{order.number_of_rolls} {t("col_rolls")}</span>
                </span>
              </div>

              {/* Bottom: 4 Metric Tiles (Received, Printed, Delivered, Remaining) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
                  <span className="text-[11px] leading-tight text-slate-500 font-medium block">
                    {t("col_received_wt")}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 mt-0.5 block">
                    {order.received_weight_kg.toFixed(1)} kg
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
                  <span className="text-[11px] leading-tight text-slate-500 font-medium block">
                    {t("col_printed_wt")}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-700 mt-0.5 block">
                    {order.total_printed_weight.toFixed(1)} kg
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
                  <span className="text-[11px] leading-tight text-slate-500 font-medium block">
                    {t("col_delivered_wt")}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 mt-0.5 block">
                    {order.total_delivered_weight.toFixed(1)} kg
                  </span>
                </div>

                <div className="rounded-lg bg-brand-50/60 p-2 text-center border border-brand-100">
                  <span className="text-[11px] leading-tight text-brand-700 font-medium block">
                    {t("col_remaining_wt")}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-800 mt-0.5 block">
                    {order.remaining_weight.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
