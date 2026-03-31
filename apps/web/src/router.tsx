import { RouterProvider, createRouter } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { AppPending, RouterErrorComponent } from "@/router-shell";
import { sessionQueryOptions } from "@/queries/auth";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: null,
  },
  defaultPreload: "intent",
  defaultPendingComponent: AppPending,
  defaultPendingMinMs: 150,
  defaultErrorComponent: RouterErrorComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  const session = queryClient.getQueryData(sessionQueryOptions().queryKey);

  return (
    <RouterProvider router={router} context={{ auth: session ?? null }} />
  );
}
