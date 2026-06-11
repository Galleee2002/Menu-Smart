import { z } from "zod";

export const createCategorySchema = z.object({
  menuId: z.string().min(1),
  name: z.string().min(1).max(100),
  order: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const reorderItemSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(0),
});

export const reorderCategoriesSchema = z.object({
  menuId: z.string().min(1),
  items: z.array(reorderItemSchema).min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
