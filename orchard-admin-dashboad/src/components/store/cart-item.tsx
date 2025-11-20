interface CartItemProps {
  name: string;
  quantity: number;
  price: string;
}

export function CartItem({ name, quantity, price }: CartItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm">
      <div>
        <p className="font-medium text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">Qty: {quantity}</p>
      </div>
      <p className="font-semibold text-emerald-600">{price}</p>
    </div>
  );
}
