import { z } from "zod";

export const tournamentStatusSchema = z.enum([
  "draft",
  "published",
  "registration_open",
  "in_progress",
  "completed",
  "archived",
]);

export const tournamentSummarySchema = z.object({
  id: z.uuid(),
  slug: z.string().trim().min(2).max(64),
  name: z.string().trim().min(2).max(100),
  gameKey: z.string().trim().min(2).max(32),
  formatKey: z.string().trim().min(2).max(32),
  status: tournamentStatusSchema,
  startsAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const listTournamentsQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  gameKey: z.string().trim().min(2).max(32).optional(),
  status: tournamentStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listTournamentsResponseSchema = z.object({
  items: z.array(tournamentSummarySchema),
  total: z.number().int().nonnegative(),
});

export const createTournamentBodySchema = z.object({
  slug: z.string().trim().min(2).max(64),
  name: z.string().trim().min(2).max(100),
  gameKey: z.string().trim().min(2).max(32),
  formatKey: z.string().trim().min(2).max(32),
  startsAt: z.string().datetime(),
});

export type TournamentStatus = z.infer<typeof tournamentStatusSchema>;
export type TournamentSummary = z.infer<typeof tournamentSummarySchema>;
export type ListTournamentsQuery = z.infer<typeof listTournamentsQuerySchema>;
export type ListTournamentsResponse = z.infer<
  typeof listTournamentsResponseSchema
>;
export type CreateTournamentBody = z.infer<typeof createTournamentBodySchema>;
