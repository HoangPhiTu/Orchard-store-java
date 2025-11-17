'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { brandApi } from '@/lib/api/brands';
import toast from 'react-hot-toast';

const brandSchema = z.object({
  name: z.string().min(1, 'Tên thương hiệu là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  description: z.string().optional(),
  logoUrl: z.string().url('URL logo không hợp lệ').optional().or(z.literal('')),
  country: z.string().optional(),
  websiteUrl: z.string().url('URL website không hợp lệ').optional().or(z.literal('')),
  displayOrder: z.number().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = parseInt(params.id as string);
  const queryClient = useQueryClient();

  // Fetch brand
  const { data: brand, isLoading: isLoadingBrand } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => brandApi.getById(brandId),
    enabled: !!brandId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  // Reset form when brand data is loaded
  React.useEffect(() => {
    if (brand) {
      reset({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        logoUrl: brand.logoUrl || '',
        country: brand.country || '',
        websiteUrl: brand.websiteUrl || '',
        displayOrder: brand.displayOrder || 0,
        status: brand.status || 'ACTIVE',
      });
    }
  }, [brand, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: BrandFormData) => brandApi.update(brandId, data as any),
    onSuccess: () => {
      toast.success('Cập nhật thương hiệu thành công');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      router.push('/brands');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật thương hiệu thất bại');
    },
  });

  const onSubmit = (data: BrandFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoadingBrand) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy thương hiệu</p>
          <Button onClick={() => router.push('/brands')} className="rounded-2xl">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Quản Lý Thương Hiệu
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Chỉnh Sửa Thương Hiệu</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-2xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên Thương Hiệu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Nhập tên thương hiệu"
                    className="rounded-2xl"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="slug-thuong-hieu"
                    className="rounded-2xl"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả về thương hiệu"
                    className="rounded-2xl min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      {...register('logoUrl')}
                      placeholder="https://example.com/logo.png"
                      className="rounded-2xl"
                    />
                    {errors.logoUrl && (
                      <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Quốc Gia</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder="Việt Nam"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    {...register('websiteUrl')}
                    placeholder="https://example.com"
                    className="rounded-2xl"
                  />
                  {errors.websiteUrl && (
                    <p className="text-sm text-red-500">{errors.websiteUrl.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Cài Đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Trạng Thái</Label>
                  <Select
                    defaultValue={brand.status || 'ACTIVE'}
                    onValueChange={(value) =>
                      setValue('status', value as 'ACTIVE' | 'INACTIVE')
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt Động</SelectItem>
                      <SelectItem value="INACTIVE">Tạm Dừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Thứ Tự Hiển Thị</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...register('displayOrder', { valueAsNumber: true })}
                    className="rounded-2xl"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Đang lưu...' : 'Cập Nhật Thương Hiệu'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full rounded-2xl"
                  >
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

