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
import { Checkbox } from '@/components/ui/checkbox';
import { productApi } from '@/lib/api/products';
import { brandApi } from '@/lib/api/brands';
import { categoryApi } from '@/lib/api/categories';
import { ProductVariantManager } from '@/components/admin/ProductVariantManager';
import { ProductVariantDTO } from '@/types/product';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  content: z.string().optional(),
  brandId: z.number().min(1, 'Vui lòng chọn thương hiệu'),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
  basePrice: z.number().min(0, 'Giá phải >= 0').optional(),
  salePrice: z.number().min(0, 'Giá khuyến mãi phải >= 0').optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  displayOrder: z.number().default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id as string);
  const queryClient = useQueryClient();

  // Fetch product
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getById(productId),
    enabled: !!productId,
  });

  // Fetch brands and categories
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getAll(true),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const [variants, setVariants] = useState<ProductVariantDTO[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  // Reset form when product data is loaded
  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        content: product.content || '',
        brandId: product.brandId || 0,
        categoryId: product.categoryId || 0,
        basePrice: product.basePrice || 0,
        salePrice: product.salePrice || 0,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        metaKeywords: product.metaKeywords || '',
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        isBestseller: product.isBestseller || false,
        status: product.status || 'DRAFT',
        displayOrder: product.displayOrder || 0,
      });
      // Load variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => productApi.update(productId, data as any),
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      router.push('/products');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật sản phẩm thất bại');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const productData = {
      ...data,
      variants: variants.length > 0 ? variants : undefined,
    };
    updateMutation.mutate(productData as any);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy sản phẩm</p>
          <Button onClick={() => router.push('/products')} className="rounded-2xl">
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
            Quản Lý Sản Phẩm
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Chỉnh Sửa Sản Phẩm</h1>
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
            {/* Basic Information */}
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên Sản Phẩm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Nhập tên sản phẩm"
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
                    placeholder="slug-san-pham"
                    className="rounded-2xl"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Mô Tả Ngắn</Label>
                  <Textarea
                    id="shortDescription"
                    {...register('shortDescription')}
                    placeholder="Mô tả ngắn về sản phẩm"
                    className="rounded-2xl min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô Tả Chi Tiết</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả chi tiết về sản phẩm"
                    className="rounded-2xl min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội Dung</Label>
                  <Textarea
                    id="content"
                    {...register('content')}
                    placeholder="Nội dung HTML (nếu có)"
                    className="rounded-2xl min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Brand & Category */}
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Phân Loại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Thương Hiệu <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={product.brandId?.toString()}
                      onValueChange={(value) => setValue('brandId', parseInt(value))}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.brandId && (
                      <p className="text-sm text-red-500">{errors.brandId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Danh Mục <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={product.categoryId?.toString()}
                      onValueChange={(value) => setValue('categoryId', parseInt(value))}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Giá Gốc (₫)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      {...register('basePrice', { valueAsNumber: true })}
                      placeholder="0"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Giá Khuyến Mãi (₫)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      {...register('salePrice', { valueAsNumber: true })}
                      placeholder="0"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <ProductVariantManager variants={variants} onChange={setVariants} />

            {/* SEO */}
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    {...register('metaTitle')}
                    placeholder="Meta title cho SEO"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    {...register('metaDescription')}
                    placeholder="Meta description cho SEO"
                    className="rounded-2xl min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    {...register('metaKeywords')}
                    placeholder="keyword1, keyword2, keyword3"
                    className="rounded-2xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Settings */}
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Cài Đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Trạng Thái</Label>
                  <Select
                    defaultValue={product.status || 'DRAFT'}
                    onValueChange={(value) =>
                      setValue('status', value as 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED')
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Bản Nháp</SelectItem>
                      <SelectItem value="ACTIVE">Hoạt Động</SelectItem>
                      <SelectItem value="INACTIVE">Tạm Dừng</SelectItem>
                      <SelectItem value="ARCHIVED">Đã Lưu Trữ</SelectItem>
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

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      defaultChecked={product.isFeatured}
                      {...register('isFeatured')}
                      onChange={(e) => setValue('isFeatured', e.target.checked)}
                    />
                    <Label htmlFor="isFeatured" className="cursor-pointer">
                      Sản Phẩm Nổi Bật
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      defaultChecked={product.isNew}
                      {...register('isNew')}
                      onChange={(e) => setValue('isNew', e.target.checked)}
                    />
                    <Label htmlFor="isNew" className="cursor-pointer">
                      Sản Phẩm Mới
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBestseller"
                      defaultChecked={product.isBestseller}
                      {...register('isBestseller')}
                      onChange={(e) => setValue('isBestseller', e.target.checked)}
                    />
                    <Label htmlFor="isBestseller" className="cursor-pointer">
                      Bán Chạy
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Đang lưu...' : 'Cập Nhật Sản Phẩm'}
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

