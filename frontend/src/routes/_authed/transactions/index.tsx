import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { queries } from '@/api';
import type { ListTransactionsParams } from '@/api/resources';
import { EmptyState, ErrorState } from '@/components/query-states';
import { Button } from '@/components/ui/button';
import { TransactionsPagination } from '@/features/transactions/transactions-pagination';
import {
  DEFAULT_PAGE_SIZE,
  hasActiveFilters,
  transactionsSearchSchema,
} from '@/features/transactions/transactions-search';
import {
  TransactionsTable,
  TransactionsTableSkeleton,
} from '@/features/transactions/transactions-table';
import { TransactionsToolbar } from '@/features/transactions/transactions-toolbar';

export const Route = createFileRoute('/_authed/transactions/')({
  validateSearch: transactionsSearchSchema,
  component: TransactionsPage,
});

function TransactionsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const params: ListTransactionsParams = search;
  const transactions = useQuery(queries.transactions.list(params));

  const filtered = hasActiveFilters(search);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Review, approve, or reject customer transactions.
          </p>
        </div>
        <Button asChild>
          <Link to="/transactions/new">
            <Plus className="size-4" />
            New transaction
          </Link>
        </Button>
      </div>

      <TransactionsToolbar search={search} />

      {transactions.isPending ? (
        <TransactionsTableSkeleton
          rows={search.page_size ?? DEFAULT_PAGE_SIZE}
        />
      ) : transactions.isError ? (
        <ErrorState
          title="Could not load transactions"
          error={transactions.error}
          onRetry={() => void transactions.refetch()}
        />
      ) : transactions.data.items.length === 0 ? (
        filtered ? (
          <EmptyState
            title="No transactions match your filters"
            description="Try a different search term or clear the filters."
            action={
              <Button
                variant="outline"
                onClick={() =>
                  void navigate({
                    search: (prev) => ({
                      ...prev,
                      search: undefined,
                      status: undefined,
                      customer_id: undefined,
                      page: undefined,
                    }),
                  })
                }
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Create the first transaction to see it here."
            action={
              <Button asChild>
                <Link to="/transactions/new">New transaction</Link>
              </Button>
            }
          />
        )
      ) : (
        <>
          <TransactionsTable
            items={transactions.data.items}
            total={transactions.data.meta.total}
            search={search}
            isFetching={transactions.isFetching}
          />
          <TransactionsPagination
            meta={transactions.data.meta}
            search={search}
          />
        </>
      )}
    </div>
  );
}
