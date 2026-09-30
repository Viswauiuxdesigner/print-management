import React from "react";

export default function ReportsLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Header Placeholder */}
      <div className="h-16 border-b border-slate-200 bg-white/95 sticky top-0 z-30" />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6 animate-pulse">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200 rounded-lg" />
        </div>

        {/* Filter bar skeleton */}
        <div className="h-44 bg-white rounded-2xl border border-slate-200 p-4" />

        {/* Tabs skeleton */}
        <div className="h-12 bg-slate-200/70 rounded-2xl" />

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
        </div>

        {/* Main content table skeleton */}
        <div className="h-80 bg-white rounded-2xl border border-slate-200" />
      </main>
    </div>
  );
}
