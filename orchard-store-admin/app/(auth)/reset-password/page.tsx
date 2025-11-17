'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
      'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.');
        setIsValidating(false);
        return;
      }

      try {
        const result = await authApi.validateResetToken(token);
        setIsTokenValid(result.valid);
        if (!result.valid) {
          setError(result.message || 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
        }
      } catch (err: any) {
        setError('Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.');
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token không hợp lệ.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      
      setSuccess('Mật khẩu đã được đặt lại thành công! Đang chuyển đến trang đăng nhập...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message || 
                          'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Đang xác thực token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Token Không Hợp Lệ</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="text-center">
              <Link href="/forgot-password">
                <Button variant="outline" className="w-full">
                  Yêu Cầu Đặt Lại Mật Khẩu Mới
                </Button>
              </Link>
              <div className="mt-4">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đặt Lại Mật Khẩu</CardTitle>
          <CardDescription className="text-center">
            Nhập mật khẩu mới của bạn
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
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

