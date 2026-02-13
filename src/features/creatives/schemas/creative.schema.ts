import { z } from "zod";

export const creativeCategorySchema = z.enum([
  "instagram_post",
  "instagram_story",
  "facebook_post",
  "linkedin_post",
  "banner",
  "flyer",
  "other",
]);

export const createCreativeSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL da imagem inválida"),
  category: creativeCategorySchema,
});

export const updateCreativeSchema = createCreativeSchema.partial();

export type CreateCreativeInput = z.infer<typeof createCreativeSchema>;
export type UpdateCreativeInput = z.infer<typeof updateCreativeSchema>;
