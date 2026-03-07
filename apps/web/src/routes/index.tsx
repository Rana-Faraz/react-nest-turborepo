import type { CreateDemoSubmissionBody } from "@repo/contracts";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { asApiError } from "@/lib/api";
import { healthQueryOptions } from "@/queries/health";
import {
  createDemoSubmission,
  demoQueryKeys,
  demoSubmissionsQueryOptions,
} from "@/queries/demo";
import { auth } from "@/lib/auth";
import { AppCard, AppShell } from "@/router-shell";

function HomeRouteComponent() {
  const { data: health } = useSuspenseQuery(healthQueryOptions());
  const { data: submissions } = useSuspenseQuery(
    demoSubmissionsQueryOptions({ limit: 5 }),
  );
  const session = auth.useSession();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<CreateDemoSubmissionBody>({
    name: "",
    score: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CreateDemoSubmissionBody, string[]>>
  >({});

  const createSubmissionMutation = useMutation({
    mutationFn: createDemoSubmission,
    onSuccess: async () => {
      setFormError(null);
      setFieldErrors({});
      setFormValues({ name: "", score: 0 });
      await queryClient.invalidateQueries({ queryKey: demoQueryKeys.all });
    },
    onError: (error) => {
      const apiError = asApiError(error);

      setFormError(apiError.formErrors[0] ?? apiError.message);
      setFieldErrors({
        name: apiError.fieldErrors.name,
        score: apiError.fieldErrors.score,
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    createSubmissionMutation.mutate(formValues);
  };

  return (
    <AppShell>
      <AppCard>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Frontend Foundation
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Shared Zod contracts are wired across Nest and React.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The canonical API schema lives in <code>@repo/contracts</code>.
              Nest derives DTOs through <code>nestjs-zod</code>, and the
              frontend uses the same schemas for request shaping, response
              parsing, and mutation input validation.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border bg-background/70 p-5 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Service
              </p>
              <p className="text-lg font-medium">{health.service}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Status
              </p>
              <p className="text-lg font-medium">{health.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Auth Session
              </p>
              <p className="text-lg font-medium">
                {session.isPending
                  ? "loading"
                  : session.data?.user?.email ?? "anonymous"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4 rounded-2xl border border-border bg-background/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Query Demo
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    `GET /demo/submissions?limit=5`
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total: {submissions.total}
                </p>
              </div>

              <div className="space-y-3">
                {submissions.items.map((submission) => (
                  <article
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                    key={submission.id}
                  >
                    <div>
                      <p className="font-medium">{submission.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-lg font-semibold">{submission.score}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-border bg-background/70 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Mutation Demo
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  `POST /demo/submissions`
                </h2>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Name</span>
                  <input
                    className="h-11 w-full rounded-xl border border-border bg-card px-3"
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    value={formValues.name}
                  />
                  {fieldErrors.name?.length ? (
                    <p className="text-sm text-destructive">
                      {fieldErrors.name[0]}
                    </p>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Score</span>
                  <input
                    className="h-11 w-full rounded-xl border border-border bg-card px-3"
                    max={100}
                    min={0}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        score: Number(event.target.value),
                      }))
                    }
                    type="number"
                    value={formValues.score}
                  />
                  {fieldErrors.score?.length ? (
                    <p className="text-sm text-destructive">
                      {fieldErrors.score[0]}
                    </p>
                  ) : null}
                </label>

                {formError ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}

                <button
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={createSubmissionMutation.isPending}
                  type="submit"
                >
                  {createSubmissionMutation.isPending
                    ? "Submitting..."
                    : "Create Submission"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </AppCard>
    </AppShell>
  );
}

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(healthQueryOptions()),
      context.queryClient.ensureQueryData(
        demoSubmissionsQueryOptions({ limit: 5 }),
      ),
    ]);
  },
  component: HomeRouteComponent,
});
