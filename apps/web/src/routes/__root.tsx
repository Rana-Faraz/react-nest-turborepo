import { QueryErrorResetBoundary, type QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  AppErrorState,
  AppPending,
  NotFoundComponent,
} from "@/router-shell";

export interface RouterContext {
  queryClient: QueryClient;
}

function RootRouteComponent() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <AppErrorState
              error={error}
              onRetry={resetErrorBoundary}
              title="Something went wrong."
            />
          )}
          onReset={reset}
        >
          <Suspense fallback={<AppPending />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRouteComponent,
  notFoundComponent: NotFoundComponent,
});
