import type { CreateDemoSubmissionBody } from "@repo/contracts";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { asApiError } from "@/lib/api";
import { healthQueryOptions } from "@/queries/health";
import {
  createDemoSubmission,
  demoQueryKeys,
  demoSubmissionsQueryOptions,
} from "@/queries/demo";
import { AppCard, AppShell } from "@/router-shell";

function HomeRouteComponent() {
  const { data: health } = useSuspenseQuery(healthQueryOptions());
  const { data: submissions } = useSuspenseQuery(
    demoSubmissionsQueryOptions({ limit: 5 })
  );
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
      const nameErrors = apiError.fieldErrors["name"];
      const scoreErrors = apiError.fieldErrors["score"];

      setFormError(apiError.formErrors[0] ?? apiError.message);
      setFieldErrors({
        ...(nameErrors ? { name: nameErrors } : {}),
        ...(scoreErrors ? { score: scoreErrors } : {}),
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
            <p className="text-muted-foreground text-sm font-medium tracking-[0.24em] uppercase">
              Frontend Foundation
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Shared Zod contracts are wired across Nest and React.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
              The canonical API schema lives in <code>@repo/contracts</code>.
              Nest derives DTOs through <code>nestjs-zod</code>, and the
              frontend uses the same schemas for request shaping, response
              parsing, and mutation input validation.
            </p>
          </div>

          <div className="border-border bg-background/70 grid gap-4 rounded-2xl border p-5 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                Service
              </p>
              <p className="text-lg font-medium">{health.service}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                Status
              </p>
              <p className="text-lg font-medium">{health.status}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="border-border bg-background/70 space-y-4 rounded-2xl border p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                    Query Demo
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    `GET /demo/submissions?limit=5`
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  Total: {submissions.total}
                </p>
              </div>

              <div className="space-y-3">
                {submissions.items.map((submission) => (
                  <article
                    className="border-border bg-card flex items-center justify-between rounded-xl border px-4 py-3"
                    key={submission.id}
                  >
                    <div>
                      <p className="font-medium">{submission.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-lg font-semibold">{submission.score}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-border bg-background/70 space-y-4 rounded-2xl border p-5">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
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
                    className="border-border bg-card h-11 w-full rounded-xl border px-3"
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    value={formValues.name}
                  />
                  {fieldErrors.name?.length ? (
                    <p className="text-destructive text-sm">
                      {fieldErrors.name[0]}
                    </p>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Score</span>
                  <input
                    className="border-border bg-card h-11 w-full rounded-xl border px-3"
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
                    <p className="text-destructive text-sm">
                      {fieldErrors.score[0]}
                    </p>
                  ) : null}
                </label>

                {formError ? (
                  <p className="text-destructive text-sm">{formError}</p>
                ) : null}

                <button
                  className="bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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

export const Route = createFileRoute("/_app/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(healthQueryOptions()),
      context.queryClient.ensureQueryData(
        demoSubmissionsQueryOptions({ limit: 5 })
      ),
    ]);
  },
  component: HomeRouteComponent,
});
