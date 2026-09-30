export default function ExpensesLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200 hidden sm:block" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 rounded bg-slate-200" />
          <div className="h-8 w-20 rounded bg-slate-200" />
        </div>
      </div>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6 animate-pulse">
        {/* Title skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-md bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-slate-200" />
        </div>

        {/* 3 Metrics skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 rounded-2xl bg-white border border-slate-200 p-4" />
          <div className="h-28 rounded-2xl bg-white border border-slate-200 p-4" />
          <div className="h-28 rounded-2xl bg-white border border-slate-200 p-4" />
        </div>

        {/* Toolbar skeleton */}
        <div className="h-14 rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-4">
          <div className="h-8 flex-1 rounded-md bg-slate-100" />
          <div className="h-8 w-44 rounded-md bg-slate-100" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-100 hidden sm:block" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 rounded-full bg-slate-100" />
                <div className="h-7 w-14 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
