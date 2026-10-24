import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomerCombobox } from '@/components/customer-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { statusLabel, TRANSACTION_STATUSES } from './status-badge';
import {
  hasActiveFilters,
  type TransactionsSearch,
} from './transactions-search';

const ALL_STATUSES = 'all';
const SEARCH_DEBOUNCE_MS = 300;

export function TransactionsToolbar({
  search,
}: {
  search: TransactionsSearch;
}) {
  const navigate = useNavigate({ from: '/transactions/' });
  const [text, setText] = useState(search.search ?? '');
  const debouncedText = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);

  // Push the debounced text to the URL; reset to page 1 when it changes.
  useEffect(() => {
    const next = debouncedText.trim() || undefined;
    if (next === search.search) return;
    void navigate({
      search: (prev) => ({ ...prev, search: next, page: undefined }),
      replace: true,
    });
  }, [debouncedText, navigate, search.search]);

  // Keep the input in sync when the URL changes elsewhere (reset, back button).
  useEffect(() => {
    setText(search.search ?? '');
  }, [search.search]);

  const setFilter = (patch: Partial<TransactionsSearch>) =>
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: undefined }),
    });

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search transactions"
          placeholder="Search by reference or customer"
          className="pl-9"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <Select
        value={search.status ?? ALL_STATUSES}
        onValueChange={(value) =>
          setFilter({
            status:
              value === ALL_STATUSES
                ? undefined
                : (value as TransactionsSearch['status']),
          })
        }
      >
        <SelectTrigger aria-label="Filter by status" className="w-full md:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
          {TRANSACTION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="md:w-56">
        <CustomerCombobox
          value={search.customer_id}
          placeholder="All customers"
          onChange={(customer) => setFilter({ customer_id: customer?.id })}
        />
      </div>

      {hasActiveFilters(search) && (
        <Button
          variant="ghost"
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
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
