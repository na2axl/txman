import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { mutations, queryKeys } from '@/api';
import type { TransactionModel } from '@/api/models';
import type { TransactionStatus } from '@/api/resources';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge, statusLabel } from './status-badge';

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'long',
  timeStyle: 'medium',
});

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

export function TransactionDetails({
  transaction,
}: {
  transaction: TransactionModel;
}) {
  const queryClient = useQueryClient();
  const updateStatus = useMutation({
    ...mutations.transactions.updateStatus(transaction.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.transactions.detail(transaction.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      toast.success(`Transaction ${statusLabel(updated.status).toLowerCase()}`);
    },
    // The server is the source of truth: on a conflict, reload the real status.
    onError: (error) => {
      toast.error(error.message);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.detail(transaction.id),
      });
    },
  });

  const change = (status: TransactionStatus) => updateStatus.mutate({ status });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="font-mono text-xl">
              {transaction.reference}
            </CardTitle>
            <CardDescription>Transaction details</CardDescription>
          </div>
          <StatusBadge status={transaction.status} />
        </div>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-6 sm:grid-cols-2">
          <Detail label="Customer">
            <Link
              to="/transactions"
              search={{ customer_id: transaction.customer.id }}
              className="hover:underline"
            >
              {transaction.customer.name}
            </Link>
          </Detail>
          <Detail label="Amount">
            <span className="tabular-nums">{transaction.formattedAmount}</span>
          </Detail>
          <Detail label="Currency">{transaction.currency}</Detail>
          <Detail label="Created">
            {dateFormat.format(transaction.createdAt)}
          </Detail>
          <Detail label="Last updated">
            {dateFormat.format(transaction.updatedAt)}
          </Detail>
        </dl>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-3 border-t pt-6">
        {transaction.isFinal ? (
          <p className="text-sm text-muted-foreground">
            This transaction is {statusLabel(transaction.status).toLowerCase()}{' '}
            and can no longer be changed.
          </p>
        ) : (
          <>
            <Button
              disabled={
                updateStatus.isPending ||
                !transaction.canTransitionTo('APPROVED')
              }
              onClick={() => change('APPROVED')}
            >
              <Check className="size-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              disabled={
                updateStatus.isPending ||
                !transaction.canTransitionTo('REJECTED')
              }
              onClick={() => change('REJECTED')}
            >
              <X className="size-4" />
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
