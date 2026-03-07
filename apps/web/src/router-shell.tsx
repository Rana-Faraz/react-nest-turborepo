import type { ErrorComponentProps } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
        {children}
      </div>
    </main>
  );
}

export function AppCard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-10 shadow-sm",
        "sm:p-14",
      )}
    >
      {children}
    </section>
  );
}

export function AppPending() {
  return (
    <AppShell>
      <AppCard>
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Loading
          </p>
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-muted" />
          <div className="h-5 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-5/6 animate-pulse rounded-lg bg-muted" />
        </div>
      </AppCard>
    </AppShell>
  );
}

export function AppErrorState({
  title,
  error,
  onRetry,
}: Readonly<{
  title: string;
  error: unknown;
  onRetry: () => void;
}>) {
  const message = error instanceof Error ? error.message : "Unexpected error";

  return (
    <AppShell>
      <AppCard>
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-destructive">
            Error
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {message}
          </p>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        </div>
      </AppCard>
    </AppShell>
  );
}

export function RouterErrorComponent({
  error,
  reset,
}: Readonly<ErrorComponentProps>) {
  return (
    <AppErrorState
      error={error}
      onRetry={reset}
      title="Route failed to load."
    />
  );
}

export function NotFoundComponent() {
  return (
    <AppShell>
      <AppCard>
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Not Found
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            This route does not exist.
          </h1>
        </div>
      </AppCard>
    </AppShell>
  );
}
