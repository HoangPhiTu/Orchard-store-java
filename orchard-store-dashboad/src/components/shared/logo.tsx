export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ fontWeight: 600, color: "#065f46" }}
    >
      <div
        className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600"
        style={{ width: size, height: size }}
      />
      <span>Orchard Admin</span>
    </div>
  );
}
