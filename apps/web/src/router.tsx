import { RouterProvider, createRouter } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { AppPending, RouterErrorComponent } from "@/router-shell";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
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
  return <RouterProvider router={router} />;
}
