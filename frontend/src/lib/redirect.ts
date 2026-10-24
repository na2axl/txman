export function safeRedirectPath(target: string | undefined): string {
  if (target?.startsWith('/') && !target.startsWith('//')) return target;
  return '/transactions';
}
