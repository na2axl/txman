import { Link, useNavigate } from '@tanstack/react-router';
import {
  createColumnHelper,
  type PaginationState,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { TransactionModel } from '@/api/models';
import type { TransactionSortField } from '@/api/resources';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import {
  DEFAULT_PAGE_SIZE,
  type TransactionsSearch,
} from './transactions-search';

const features = tableFeatures({ rowSortingFeature, rowPaginationFeature });
const helper = createColumnHelper<typeof features, TransactionModel>();
const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const columns = helper.columns([
  helper.accessor((row) => row.reference, {
    id: 'reference',
    header: 'Reference',
    cell: ({ row }) => (
      <Link
        to="/transactions/$transactionId"
        params={{ transactionId: row.original.id }}
        className="font-mono text-sm font-medium hover:underline"
      >
        {row.original.reference}
      </Link>
    ),
  }),
  helper.accessor((row) => row.customer.name, {
    id: 'customer',
    header: 'Customer',
    enableSorting: false,
  }),
  helper.accessor((row) => row.amountMinor, {
    id: 'amount',
    header: 'Amount',
    sortDescFirst: true,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.formattedAmount}</span>
    ),
    meta: { align: 'right' },
  }),
  helper.accessor((row) => row.status, {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  helper.accessor((row) => row.createdAt, {
    id: 'created_at',
    header: 'Created',
    sortDescFirst: true,
    cell: ({ row }) => dateFormat.format(row.original.createdAt),
  }),
]);

const EMPTY_ROWS: TransactionModel[] = [];

interface TransactionsTableProps {
  items: TransactionModel[] | undefined;
  total: number;
  search: TransactionsSearch;
  isFetching: boolean;
}

export function TransactionsTable({
  items,
  total,
  search,
  isFetching,
}: TransactionsTableProps) {
  const navigate = useNavigate({ from: '/transactions/' });

  const sorting: SortingState = [
    {
      id: search.sort_by ?? 'created_at',
      desc: (search.order ?? 'desc') === 'desc',
    },
  ];
  const pagination: PaginationState = {
    pageIndex: (search.page ?? 1) - 1,
    pageSize: search.page_size ?? DEFAULT_PAGE_SIZE,
  };

  const table = useTable({
    features,
    columns,
    data: items ?? EMPTY_ROWS,
    rowCount: total,
    manualSorting: true,
    manualPagination: true,
    enableSortingRemoval: false,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const [first] = next;
      void navigate({
        search: (prev) => ({
          ...prev,
          page: undefined,
          sort_by: first?.id as TransactionSortField | undefined,
          order: first ? (first.desc ? 'desc' : 'asc') : undefined,
        }),
      });
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater;
      void navigate({
        search: (prev) => ({
          ...prev,
          page: next.pageIndex === 0 ? undefined : next.pageIndex + 1,
          page_size:
            next.pageSize === DEFAULT_PAGE_SIZE ? undefined : next.pageSize,
        }),
      });
    },
  });

  return (
    <div
      className={cn(
        'rounded-lg border bg-background transition-opacity',
        isFetching && 'opacity-70',
      )}
      aria-busy={isFetching}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const right = header.column.columnDef.meta?.align === 'right';
                return (
                  <TableHead
                    key={header.id}
                    className={cn(right && 'text-right')}
                    aria-sort={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'inline-flex items-center gap-1 font-medium hover:text-foreground',
                          right && 'flex-row-reverse',
                        )}
                      >
                        <table.FlexRender header={header} />
                        {sorted === 'asc' ? (
                          <ArrowUp className="size-3.5" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.columnDef.meta?.align === 'right' &&
                      'text-right',
                  )}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TransactionsTableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-lg border bg-background" aria-busy="true">
      <Table>
        <TableHeader>
          <TableRow>
            {['Reference', 'Customer', 'Amount', 'Status', 'Created'].map(
              (h) => (
                <TableHead key={h}>{h}</TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            <TableRow key={i}>
              {Array.from({ length: 5 }, (_, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder cells
                <TableCell key={j}>
                  <div className="h-4 w-full max-w-40 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
