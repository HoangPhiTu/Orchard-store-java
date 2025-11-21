interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-600">
      <p className="text-xl font-semibold text-slate-900">
        Edit Product #{params.id}
      </p>
      <p>Product detail editor coming soon.</p>
    </div>
  );
}

