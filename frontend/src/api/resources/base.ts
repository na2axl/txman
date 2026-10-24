export type Uuid = string;
export type ISODateTime = string;

export interface OffsetPaginatedEnvelope<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}

export interface CollectionEnvelope<T> {
  data: T[];
}
