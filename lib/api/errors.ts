import { AxiosError } from 'axios';

/**
 * Extracts a human-readable error string from an API error response.
 *
 * Supports two ASP.NET Core formats:
 * 1. ProblemDetails:  { title: "...", errors?: { Field: ["msg"] } }
 * 2. Validation dict: { Field: ["msg1", "msg2"] }
 */
export function extractApiError(err: unknown, fallback = 'Неизвестная ошибка'): string {
  const data = (err as AxiosError)?.response?.data as Record<string, unknown> | undefined;
  if (!data) return fallback;

  // ProblemDetails with nested errors  { title, errors: { Field: [...] } }
  const errors = data.errors as Record<string, string[]> | undefined;
  if (errors && typeof errors === 'object') {
    return flattenErrors(errors);
  }

  // ProblemDetails without errors  { title: "..." }
  if (typeof data.title === 'string') {
    return data.title;
  }

  // Plain validation dict  { Field: ["msg1", "msg2"] }
  if (isValidationDict(data)) {
    return flattenErrors(data as Record<string, string[]>);
  }

  return fallback;
}

function isValidationDict(data: Record<string, unknown>): boolean {
  return Object.values(data).some(
    (v) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'string',
  );
}

function flattenErrors(dict: Record<string, string[]>): string {
  return Object.values(dict).flat().join('\n');
}
