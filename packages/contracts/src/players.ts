import { z } from "zod";

export const playerGameProfileSchema = z.object({
  gameKey: z.string().min(2).max(32),
  handle: z.string().trim().min(2).max(32),
  rank: z.string().trim().max(32).nullable(),
});

export const playerSummarySchema = z.object({
  id: z.uuid(),
  displayName: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50),
  countryCode: z.string().trim().length(2).nullable(),
  profiles: z.array(playerGameProfileSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const listPlayersQuerySchema = z.object({
  search: z.string().trim().min(1).max(50).optional(),
  gameKey: z.string().trim().min(2).max(32).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listPlayersResponseSchema = z.object({
  items: z.array(playerSummarySchema),
  total: z.number().int().nonnegative(),
});

export const createPlayerBodySchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50),
  countryCode: z.string().trim().length(2).nullable(),
});

export type PlayerGameProfile = z.infer<typeof playerGameProfileSchema>;
export type PlayerSummary = z.infer<typeof playerSummarySchema>;
export type ListPlayersQuery = z.infer<typeof listPlayersQuerySchema>;
export type ListPlayersResponse = z.infer<typeof listPlayersResponseSchema>;
export type CreatePlayerBody = z.infer<typeof createPlayerBodySchema>;
