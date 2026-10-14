"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import type { Paginated } from "@/types";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Rendered as the card footer on small screens. */
  isAction?: boolean;
}

interface DataTableProps<T> {
  data: Paginated<T> | undefined;
  error: unknown;
  isLoading: boolean;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onPageChange: (page: number) => void;
  empty: { icon: LucideIcon; title: string; description: string };
}

/** Table with loading, error, empty and pagination states for dashboard queues. */
export function DataTable<T>({ data, error, isLoading, columns, rowKey, onPageChange, empty }: DataTableProps<T>) {
  if (error && !data) {
    return (
      <div className="p-5">
        <Alert tone="error" title="Could not load data">Please refresh the page to try again.</Alert>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-600">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />;
  }

  // Below xl the sidebar leaves too little room for a full table, so each row
  // becomes a card: the first column is the title, action columns form the
  // footer and the rest are labelled fields.
  const [titleColumn, ...restColumns] = columns;
  const fieldColumns = restColumns.filter((column) => !column.isAction);
  const actionColumns = restColumns.filter((column) => column.isAction);

  return (
    <div className={cn("transition-opacity", isLoading && "opacity-60")}>
      <ul className="grid md:grid-cols-2 xl:hidden">
        {data.items.map((row) => (
          <li key={rowKey(row)} className="space-y-4 border-b border-stone-100 px-5 py-4 md:odd:border-r">
            {titleColumn.cell(row)}
            {fieldColumns.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {fieldColumns.map((column) => (
                  <div key={column.header} className="min-w-0">
                    <dt className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase">{column.header}</dt>
                    <dd className="mt-0.5 text-stone-700">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actionColumns.map((column) => (
              <div key={column.header} className="[&>div]:justify-start">
                {column.cell(row)}
              </div>
            ))}
          </li>
        ))}
      </ul>

      <Table className="hidden xl:table">
        <THead>
          <tr>
            {columns.map((column) => (
              <TH key={column.header} className={column.className}>
                {column.header}
              </TH>
            ))}
          </tr>
        </THead>
        <TBody>
          {data.items.map((row) => (
            <TR key={rowKey(row)}>
              {columns.map((column) => (
                <TD key={column.header} className={column.className}>
                  {column.cell(row)}
                </TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        limit={data.limit}
        onPageChange={onPageChange}
      />
    </div>
  );
}
