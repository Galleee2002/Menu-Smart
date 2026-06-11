import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");

export const createMenuSchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema.optional(),
  restaurantId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const updateMenuSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    slug: slugSchema.optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
