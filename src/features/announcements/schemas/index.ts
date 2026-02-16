import { z } from "zod";
import type { announcement } from "@/core/db/schema";

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  active: z.boolean(),
});

export const updateAnnouncementSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  active: z.boolean(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type Announcement = typeof announcement.$inferSelect;
