import React from "react";

export default function DashboardLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Header Placeholder */}
      <div className="h-16 border-b border-slate-200 bg-white/95 sticky top-0 z-30" />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-7xl w-full mx-auto space-y-6 animate-pulse">
        {/* Title skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-72 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-9 w-64 bg-slate-200 rounded-2xl" />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-9 bg-slate-200 rounded-lg" />
          ))}
        </div>

        {/* 8 KPI cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />

        {/* Two column grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
        </div>
      </main>
    </div>
  );
}
