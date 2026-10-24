import { describe, expect, it } from 'vitest';
import type { TransactionResource } from '@/api/resources';
import { TransactionModel } from './transaction';

const resource: TransactionResource = {
  id: '019a0000-0000-7000-8000-000000000001',
  reference: 'TX20260101090000DEMO01',
  customer: {
    id: '019a0000-0000-7000-8000-0000000000c1',
    name: 'Amara Diallo',
  },
  amount: 12550,
  currency: 'USD',
  status: 'PENDING',
  allowed_transitions: ['APPROVED', 'REJECTED'],
  created_at: '2026-01-01T09:00:00.000Z',
  updated_at: '2026-01-02T10:30:00.000Z',
};

describe('TransactionModel', () => {
  it('maps wire fields to camelCase and dates', () => {
    const model = new TransactionModel(resource);
    expect(model.customer.name).toBe('Amara Diallo');
    expect(model.createdAt).toEqual(new Date('2026-01-01T09:00:00.000Z'));
    expect(model.updatedAt).toEqual(new Date('2026-01-02T10:30:00.000Z'));
    expect(model.formattedAmount).toContain('125.50');
  });

  it('derives transition state from allowed_transitions', () => {
    const pending = new TransactionModel(resource);
    expect(pending.isPending).toBe(true);
    expect(pending.isFinal).toBe(false);
    expect(pending.canTransitionTo('APPROVED')).toBe(true);

    const approved = new TransactionModel({
      ...resource,
      status: 'APPROVED',
      allowed_transitions: [],
    });
    expect(approved.isFinal).toBe(true);
    expect(approved.canTransitionTo('REJECTED')).toBe(false);
  });

  it('exposes the raw resource', () => {
    expect(new TransactionModel(resource).$raw).toBe(resource);
  });
});
