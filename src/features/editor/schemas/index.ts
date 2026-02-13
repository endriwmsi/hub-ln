import { z } from "zod";

export const canvasFormatSchema = z.enum(["9:16", "1:1", "3:4"]);

export const textTypeSchema = z.enum(["title", "paragraph"]);

export const shapeTypeSchema = z.enum(["rect", "circle", "triangle", "line"]);

export const baseElementSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  scaleX: z.number().positive().default(1),
  scaleY: z.number().positive().default(1),
  opacity: z.number().min(0).max(1).default(1),
  draggable: z.boolean().default(true),
});

export const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  textType: textTypeSchema,
  text: z.string().min(1),
  fontSize: z.number().positive(),
  fontFamily: z.string().default("Arial"),
  fontStyle: z.enum(["normal", "bold", "italic"]).default("normal"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  fill: z.string().default("#000000"),
  lineHeight: z.number().positive().default(1.2),
});

export const shapeElementSchema = baseElementSchema.extend({
  type: z.literal("shape"),
  shapeType: shapeTypeSchema,
  fill: z.string(),
  stroke: z.string().default("#000000"),
  strokeWidth: z.number().min(0).default(0),
  cornerRadius: z.number().min(0).optional(),
});

export const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  src: z.url(),
});

export const canvasElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  shapeElementSchema,
  imageElementSchema,
]);

export const uploadImageSchema = z.object({
  file: z.instanceof(File),
  format: canvasFormatSchema,
});

export const createCreativeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  format: canvasFormatSchema,
  elements: z.array(canvasElementSchema),
  backgroundColor: z.string().default("#ffffff"),
});
