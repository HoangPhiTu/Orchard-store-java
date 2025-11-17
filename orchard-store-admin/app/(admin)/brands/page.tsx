'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
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
import { brandApi } from '@/lib/api/brands';
import { BrandDTO } from '@/types/brand';
import toast from 'react-hot-toast';

export default function BrandsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch brands
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getAll(),
  });

  // Delete brand mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa thương hiệu thành công');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa thương hiệu thất bại');
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter brands by search term
  const filteredBrands = brands?.filter((brand: BrandDTO) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi khi tải dữ liệu</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['brands'] })}>
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
          Quản Lý Thương Hiệu
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Thương Hiệu</h1>
        <p className="text-slate-500">
          Quản lý tất cả thương hiệu trong hệ thống
        </p>
      </div>

      <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thương Hiệu</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Tổng cộng: {filteredBrands.length} thương hiệu
              </p>
            </div>
            <Button
              onClick={() => router.push('/brands/new')}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Thương Hiệu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-2xl bg-slate-50 border-slate-100"
              />
            </div>
          </div>

          {/* Brands Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Tag className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">
                {searchTerm ? 'Không tìm thấy thương hiệu nào' : 'Chưa có thương hiệu nào'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => router.push('/brands/new')}
                  className="mt-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Thương Hiệu Đầu Tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Thương Hiệu</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Quốc Gia</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Thứ Tự</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand: BrandDTO) => (
                    <TableRow key={brand.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        #{brand.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Tag className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">
                              {brand.name}
                            </p>
                            {brand.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">
                                {brand.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 font-mono">
                          {brand.slug}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {brand.country || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {brand.websiteUrl ? (
                          <a
                            href={brand.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            Website
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {brand.displayOrder || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={brand.status === 'ACTIVE' ? 'success' : 'secondary'}
                        >
                          {brand.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/brands/${brand.id}/edit`)}
                            className="h-8 w-8 p-0 rounded-xl"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(brand.id!)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

