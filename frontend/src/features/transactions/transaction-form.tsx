import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { mutations, queryKeys } from '@/api';
import type { CreateTransactionRequest } from '@/api/resources';
import { CustomerCombobox } from '@/components/customer-combobox';
import { FieldError } from '@/components/field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCY_CODES, toMinorUnits } from '@/lib/money';
import { generateReference, REFERENCE_PATTERN } from '@/lib/reference';

const formSchema = z
  .object({
    reference: z
      .string()
      .regex(
        REFERENCE_PATTERN,
        'Use TX + 14 digits (YYYYMMDDHHmmSS) + 6 uppercase letters or digits',
      ),
    customerMode: z.enum(['existing', 'new']),
    customerId: z.uuidv7(),
    customerName: z.string().trim().max(255, 'Name is too long'),
    amount: z.string(),
    currency: z.enum(CURRENCY_CODES, { error: 'Choose a currency' }),
  })
  .superRefine((value, context) => {
    if (value.customerMode === 'existing' && !value.customerId) {
      context.addIssue({
        code: 'custom',
        path: ['customerId'],
        message: 'Select a customer',
      });
    }
    if (value.customerMode === 'new' && !value.customerName) {
      context.addIssue({
        code: 'custom',
        path: ['customerName'],
        message: 'Enter the customer name',
      });
    }
    const amount = toMinorUnits(value.amount, value.currency);
    if (!amount.ok) {
      context.addIssue({
        code: 'custom',
        path: ['amount'],
        message: amount.error,
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

function buildRequest(values: FormValues): CreateTransactionRequest {
  const amount = toMinorUnits(values.amount, values.currency);
  if (!amount.ok) throw new Error(amount.error); // already validated by the schema
  const base = {
    reference: values.reference,
    amount: amount.minor,
    currency: values.currency,
  };
  return values.customerMode === 'existing'
    ? { ...base, customer_id: values.customerId }
    : { ...base, customer_name: values.customerName };
}

export function TransactionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>();
  const create = useMutation(mutations.transactions.create());

  const defaultValues: FormValues = {
    reference: generateReference(),
    customerMode: 'existing',
    customerId: '',
    customerName: '',
    amount: '',
    currency: 'XAF',
  };

  const form = useForm({
    defaultValues,
    validators: { onChange: formSchema },
    onSubmit: async ({ value }) => {
      const created = await create
        .mutateAsync(buildRequest(value))
        .catch(() => null);
      if (!created) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      toast.success(`Transaction ${created.reference} created`);
      await navigate({
        to: '/transactions/$transactionId',
        params: { transactionId: created.id },
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>New transaction</CardTitle>
        <CardDescription>
          New transactions start as pending and can then be approved or
          rejected.
        </CardDescription>
      </CardHeader>

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <CardContent className="space-y-5">
          {create.error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{create.error.message}</AlertDescription>
            </Alert>
          )}

          <form.Field name="reference">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Reference</Label>
                <div className="flex gap-2">
                  <Input
                    id={field.name}
                    name={field.name}
                    className="font-mono"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toUpperCase())
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Generate a new reference"
                    onClick={() => field.handleChange(generateReference())}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="customerMode">
            {(field) => (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Customer</legend>
                <div className="inline-flex rounded-md border p-0.5">
                  {(['existing', 'new'] as const).map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      size="sm"
                      variant={
                        field.state.value === mode ? 'secondary' : 'ghost'
                      }
                      aria-pressed={field.state.value === mode}
                      onClick={() => field.handleChange(mode)}
                    >
                      {mode === 'existing'
                        ? 'Existing customer'
                        : 'New customer'}
                    </Button>
                  ))}
                </div>
              </fieldset>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.customerMode}>
            {(mode) =>
              mode === 'existing' ? (
                <form.Field name="customerId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Select customer</Label>
                      <CustomerCombobox
                        id={field.name}
                        value={field.state.value || undefined}
                        selectedName={selectedCustomerName}
                        onBlur={field.handleBlur}
                        onChange={(customer) => {
                          setSelectedCustomerName(customer?.name);
                          field.handleChange(customer?.id ?? '');
                        }}
                      />
                      <FieldError field={field} />
                    </div>
                  )}
                </form.Field>
              ) : (
                <form.Field name="customerName">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Customer name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        autoComplete="off"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError field={field} />
                    </div>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="amount">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Amount</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    inputMode="decimal"
                    placeholder="0.00"
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="currency">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Currency</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as FormValues['currency'])
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t pt-6">
          <Button asChild variant="ghost">
            <Link to="/transactions">Cancel</Link>
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create transaction'}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
