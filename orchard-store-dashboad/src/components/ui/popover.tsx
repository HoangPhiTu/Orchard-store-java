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
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const Popover = ({
  open: controlledOpen,
  onOpenChange,
  children,
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

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

type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (!context) return;
        const triggerRef = context.triggerRef;
        triggerRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node;
        }
      },
      [context, ref]
    );

    if (!context) return null;

    const handleClick = () => context.setOpen(!context.open);

    return (
      <button
        type="button"
        ref={mergedRef}
        className={cn(className)}
        onClick={handleClick}
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
    const triggerRef = context?.triggerRef ?? null;
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const [positionStyle, setPositionStyle] =
      React.useState<React.CSSProperties>({});
    const shouldRender = Boolean(context && context.open);

    React.useImperativeHandle(ref, () => contentRef.current!);

    React.useEffect(() => {
      if (!shouldRender || !triggerRef?.current || !contentRef.current) {
        return;
      }

      const triggerNode = triggerRef.current;
      const contentNode = contentRef.current;
      if (!triggerNode || !contentNode) {
        return;
      }

      const triggerRect = triggerNode.getBoundingClientRect();
      const contentRect = contentNode.getBoundingClientRect();

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
    }, [shouldRender, triggerRef, align, side, sideOffset]);

    if (!context || !shouldRender) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          "z-100 max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg",
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
