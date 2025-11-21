interface StatsCardProps {
  title: string;
  value: string;
  trend?: string;
  children?: React.ReactNode;
}

export function StatsCard({ title, value, trend, children }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {trend && <p className="text-xs text-emerald-500">{trend}</p>}
      {children}
    </div>
  );
}
