"use client";

import React from "react";
import {
  List as FixedSizeList,
  type ListChildComponentProps,
} from "react-window";
import clsx from "clsx";

interface VirtualTableColumn<T> {
  key: string;
  title: string;
  width?: number | string;
  render: (item: T) => React.ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  height?: number;
  rowHeight?: number;
  className?: string;
  emptyState?: React.ReactNode;
}

export function VirtualTable<T>({
  data,
  columns,
  height = 480,
  rowHeight = 60,
  className,
  emptyState,
}: VirtualTableProps<T>) {
  const itemCount = data?.length ?? 0;

  if (!itemCount) {
    return (
      emptyState ?? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No data available
        </div>
      )
    );
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = data[index];

    return (
      <div
        style={style}
        className="flex border-b border-border bg-card text-sm text-foreground"
      >
        {columns.map((column) => (
          <div
            key={`${column.key}-${index}`}
            className={clsx(
              "flex items-center px-4 py-3",
              typeof column.width === "number" ? "shrink-0" : "flex-1"
            )}
            style={{
              width:
                typeof column.width === "number"
                  ? `${column.width}px`
                  : column.width,
            }}
          >
            {column.render(item)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={clsx("rounded-2xl border border-border", className)}>
      <div className="flex border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {columns.map((column) => (
          <div
            key={column.key}
            className={clsx(
              "px-4 py-3",
              typeof column.width === "number" ? "shrink-0" : "flex-1"
            )}
            style={{
              width:
                typeof column.width === "number"
                  ? `${column.width}px`
                  : column.width,
            }}
          >
            {column.title}
          </div>
        ))}
      </div>
      <FixedSizeList
        height={height}
        itemCount={itemCount}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
