"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";
import type { RevenueCollectionTrendPoint } from "@/lib/types/dashboard";

interface RevenueCollectionChartProps {
  data: RevenueCollectionTrendPoint[];
  locale?: string;
}

export function RevenueCollectionChart({ data, locale = "en" }: RevenueCollectionChartProps) {
  const t = useTranslations("dashboard");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalBilled = data.reduce((s, d) => s + d.billed, 0);
  const totalCollected = data.reduce((s, d) => s + d.collected, 0);

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.billed, d.collected)),
    1000
  );

  // Format date labels nicely
  const formatLabel = (rawDate: string) => {
    if (!rawDate) return "";
    if (rawDate.length === 7) {
      // YYYY-MM
      const [year, month] = rawDate.split("-");
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString(locale === "ta" ? "ta-IN" : "en-US", { month: "short", year: "2-digit" });
    }
    // YYYY-MM-DD
    const d = new Date(rawDate);
    return d.toLocaleDateString(locale === "ta" ? "ta-IN" : "en-US", { day: "numeric", month: "short" });
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
      {/* Chart Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t("chart_title")}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("chart_subtitle")}
          </p>
        </div>

        {/* Legend Totals */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-500">{t("chart_billed")}:</span>
            <span className="font-bold font-mono text-slate-900">
              ₹{totalBilled.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-slate-500">{t("chart_collected")}:</span>
            <span className="font-bold font-mono text-emerald-700">
              ₹{totalCollected.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {data.length === 0 || (totalBilled === 0 && totalCollected === 0) ? (
        <div className="h-56 flex flex-col items-center justify-center text-center space-y-1 text-slate-400">
          <TrendingUp className="h-8 w-8 text-slate-300" />
          <span className="text-xs font-medium">{t("chart_no_data")}</span>
          <span className="text-[11px] text-slate-400">{t("chart_no_data_hint")}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Tooltip display if hovered */}
          <div className="h-6 flex items-center justify-end text-xs">
            {hoveredIndex !== null && data[hoveredIndex] ? (
              <div className="flex items-center gap-3 bg-slate-900 text-white px-3 py-1 rounded-lg text-[11px] shadow-sm animate-in fade-in duration-100">
                <span className="font-semibold text-slate-300">
                  {formatLabel(data[hoveredIndex].date_label)}:
                </span>
                <span className="text-blue-300">
                  {t("chart_billed")}: ₹{data[hoveredIndex].billed.toLocaleString("en-IN")}
                </span>
                <span className="text-emerald-300">
                  {t("chart_collected")}: ₹{data[hoveredIndex].collected.toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                {t("chart_hover_hint")}
              </span>
            )}
          </div>

          {/* Responsive Bar Graphic */}
          <div className="overflow-x-auto pb-2 no-scrollbar">
            <div
              className="flex items-end gap-2 h-44 pt-4 px-2 min-w-full"
              style={{ minWidth: data.length > 15 ? `${data.length * 28}px` : "100%" }}
            >
              {data.map((point, idx) => {
                const billedHeight = Math.max(4, Math.round((point.billed / maxVal) * 100));
                const collectedHeight = Math.max(4, Math.round((point.collected / maxVal) * 100));
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={point.date_label || idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      {/* Billed Bar */}
                      <div
                        className={`w-2 sm:w-3 rounded-t-sm transition-all ${
                          isHovered ? "bg-blue-700" : "bg-blue-500/80 group-hover:bg-blue-600"
                        }`}
                        style={{ height: `${point.billed > 0 ? billedHeight : 2}%` }}
                      />
                      {/* Collected Bar */}
                      <div
                        className={`w-2 sm:w-3 rounded-t-sm transition-all ${
                          isHovered ? "bg-emerald-700" : "bg-emerald-500/80 group-hover:bg-emerald-600"
                        }`}
                        style={{ height: `${point.collected > 0 ? collectedHeight : 2}%` }}
                      />
                    </div>

                    {/* Date label at bottom */}
                    <span className="text-[10px] text-slate-400 font-mono mt-2 truncate max-w-[42px] text-center">
                      {data.length <= 12 || idx % Math.ceil(data.length / 10) === 0
                        ? formatLabel(point.date_label)
                        : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
