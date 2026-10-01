"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getDatePresetRange,
  type DatePreset,
  type ReportDateRange,
} from "@/lib/reports/date-utils";

interface DashboardHeaderProps {
  currentRange: ReportDateRange;
  currentPreset: DatePreset;
  onRangeChange: (range: ReportDateRange, preset: DatePreset) => void;
  isLoading?: boolean;
}

export function DashboardHeader({
  currentRange,
  currentPreset,
  onRangeChange,
  isLoading = false,
}: DashboardHeaderProps) {
  const t = useTranslations("dashboard");

  const [activePreset, setActivePreset] = useState<DatePreset>(currentPreset);
  const [customStart, setCustomStart] = useState(currentRange.startDate);
  const [customEnd, setCustomEnd] = useState(currentRange.endDate);
  const [showCustom, setShowCustom] = useState(currentPreset === "custom");
  const [dateError, setDateError] = useState<string | null>(null);

  const presets: { id: DatePreset; label: string }[] = [
    { id: "today", label: t("preset_today") },
    { id: "this_week", label: t("preset_this_week") },
    { id: "this_month", label: t("preset_this_month") },
    { id: "last_month", label: t("preset_last_month") },
    { id: "last_30_days", label: t("preset_last_30_days") },
    { id: "this_year", label: t("preset_this_year") },
  ];

  const handleSelectPreset = (preset: DatePreset) => {
    setActivePreset(preset);
    setShowCustom(false);
    setDateError(null);
    const range = getDatePresetRange(preset);
    setCustomStart(range.startDate);
    setCustomEnd(range.endDate);
    onRangeChange(range, preset);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd && customStart > customEnd) {
      setDateError(t("filter_date_error"));
      return;
    }
    setDateError(null);
    setActivePreset("custom");
    onRangeChange({ startDate: customStart, endDate: customEnd }, "custom");
  };

  return (
    <div className="space-y-4">
      {/* Title & Date Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        {/* Date Presets Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 border border-slate-200 w-fit">
          {presets.map((p) => {
            const isActive = activePreset === p.id && !showCustom;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                {p.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            disabled={isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              showCustom || activePreset === "custom"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{t("preset_custom")}</span>
          </button>
        </div>
      </div>

      {/* Custom Date Form if toggled */}
      {showCustom && (
        <form
          onSubmit={handleApplyCustom}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-end gap-3 animate-in fade-in duration-150"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t("filter_date_from")}
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t("filter_date_to")}
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="text-xs sm:text-sm font-medium border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{t("action_apply_range")}</span>
          </Button>

          {dateError && (
            <span className="text-xs text-rose-600 font-medium">{dateError}</span>
          )}
        </form>
      )}
    </div>
  );
}
