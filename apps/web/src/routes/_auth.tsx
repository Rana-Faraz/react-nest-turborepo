import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/queries/auth";

function AuthLayoutComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>
  );
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions()
    );

    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthLayoutComponent,
});
