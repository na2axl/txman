import type { CustomerResource } from '@/api/resources';
import { Model } from './model';

export class CustomerModel extends Model<CustomerResource> {
  get id() {
    return this._data.id;
  }

  get name() {
    return this._data.name;
  }
}
