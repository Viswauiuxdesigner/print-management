export default function AttendanceLoading() {
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
        {/* Title & Tabs skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-md bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-56 rounded-xl bg-slate-200" />
        </div>

        {/* Date toolbar skeleton */}
        <div className="h-16 rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="h-9 w-44 rounded-xl bg-slate-100" />
          <div className="h-8 w-36 rounded-lg bg-slate-100" />
        </div>

        {/* 5 Metrics skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white border border-slate-200 p-3" />
          ))}
        </div>

        {/* Rows skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-20 rounded-xl bg-slate-100" />
                <div className="h-9 w-20 rounded-xl bg-slate-100" />
                <div className="h-9 w-20 rounded-xl bg-slate-100" />
                <div className="h-9 w-20 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
