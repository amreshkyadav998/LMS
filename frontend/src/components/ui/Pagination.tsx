import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-stone-100 px-5 py-3 sm:px-6">
      <p className="text-xs text-stone-500 sm:text-sm">
        Showing <span className="font-semibold text-stone-700">{from}</span>–
        <span className="font-semibold text-stone-700">{to}</span> of{" "}
        <span className="font-semibold text-stone-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={<ChevronLeft className="size-4" />}
          aria-label="Previous page"
        />
        <span className="text-xs font-medium text-stone-600 tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          icon={<ChevronRight className="size-4" />}
          aria-label="Next page"
        />
      </div>
    </div>
  );
}
