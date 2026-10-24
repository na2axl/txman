import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type TransactionsSearch,
} from './transactions-search';

interface TransactionsPaginationProps {
  meta: { total: number; page: number; page_size: number };
  search: TransactionsSearch;
}

export function TransactionsPagination({
  meta,
  search,
}: TransactionsPaginationProps) {
  const navigate = useNavigate({ from: '/transactions/' });
  const pageCount = Math.max(1, Math.ceil(meta.total / meta.page_size));
  const first = meta.total === 0 ? 0 : (meta.page - 1) * meta.page_size + 1;
  const last = Math.min(meta.page * meta.page_size, meta.total);

  const goTo = (page: number) =>
    void navigate({
      search: (prev) => ({ ...prev, page: page === 1 ? undefined : page }),
    });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {first}–{last} of {meta.total}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(search.page_size ?? DEFAULT_PAGE_SIZE)}
            onValueChange={(value) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  page: undefined,
                  page_size:
                    Number(value) === DEFAULT_PAGE_SIZE
                      ? undefined
                      : Number(value),
                }),
              })
            }
          >
            <SelectTrigger aria-label="Rows per page" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={meta.page <= 1}
            onClick={() => goTo(meta.page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-20 text-center text-sm">
            Page {meta.page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={meta.page >= pageCount}
            onClick={() => goTo(meta.page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
