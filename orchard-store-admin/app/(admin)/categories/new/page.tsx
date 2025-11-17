'use client';

import { useRouter } from 'next/navigation';
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
import { categoryApi } from '@/lib/api/categories';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
  parentId: z.number().optional().nullable(),
  displayOrder: z.number().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch categories for parent selection
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      status: 'ACTIVE',
      displayOrder: 0,
      parentId: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoryApi.create(data as any),
    onSuccess: () => {
      toast.success('Tạo danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/categories');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Tạo danh mục thất bại');
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    const submitData = {
      ...data,
      parentId: data.parentId || undefined,
    };
    createMutation.mutate(submitData as any);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    // Auto-generate slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setValue('slug', slug);
  };

  // Build flat list for parent selection
  const buildFlatList = (categories: any[], level: number = 0): any[] => {
    let result: any[] = [];
    categories.forEach((cat) => {
      result.push({ ...cat, displayName: '  '.repeat(level) + cat.name });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(buildFlatList(cat.children, level + 1));
      }
    });
    return result;
  };

  const flatCategories = categories ? buildFlatList(categories) : [];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Quản Lý Danh Mục
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Tạo Danh Mục Mới</h1>
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
                    Tên Danh Mục <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    onChange={handleNameChange}
                    placeholder="Nhập tên danh mục"
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
                    placeholder="slug-danh-muc"
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
                    placeholder="Mô tả về danh mục"
                    className="rounded-2xl min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Hình Ảnh URL</Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    placeholder="https://example.com/image.png"
                    className="rounded-2xl"
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Danh Mục Cha (Tùy chọn)</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue('parentId', value === 'none' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                      {flatCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    defaultValue="ACTIVE"
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
                    defaultValue={0}
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
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Danh Mục'}
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

