"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const Popover = ({
  open: controlledOpen,
  onOpenChange,
  children,
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    },
    [setOpen]
  );

  React.useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
    }),
    [open, setOpen]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) return null;

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => buttonRef.current!);

    React.useEffect(() => {
      if (context.triggerRef && buttonRef.current) {
        context.triggerRef.current = buttonRef.current;
      }
    }, [context.triggerRef]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: buttonRef,
        onClick: () => context.setOpen(!context.open),
        ...props,
      } as any);
    }

    return (
      <button
        type="button"
        ref={buttonRef}
        className={cn(className)}
        onClick={() => context.setOpen(!context.open)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  children?: React.ReactNode;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      align = "end",
      side = "bottom",
      sideOffset = 8,
      children,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(PopoverContext);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [positionStyle, setPositionStyle] =
      React.useState<React.CSSProperties>({});

    React.useImperativeHandle(ref, () => contentRef.current!);

    if (!context || !context.open) return null;

    React.useEffect(() => {
      if (context.triggerRef.current && contentRef.current) {
        const triggerRect = context.triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        let top = triggerRect.bottom + sideOffset;
        let left = triggerRect.left;

        if (side === "top") {
          top = triggerRect.top - contentRect.height - sideOffset;
        } else if (side === "bottom") {
          top = triggerRect.bottom + sideOffset;
        }

        if (align === "end") {
          left = triggerRect.right - contentRect.width;
        } else if (align === "center") {
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        } else {
          left = triggerRect.left;
        }

        // Adjust if content goes off screen
        if (left + contentRect.width > window.innerWidth) {
          left = window.innerWidth - contentRect.width - 16;
        }
        if (left < 0) {
          left = 16;
        }
        if (top + contentRect.height > window.innerHeight) {
          top = triggerRect.top - contentRect.height - sideOffset;
        }
        if (top < 0) {
          top = 8;
        }

        setPositionStyle({
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          minWidth: `${Math.max(triggerRect.width, 320)}px`,
        });
      }
    }, [context.triggerRef, context.open, align, side, sideOffset]);

    return (
      <div
        ref={contentRef}
        className={cn(
          "z-[100] max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg",
          className
        )}
        style={positionStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
