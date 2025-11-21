"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const SheetContext = React.createContext<SheetProps | null>(null);

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const context = React.useContext(SheetContext);
  if (!context) return null;

  const trigger = (
    <button type="button" onClick={() => context.onOpenChange(true)}>
      {children}
    </button>
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => context.onOpenChange(true),
    });
  }

  return trigger;
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  const context = React.useContext(SheetContext);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!context || !mounted) return null;
  if (!context.open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => context.onOpenChange(false)}
      />
      <div
        className={cn(
          "relative ml-auto flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function SheetHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-slate-200 p-6", className)}>
      {children}
    </div>
  );
}

export function SheetTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-900", className)}>
      {children}
    </h2>
  );
}

export function SheetDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-1 text-sm text-slate-500", className)}>{children}</p>
  );
}

export function SheetFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-slate-200 p-6", className)}>
      {children}
    </div>
  );
}

