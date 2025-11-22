import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: string;
  imageUrl?: string;
}

export function ProductCard({ name, price, imageUrl }: ProductCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 200px, 100vw"
          />
        ) : null}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{name}</p>
      <p className="text-sm text-indigo-600">{price}</p>
    </div>
  );
}
