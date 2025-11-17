'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
      'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      reset();
      
      // Logout after 2 seconds
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message || 
                          'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài Đặt</h1>
        <p className="text-gray-600 mt-2">Quản lý tài khoản và cài đặt</p>
      </div>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi Mật Khẩu</CardTitle>
          <CardDescription>
            Thay đổi mật khẩu của bạn. Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Mật khẩu hiện tại
              </label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...register('currentPassword')}
                className={errors.currentPassword ? 'border-red-500' : ''}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...register('newPassword')}
                className={errors.newPassword ? 'border-red-500' : ''}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu mới
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Tài Khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Họ và Tên</label>
              <p className="text-sm mt-1">{user?.fullName || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Vai trò</label>
              <p className="text-sm mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.role}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

