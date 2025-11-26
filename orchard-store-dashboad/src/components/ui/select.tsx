"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// Select Context
interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  valueToText: Map<string, string>;
  registerValue: (value: string, text: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

// Select Root
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  defaultValue?: string;
}

const Select = ({
  value,
  onValueChange,
  children,
  defaultValue,
}: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [valueToTextMap] = React.useState(() => new Map<string, string>());

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [value, onValueChange]
  );

  const registerValue = React.useCallback(
    (val: string, text: string) => {
      valueToTextMap.set(val, text);
    },
    [valueToTextMap]
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("[data-select-content]")
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const contextValue: SelectContextValue = React.useMemo(
    () => ({
      value: currentValue,
      onValueChange: handleValueChange,
      open,
      setOpen,
      triggerRef,
      valueToText: valueToTextMap,
      registerValue,
    }),
    [currentValue, handleValueChange, open, valueToTextMap, registerValue]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
};

// Select Group (no-op for compatibility)
const SelectGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

// Select Value
interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

const SelectValue = ({ placeholder, children }: SelectValueProps) => {
  const context = React.useContext(SelectContext);

  if (children) return <>{children}</>;

  if (!context) {
    return <span className="text-slate-500">{placeholder || "Select..."}</span>;
  }

  const selectedText = context.value
    ? context.valueToText.get(context.value) || context.value
    : placeholder || "Select...";

  return (
    <span className={context.value ? "text-slate-900" : "text-slate-500"}>
      {selectedText}
    </span>
  );
};

// Select Trigger
interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => buttonRef.current!);

    React.useEffect(() => {
      if (context?.triggerRef && buttonRef.current) {
        // Assign buttonRef to context triggerRef
        const triggerRef =
          context.triggerRef as React.MutableRefObject<HTMLButtonElement | null>;
        triggerRef.current = buttonRef.current;
      }
    });

    if (!context) return null;

    const { open, setOpen } = context;

    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// Select Content
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: "popper" | "item-aligned";
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  const context = React.useContext(SelectContext);
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>(
    {}
  );

  React.useLayoutEffect(() => {
    if (!context?.open || !context.triggerRef.current) return;

    const trigger = context.triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 16;
    const maxWidth = window.innerWidth - viewportPadding * 2;
    const width = Math.min(rect.width, maxWidth);

    let left = rect.left;
    if (left + width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - viewportPadding - width;
    }
    left = Math.max(left, viewportPadding);

    let top = rect.bottom + 4;
    if (top > window.innerHeight - viewportPadding) {
      top = window.innerHeight - viewportPadding;
    }

    setPositionStyle({
      position: "fixed",
      top,
      left,
      width,
      zIndex: 100,
    });
  }, [context?.open, context?.triggerRef]);

  if (!context?.open) return null;

  const content = (
    <div
      data-select-content
      className={cn(
        "max-h-96 min-w-32 overflow-auto rounded-md border border-slate-200 bg-white text-slate-950 shadow-lg p-1",
        className
      )}
      style={positionStyle}
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
};
SelectContent.displayName = "SelectContent";

// Select Item
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  textValue?: string;
}

const getTextContent = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  if (React.isValidElement(node)) {
    return getTextContent(node.props.children);
  }
  return "";
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, disabled, textValue, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    React.useEffect(() => {
      if (!context) return;
      const text = textValue ?? (getTextContent(children) || value);
      context.registerValue(value, text);
    }, [value, children, context, textValue]);

    if (!context) return null;

    const { value: selectedValue, onValueChange } = context;
    const isSelected = selectedValue === value;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={() => !disabled && onValueChange(value)}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

// Select Label
interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  )
);
SelectLabel.displayName = "SelectLabel";

// Select Separator
interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = "SelectSeparator";

// Placeholder components for compatibility
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
