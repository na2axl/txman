import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ApiRequestError, queries } from '@/api';
import { ErrorState } from '@/components/query-states';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionDetails } from '@/features/transactions/transaction-details';

export const Route = createFileRoute('/_authed/transactions/$transactionId')({
  component: TransactionDetailsPage,
});

function TransactionDetailsPage() {
  const { transactionId } = Route.useParams();
  const transaction = useQuery(queries.transactions.detail(transactionId));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/transactions">
          <ArrowLeft className="size-4" />
          Back to transactions
        </Link>
      </Button>

      {transaction.isPending ? (
        <div
          className="space-y-4 rounded-lg border bg-background p-6"
          aria-busy="true"
        >
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-6 pt-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ) : transaction.isError ? (
        <ErrorState
          title={
            transaction.error instanceof ApiRequestError &&
            transaction.error.status === 404
              ? 'Transaction not found'
              : 'Could not load the transaction'
          }
          error={transaction.error}
          onRetry={() => void transaction.refetch()}
        />
      ) : (
        <TransactionDetails transaction={transaction.data} />
      )}
    </div>
  );
}
