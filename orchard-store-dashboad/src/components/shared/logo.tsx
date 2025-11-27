export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-semibold text-success">
      <div
        className="rounded-2xl bg-gradient-to-br from-primary to-indigo-400"
        style={{ width: size, height: size }}
      />
      <span>Orchard Admin</span>
    </div>
  );
}
