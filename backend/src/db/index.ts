import { financesRelations } from './finances.js';

export * from './finances.js';
export * from './iam.js';

export const relations = {
  ...financesRelations,
};
