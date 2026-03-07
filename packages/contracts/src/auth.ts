import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const authSessionSchema = z.object({
  session: z.object({
    id: z.string(),
    expiresAt: z.string().datetime(),
    token: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    userId: z.string(),
  }),
  user: authUserSchema,
});

export const signInEmailBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const signUpEmailBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    name: z.string().trim().min(2).max(50),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type SignInEmailBody = z.infer<typeof signInEmailBodySchema>;
export type SignUpEmailBody = z.infer<typeof signUpEmailBodySchema>;
