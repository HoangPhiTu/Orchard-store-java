'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  Filter,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { productApi } from '@/lib/api/products';
import { ProductDTO } from '@/types/product';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, size, searchTerm],
    queryFn: () =>
      productApi.getAll({
        page,
        size,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      }),
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa sản phẩm thất bại');
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id);
    }
  };

  const products = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi khi tải dữ liệu</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Quản Lý Sản Phẩm
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Sản Phẩm</h1>
        <p className="text-slate-500">
          Quản lý tất cả sản phẩm trong hệ thống
        </p>
      </div>

      <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sản Phẩm</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Tổng cộng: {totalElements} sản phẩm
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất
              </Button>
              <Button
                onClick={() => router.push('/products/new')}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Sản Phẩm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-2xl bg-slate-50 border-slate-100"
              />
            </div>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Chưa có sản phẩm nào</p>
              <Button
                onClick={() => router.push('/products/new')}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Sản Phẩm Đầu Tiên
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Sản Phẩm</TableHead>
                      <TableHead>Thương Hiệu</TableHead>
                      <TableHead>Danh Mục</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Tồn Kho</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="text-right">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: ProductDTO) => (
                      <TableRow key={product.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">
                          #{product.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].imageUrl}
                                alt={product.name}
                                className="h-12 w-12 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {product.brandName || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {product.categoryName || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            {product.salePrice ? (
                              <>
                                <p className="font-semibold text-slate-900">
                                  ₫{product.salePrice.toLocaleString('vi-VN')}
                                </p>
                                <p className="text-xs text-slate-400 line-through">
                                  ₫{product.basePrice?.toLocaleString('vi-VN')}
                                </p>
                              </>
                            ) : (
                              <p className="font-semibold text-slate-900">
                                ₫{product.basePrice?.toLocaleString('vi-VN') || '0'}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {product.variants?.reduce(
                              (sum, v) => sum + (v.availableQuantity || 0),
                              0
                            ) || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === 'ACTIVE'
                                ? 'success'
                                : product.status === 'INACTIVE'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {product.status === 'ACTIVE'
                              ? 'Hoạt động'
                              : product.status === 'INACTIVE'
                              ? 'Tạm dừng'
                              : 'Đã xóa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/products/${product.id}/edit`)}
                              className="h-8 w-8 p-0 rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id!)}
                              className="h-8 w-8 p-0 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-500">
                    Trang {page + 1} / {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-2xl"
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="rounded-2xl"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

