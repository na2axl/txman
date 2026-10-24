import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApiRequestError } from '@/api';
import { onSessionExpired } from '@/auth/session';
import { tokenStore } from '@/auth/token-store';
import { routeTree } from './routeTree.gen';
import './index.css';

const MAX_RETRIES = 2;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES &&
        !(error instanceof ApiRequestError && error.status < 500),
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

onSessionExpired(() => {
  tokenStore.clear();
  queryClient.clear();
  const { pathname, href } = router.state.location;
  if (pathname !== '/login') {
    void router.navigate({ to: '/login', search: { redirect: href } });
  }
});

// biome-ignore lint/style/noNonNullAssertion: the root element is part of index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
