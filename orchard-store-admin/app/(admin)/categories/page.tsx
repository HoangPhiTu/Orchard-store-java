'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categoryApi } from '@/lib/api/categories';
import { CategoryDTO } from '@/types/category';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

export default function CategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Fetch categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa danh mục thất bại');
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả danh mục con cũng sẽ bị xóa.')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // Build tree structure
  const buildTree = (categories: CategoryDTO[]): CategoryDTO[] => {
    const categoryMap = new Map<number, CategoryDTO>();
    const rootCategories: CategoryDTO[] = [];

    // First pass: create map
    categories.forEach((cat) => {
      categoryMap.set(cat.id!, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id!);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(category!);
        }
      } else {
        rootCategories.push(category!);
      }
    });

    return rootCategories;
  };

  // Filter categories by search term
  const filterCategories = (categories: CategoryDTO[]): CategoryDTO[] => {
    if (!searchTerm) return categories;

    return categories.filter((cat) => {
      const matches = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (cat.children && cat.children.length > 0) {
        const filteredChildren = filterCategories(cat.children);
        if (filteredChildren.length > 0) {
          cat.children = filteredChildren;
          return true;
        }
      }
      
      return matches;
    });
  };

  const categoryTree = categories ? buildTree(categories) : [];
  const filteredTree = filterCategories(categoryTree);

  const renderCategory = (category: CategoryDTO, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id!);
    const indent = level * 24;

    return (
      <div key={category.id}>
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id!)}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1 flex items-center gap-3">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{category.name}</p>
                <Badge
                  variant={category.status === 'ACTIVE' ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {category.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                </Badge>
                {category.level !== undefined && category.level > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Level {category.level}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">{category.slug}</p>
              {category.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                Order: {category.displayOrder || 0}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/categories/${category.id}/edit`)}
                className="h-8 w-8 p-0 rounded-xl"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(category.id!)}
                className="h-8 w-8 p-0 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi khi tải dữ liệu</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}>
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
          Quản Lý Danh Mục
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Danh Mục</h1>
        <p className="text-slate-500">
          Quản lý danh mục sản phẩm với cấu trúc phân cấp
        </p>
      </div>

      <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh Mục</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Tổng cộng: {categories?.length || 0} danh mục
              </p>
            </div>
            <Button
              onClick={() => router.push('/categories/new')}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Danh Mục
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
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-2xl bg-slate-50 border-slate-100"
              />
            </div>
          </div>

          {/* Categories Tree */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderTree className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">
                {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => router.push('/categories/new')}
                  className="mt-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Danh Mục Đầu Tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredTree.map((category) => renderCategory(category))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

