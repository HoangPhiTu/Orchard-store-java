'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductVariantDTO } from '@/types/product';
import { Badge } from '@/components/ui/badge';

interface ProductVariantManagerProps {
  variants: ProductVariantDTO[];
  onChange: (variants: ProductVariantDTO[]) => void;
}

export function ProductVariantManager({
  variants,
  onChange,
}: ProductVariantManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const defaultVariant: ProductVariantDTO = {
    sku: '',
    variantName: '',
    price: 0,
    salePrice: undefined,
    costPrice: undefined,
    stockQuantity: 0,
    reservedQuantity: 0,
    lowStockThreshold: 10,
    weight: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
    displayOrder: 0,
    isDefault: false,
    status: 'ACTIVE',
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIndex(variants.length);
    onChange([...variants, { ...defaultVariant }]);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsAdding(false);
  };

  const handleSave = (index: number, updatedVariant: ProductVariantDTO) => {
    const newVariants = [...variants];
    newVariants[index] = updatedVariant;
    onChange(newVariants);
    setEditingIndex(null);
    setIsAdding(false);
  };

  const handleDelete = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      const newVariants = variants.filter((_, i) => i !== index);
      // Nếu xóa variant default, set variant đầu tiên làm default
      if (variants[index].isDefault && newVariants.length > 0) {
        newVariants[0].isDefault = true;
      }
      onChange(newVariants);
      if (editingIndex === index) {
        setEditingIndex(null);
        setIsAdding(false);
      }
    }
  };

  const handleCancel = () => {
    if (isAdding) {
      const newVariants = variants.slice(0, -1);
      onChange(newVariants);
    }
    setEditingIndex(null);
    setIsAdding(false);
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariantDTO,
    value: any
  ) => {
    const newVariants = [...variants];
    const variant = { ...newVariants[index] };
    
    // Nếu set isDefault = true, unset các variant khác
    if (field === 'isDefault' && value === true) {
      newVariants.forEach((v, i) => {
        if (i !== index) {
          v.isDefault = false;
        }
      });
    }
    
    (variant as any)[field] = value;
    newVariants[index] = variant;
    onChange(newVariants);
  };

  return (
    <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Biến Thể Sản Phẩm</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý các biến thể (size, màu sắc, dung tích, etc.)
            </p>
          </div>
          {editingIndex === null && (
            <Button
              type="button"
              onClick={handleAdd}
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-600"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Biến Thể
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Chưa có biến thể nào</p>
            <Button
              type="button"
              onClick={handleAdd}
              className="mt-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Biến Thể Đầu Tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {variants.map((variant, index) => {
              const isEditing = editingIndex === index;

              return (
                <Card
                  key={index}
                  className={`border-2 ${
                    variant.isDefault
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-100'
                  }`}
                >
                  <CardContent className="pt-6">
                    {isEditing ? (
                      <VariantForm
                        variant={variant}
                        onSave={(updated) => handleSave(index, updated)}
                        onCancel={handleCancel}
                        onChange={(field, value) =>
                          handleVariantChange(index, field, value)
                        }
                      />
                    ) : (
                      <VariantView
                        variant={variant}
                        onEdit={() => handleEdit(index)}
                        onDelete={() => handleDelete(index)}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VariantFormProps {
  variant: ProductVariantDTO;
  onSave: (variant: ProductVariantDTO) => void;
  onCancel: () => void;
  onChange: (field: keyof ProductVariantDTO, value: any) => void;
}

function VariantForm({
  variant,
  onSave,
  onCancel,
  onChange,
}: VariantFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant.sku || !variant.price || variant.price <= 0) {
      alert('Vui lòng nhập SKU và giá hợp lệ');
      return;
    }
    onSave(variant);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            SKU <span className="text-red-500">*</span>
          </Label>
          <Input
            value={variant.sku || ''}
            onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
            placeholder="SKU-001"
            className="rounded-2xl"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Tên Biến Thể</Label>
          <Input
            value={variant.variantName || ''}
            onChange={(e) => onChange('variantName', e.target.value)}
            placeholder="Ví dụ: 100ml, Size L, Màu Đỏ"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>
            Giá (₫) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            value={variant.price || ''}
            onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="rounded-2xl"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Giá Khuyến Mãi (₫)</Label>
          <Input
            type="number"
            step="0.01"
            value={variant.salePrice || ''}
            onChange={(e) =>
              onChange('salePrice', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Giá Vốn (₫)</Label>
          <Input
            type="number"
            step="0.01"
            value={variant.costPrice || ''}
            onChange={(e) =>
              onChange('costPrice', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Số Lượng Tồn Kho</Label>
          <Input
            type="number"
            value={variant.stockQuantity || 0}
            onChange={(e) => onChange('stockQuantity', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Ngưỡng Tồn Kho Thấp</Label>
          <Input
            type="number"
            value={variant.lowStockThreshold || 10}
            onChange={(e) => onChange('lowStockThreshold', parseInt(e.target.value) || 10)}
            placeholder="10"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Trạng Thái</Label>
          <Select
            value={variant.status || 'ACTIVE'}
            onValueChange={(value) => onChange('status', value)}
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Hoạt Động</SelectItem>
              <SelectItem value="INACTIVE">Tạm Dừng</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Hết Hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Trọng Lượng (kg)</Label>
          <Input
            type="number"
            step="0.01"
            value={variant.weight || ''}
            onChange={(e) =>
              onChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Chiều Dài (cm)</Label>
          <Input
            type="number"
            step="0.01"
            value={variant.length || ''}
            onChange={(e) =>
              onChange('length', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Chiều Rộng (cm)</Label>
          <Input
            type="number"
            step="0.01"
            value={variant.width || ''}
            onChange={(e) =>
              onChange('width', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Chiều Cao (cm)</Label>
          <Input
            type="number"
            step="0.01"
            value={variant.height || ''}
            onChange={(e) =>
              onChange('height', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0"
            className="rounded-2xl"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`isDefault-${variant.sku}`}
              checked={variant.isDefault || false}
              onChange={(e) => onChange('isDefault', e.target.checked)}
            />
            <Label htmlFor={`isDefault-${variant.sku}`} className="cursor-pointer">
              Biến Thể Mặc Định
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`displayOrder-${variant.sku}`}>Thứ Tự:</Label>
            <Input
              id={`displayOrder-${variant.sku}`}
              type="number"
              value={variant.displayOrder || 0}
              onChange={(e) => onChange('displayOrder', parseInt(e.target.value) || 0)}
              className="w-20 rounded-2xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-2xl"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button
            type="submit"
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-600"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu
          </Button>
        </div>
      </div>
    </form>
  );
}

interface VariantViewProps {
  variant: ProductVariantDTO;
  onEdit: () => void;
  onDelete: () => void;
}

function VariantView({ variant, onEdit, onDelete }: VariantViewProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-slate-900">
              {variant.variantName || variant.sku}
            </h4>
            {variant.isDefault && (
              <Badge variant="success" className="text-xs">
                Mặc Định
              </Badge>
            )}
            <Badge
              variant={
                variant.status === 'ACTIVE'
                  ? 'success'
                  : variant.status === 'INACTIVE'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {variant.status === 'ACTIVE'
                ? 'Hoạt Động'
                : variant.status === 'INACTIVE'
                ? 'Tạm Dừng'
                : 'Hết Hàng'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">SKU</p>
              <p className="font-medium">{variant.sku}</p>
            </div>
            <div>
              <p className="text-slate-500">Giá</p>
              <p className="font-medium">
                ₫{variant.price?.toLocaleString('vi-VN')}
                {variant.salePrice && (
                  <span className="text-xs text-slate-400 line-through ml-2">
                    ₫{variant.salePrice.toLocaleString('vi-VN')}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Tồn Kho</p>
              <p className="font-medium">{variant.stockQuantity || 0}</p>
            </div>
            <div>
              <p className="text-slate-500">Có Sẵn</p>
              <p className="font-medium">{variant.availableQuantity || 0}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="rounded-xl"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

