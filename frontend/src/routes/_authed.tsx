import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { queries } from '@/api';
import { tokenStore } from '@/auth/token-store';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ location }) => {
    if (!tokenStore.get()) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const me = useQuery(queries.auth.me());

  const logout = async () => {
    tokenStore.clear();
    queryClient.clear();
    await router.navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/transactions" className="font-semibold">
            Transaction Manager
          </Link>
          <div className="flex items-center gap-3">
            {me.data && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {me.data.username}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
