interface ProblemFieldError {
  field: string;
  message: string;
}

interface ProblemBody {
  title?: string;
  detail?: string;
  status?: number;
  request_id?: string;
  errors?: ProblemFieldError[];
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly requestId: string | null;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> = {},
    requestId: string | null = null,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function groupByField(errors: ProblemFieldError[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const { field, message } of errors) {
    grouped[field] = [...(grouped[field] ?? []), message];
  }
  return grouped;
}

export function toApiRequestError(
  raw: unknown,
  status: number,
): ApiRequestError {
  const fallback =
    status >= 500
      ? 'The server is unavailable right now. Please try again in a moment.'
      : `Request failed with status ${status}`;
  if (!isRecord(raw)) return new ApiRequestError(status, fallback);

  const body = raw as ProblemBody;
  return new ApiRequestError(
    status,
    body.detail ?? body.title ?? fallback,
    groupByField(body.errors ?? []),
    body.request_id ?? null,
  );
}

export class ApiNetworkError extends Error {
  constructor(cause: unknown) {
    super('Unable to reach the server. Check your connection and try again.', {
      cause,
    });
    this.name = 'ApiNetworkError';
  }
}
