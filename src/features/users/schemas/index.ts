import { z } from "zod";

export const userRoleFilterSchema = z.enum(["user", "admin", "all"]);

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: userRoleFilterSchema.optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type UserFilters = z.infer<typeof userFiltersSchema>;
export type UserRoleFilter = z.infer<typeof userRoleFilterSchema>;
