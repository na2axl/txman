import { createFileRoute } from '@tanstack/react-router';
import { TransactionForm } from '@/features/transactions/transaction-form';

export const Route = createFileRoute('/_authed/transactions/new')({
  component: () => (
    <div className="mx-auto max-w-2xl">
      <TransactionForm />
    </div>
  ),
});
