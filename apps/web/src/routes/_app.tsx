import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  Outlet,
  createFileRoute,
  redirect,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { sessionQueryOptions, signOut } from "@/queries/auth";
import { router } from "@/router";

function AppNavbar() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, null);
      await router.invalidate();
      await navigate({ to: "/sign-in" });
    },
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link className="text-lg font-semibold tracking-tight" to="/">
          App
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.email}
              </span>
              <Separator className="h-5" orientation="vertical" />
              <Button
                disabled={signOutMutation.isPending}
                onClick={() => signOutMutation.mutate()}
                size="sm"
                variant="ghost"
              >
                {signOutMutation.isPending ? "Signing out..." : "Sign out"}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function AppLayoutComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar />
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions()
    );

    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(sessionQueryOptions());
  },
  component: AppLayoutComponent,
});
