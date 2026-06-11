import { z } from "zod";
import { THEME_PRESET_IDS } from "../lib/theme-presets";

const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color");

const fontFamilySchema = z.string().min(1).max(200);

export const updateThemeSchema = z
  .object({
    primaryColor: hexColorSchema.optional(),
    secondaryColor: hexColorSchema.optional(),
    backgroundColor: hexColorSchema.optional(),
    textColor: hexColorSchema.optional(),
    accentColor: hexColorSchema.optional(),
    fontFamily: fontFamilySchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const applyThemePresetSchema = z.object({
  preset: z.enum(THEME_PRESET_IDS),
});

export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
export type ApplyThemePresetInput = z.infer<typeof applyThemePresetSchema>;
