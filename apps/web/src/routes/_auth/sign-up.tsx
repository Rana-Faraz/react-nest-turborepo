import {
  signUpEmailBodySchema,
  type SignUpEmailBody,
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
import { sessionQueryOptions, signUpWithEmail } from "@/queries/auth";
import { router } from "@/router";

function SignUpRouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<SignUpEmailBody>({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignUpEmailBody, string>>
  >({});

  const signUpMutation = useMutation({
    mutationFn: signUpWithEmail,
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

    const parsed = signUpEmailBodySchema.safeParse(formValues);

    if (!parsed.success) {
      const errors: Partial<Record<keyof SignUpEmailBody, string>> = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SignUpEmailBody | undefined;

        if (key) {
          errors[key] = issue.message;
        }
      }

      setFieldErrors(errors);

      return;
    }

    signUpMutation.mutate({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
    });
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your details below to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" id="sign-up-form" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              autoComplete="name"
              id="name"
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Your name"
              type="text"
              value={formValues.name}
            />
            {fieldErrors.name ? (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>

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
              autoComplete="new-password"
              id="password"
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="At least 8 characters"
              type="password"
              value={formValues.password}
            />
            {fieldErrors.password ? (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              autoComplete="new-password"
              id="confirmPassword"
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              placeholder="Confirm your password"
              type="password"
              value={formValues.confirmPassword}
            />
            {fieldErrors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmPassword}
              </p>
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
          disabled={signUpMutation.isPending}
          form="sign-up-form"
          type="submit"
        >
          {signUpMutation.isPending ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            to="/sign-in"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/sign-up")({
  component: SignUpRouteComponent,
});
