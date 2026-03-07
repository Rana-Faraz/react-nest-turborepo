import { z } from "zod";

export const demoSubmissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50),
  score: z.number().int().min(0).max(100),
  createdAt: z.string().datetime(),
});

export const listDemoSubmissionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
  search: z.string().trim().min(1).max(50).optional(),
});

export const listDemoSubmissionsResponseSchema = z.object({
  items: z.array(demoSubmissionSchema),
  total: z.number().int().nonnegative(),
});

export const createDemoSubmissionBodySchema = z.object({
  name: z.string().trim().min(2).max(50),
  score: z.number().int().min(0).max(100),
});

export const createDemoSubmissionResponseSchema = z.object({
  item: demoSubmissionSchema,
});

export type DemoSubmission = z.infer<typeof demoSubmissionSchema>;
export type ListDemoSubmissionsQuery = z.infer<
  typeof listDemoSubmissionsQuerySchema
>;
export type ListDemoSubmissionsResponse = z.infer<
  typeof listDemoSubmissionsResponseSchema
>;
export type CreateDemoSubmissionBody = z.infer<
  typeof createDemoSubmissionBodySchema
>;
export type CreateDemoSubmissionResponse = z.infer<
  typeof createDemoSubmissionResponseSchema
>;
