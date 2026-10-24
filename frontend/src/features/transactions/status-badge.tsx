import type { TransactionStatus } from '@/api/resources';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<TransactionStatus, string> = {
  PENDING:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  APPROVED:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  REJECTED:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const TRANSACTION_STATUSES = Object.keys(
  STATUS_LABELS,
) as TransactionStatus[];

export function statusLabel(status: TransactionStatus): string {
  return STATUS_LABELS[status];
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
