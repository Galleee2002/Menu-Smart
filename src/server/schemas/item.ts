import { z } from "zod";

const priceSchema = z
  .number()
  .nonnegative()
  .refine(
    (value) => Number.isFinite(value) && Math.round(value * 100) === value * 100,
    { message: "Price must have at most 2 decimal places" },
  );

export const createItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  price: priceSchema,
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.array(z.string().min(1).max(50)).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateItemSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    name: z.string().min(1).max(150).optional(),
    description: z.string().max(1000).optional(),
    price: priceSchema.optional(),
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    allergens: z.array(z.string().min(1).max(50)).optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const reorderItemSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(0),
});

export const reorderItemsSchema = z.object({
  categoryId: z.string().min(1),
  items: z.array(reorderItemSchema).min(1),
});

const bulkPricingBaseSchema = z.object({
  mode: z.enum(["percentage", "fixed"]),
  value: z.number(),
});

export const bulkPricingSchema = z.discriminatedUnion("scope", [
  bulkPricingBaseSchema.extend({
    scope: z.literal("menu"),
    menuId: z.string().min(1),
  }),
  bulkPricingBaseSchema.extend({
    scope: z.literal("category"),
    categoryId: z.string().min(1),
  }),
  bulkPricingBaseSchema.extend({
    scope: z.literal("restaurant"),
    restaurantId: z.string().min(1),
  }),
]);

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
export type BulkPricingInput = z.infer<typeof bulkPricingSchema>;
