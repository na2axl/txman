import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist.
      </p>
    </main>
  ),
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
      {import.meta.env.DEV && (
        <ReactQueryDevtools buttonPosition="bottom-left" />
      )}
    </>
  );
}
