import {
  signInEmailBodySchema,
  type SignInEmailBody,
} from "@repo/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sessionQueryOptions, signInWithEmail } from "@/queries/auth";
import { router } from "@/router";

function SignInRouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<SignInEmailBody>({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignInEmailBody, string>>
  >({});

  const signInMutation = useMutation({
    mutationFn: signInWithEmail,
    onSuccess: async () => {
      setFormError(null);
      setFieldErrors({});
      await queryClient.invalidateQueries({
        queryKey: sessionQueryOptions().queryKey,
      });
      await queryClient.ensureQueryData(sessionQueryOptions());
      await router.invalidate();
      await navigate({ to: "/" });
    },
    onError: (error) => {
      setFormError(error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = signInEmailBodySchema.safeParse(formValues);

    if (!parsed.success) {
      const errors: Partial<Record<keyof SignInEmailBody, string>> = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SignInEmailBody | undefined;

        if (key) {
          errors[key] = issue.message;
        }
      }

      setFieldErrors(errors);

      return;
    }

    signInMutation.mutate(parsed.data);
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" id="sign-in-form" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="you@example.com"
              type="email"
              value={formValues.email}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete="current-password"
              id="password"
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Enter your password"
              type="password"
              value={formValues.password}
            />
            {fieldErrors.password ? (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            ) : null}
          </div>

          {formError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full"
          disabled={signInMutation.isPending}
          form="sign-in-form"
          type="submit"
        >
          {signInMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            to="/sign-up"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/sign-in")({
  component: SignInRouteComponent,
});
