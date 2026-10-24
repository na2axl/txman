import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { queries } from '@/api';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

interface CustomerComboboxProps {
  id?: string;
  value: string | undefined;
  selectedName?: string;
  placeholder?: string;
  onChange: (customer: { id: string; name: string } | undefined) => void;
  onBlur?: () => void;
}

/**
 * Searchable customer picker backed by a `GET /customers?search=` request
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function CustomerCombobox({
  id,
  value,
  selectedName,
  placeholder = 'Select customer',
  onChange,
  onBlur,
}: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input.trim(), 250);
  const customers = useQuery({
    ...queries.customers.search(debounced),
    enabled: open,
  });

  const label = value
    ? (selectedName ??
      customers.data?.find((customer) => customer.id === value)?.name ??
      'Selected customer')
    : placeholder;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search customers…"
            value={input}
            onValueChange={setInput}
          />
          <CommandList>
            {customers.isPending ? (
              <p className="p-3 text-sm text-muted-foreground">Loading…</p>
            ) : customers.isError ? (
              <p className="p-3 text-sm text-destructive">
                Could not load customers.
              </p>
            ) : (
              <>
                <CommandEmpty>No customers found.</CommandEmpty>
                <CommandGroup>
                  {customers.data.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => {
                        onChange(
                          customer.id === value
                            ? undefined
                            : { id: customer.id, name: customer.name },
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'size-4',
                          customer.id === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {customer.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
