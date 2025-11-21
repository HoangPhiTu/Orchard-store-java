export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
        404
      </p>
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-md text-sm text-slate-500">
        The page you{"'"}re looking for may have been removed or is temporarily
        unavailable.
      </p>
    </div>
  );
}
