"use client";

import { useMemo, useState } from "react";
import { Loader2, MailCheck, MailPlus } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleApiError } from "@/lib/handle-error";
import { useChangeEmailInit, useChangeEmailVerify } from "@/hooks/use-users";

type ChangeEmailStep = "email" | "otp";

interface ChangeEmailDialogProps {
  userId: number;
  userName?: string | null;
  currentEmail?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newEmail: string) => void;
}

export function ChangeEmailDialog({
  userId,
  userName,
  currentEmail,
  isOpen,
  onClose,
  onSuccess,
}: ChangeEmailDialogProps) {
  const [step, setStep] = useState<ChangeEmailStep>("email");
  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const initMutation = useChangeEmailInit();
  const verifyMutation = useChangeEmailVerify({
    onSuccess: () => {
      toast.success("Đổi email thành công");
      if (sentEmail) {
        onSuccess?.(sentEmail);
      } else {
        onSuccess?.("");
      }
      handleClose();
    },
  });

  const isEmailStep = step === "email";

  const disabledEmailSubmit =
    !newEmail.trim() || initMutation.isPending || verifyMutation.isPending;

  const disabledOtpSubmit =
    !otpCode.trim() || verifyMutation.isPending || initMutation.isPending;

  const emailHelperMessage = useMemo(() => {
    if (!currentEmail) {
      return "Nhập email mới cho tài khoản này.";
    }
    return `Email hiện tại: ${currentEmail}`;
  }, [currentEmail]);

  const resetState = () => {
    setStep("email");
    setNewEmail("");
    setOtpCode("");
    setSentEmail(null);
    initMutation.reset();
    verifyMutation.reset();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = newEmail.trim();

    try {
      await initMutation.mutateAsync({ id: userId, newEmail: trimmedEmail });
      setSentEmail(trimmedEmail);
      setStep("otp");
      toast.success("Đã gửi mã OTP đến email mới");
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sentEmail) {
      toast.error("Vui lòng nhập email mới trước khi xác thực");
      setStep("email");
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        id: userId,
        newEmail: sentEmail,
        otp: otpCode.trim(),
      });
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  };

  const renderEmailStep = () => (
    <form className="space-y-6" onSubmit={handleSendOtp}>
      <div className="space-y-2">
        <Label htmlFor="new-email">Email mới</Label>
        <Input
          id="new-email"
          type="email"
          value={newEmail}
          placeholder="nhap-email-moi@example.com"
          onChange={(event) => setNewEmail(event.target.value)}
          disabled={initMutation.isPending || verifyMutation.isPending}
          required
        />
        <p className="text-xs text-muted-foreground">{emailHelperMessage}</p>
      </div>
      <Button type="submit" className="w-full" disabled={disabledEmailSubmit}>
        {initMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang gửi mã...
          </>
        ) : (
          <>
            <MailPlus className="mr-2 h-4 w-4" />
            Gửi mã xác nhận
          </>
        )}
      </Button>
    </form>
  );

  const renderOtpStep = () => (
    <form className="space-y-6" onSubmit={handleVerifyOtp}>
      <div className="space-y-2">
        <Label htmlFor="otp-code">Mã OTP</Label>
        <Input
          id="otp-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder="Nhập mã 6 chữ số"
          disabled={verifyMutation.isPending}
          required
        />
        {sentEmail && (
          <p className="text-xs text-muted-foreground">
            Mã đã gửi tới <span className="font-medium">{sentEmail}</span>. Vui
            lòng kiểm tra hộp thư đến hoặc thư rác.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto border-border bg-card text-card-foreground font-semibold hover:bg-muted/40 hover:text-foreground focus:ring-1 focus:ring-primary/30"
          onClick={() => setStep("email")}
          disabled={verifyMutation.isPending}
        >
          Quay lại
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={disabledOtpSubmit}
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xác nhận...
            </>
          ) : (
            <>
              <MailCheck className="mr-2 h-4 w-4" />
              Xác nhận đổi email
            </>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {isEmailStep ? "Nhập email mới" : "Nhập mã OTP"}
          </DialogTitle>
          <DialogDescription>
            {isEmailStep
              ? "Chỉ SUPER_ADMIN mới có quyền thay đổi email người dùng."
              : "Vui lòng nhập mã OTP vừa được gửi để xác nhận đổi email."}
          </DialogDescription>
          {userName && (
            <p className="text-sm font-medium text-card-foreground pt-1">
              Người dùng: {userName}
            </p>
          )}
        </DialogHeader>

        <div className="px-6 py-4">
          {isEmailStep ? renderEmailStep() : renderOtpStep()}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/40"
            onClick={handleClose}
            disabled={initMutation.isPending || verifyMutation.isPending}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
