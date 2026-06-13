import type { Theme } from "../../generated/prisma/client";
import { NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import {
  THEME_PRESETS,
  type ThemePresetId,
} from "../lib/theme-presets";
import type { UpdateThemeInput } from "../schemas/theme";

export type ThemeDto = {
  id: string;
  restaurantId: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  createdAt: string;
  updatedAt: string;
};

function toThemeDto(theme: Theme): ThemeDto {
  return {
    id: theme.id,
    restaurantId: theme.restaurantId,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
    accentColor: theme.accentColor,
    fontFamily: theme.fontFamily,
    createdAt: theme.createdAt.toISOString(),
    updatedAt: theme.updatedAt.toISOString(),
  };
}

async function getThemeOrThrow(restaurantId: string): Promise<Theme> {
  const theme = await prisma.theme.findUnique({
    where: { restaurantId },
  });

  if (!theme) {
    throw new NotFoundError();
  }

  return theme;
}

export async function getThemeForMember(
  userId: string,
  restaurantId: string,
): Promise<ThemeDto> {
  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  const theme = await getThemeOrThrow(restaurantId);
  return toThemeDto(theme);
}

export async function updateTheme(
  restaurantId: string,
  input: UpdateThemeInput,
): Promise<ThemeDto> {
  await getThemeOrThrow(restaurantId);

  const theme = await prisma.theme.update({
    where: { restaurantId },
    data: {
      ...(input.primaryColor !== undefined
        ? { primaryColor: input.primaryColor }
        : {}),
      ...(input.secondaryColor !== undefined
        ? { secondaryColor: input.secondaryColor }
        : {}),
      ...(input.backgroundColor !== undefined
        ? { backgroundColor: input.backgroundColor }
        : {}),
      ...(input.textColor !== undefined ? { textColor: input.textColor } : {}),
      ...(input.accentColor !== undefined
        ? { accentColor: input.accentColor }
        : {}),
      ...(input.fontFamily !== undefined ? { fontFamily: input.fontFamily } : {}),
    },
  });

  return toThemeDto(theme);
}

export async function applyThemePreset(
  restaurantId: string,
  presetId: ThemePresetId,
): Promise<ThemeDto> {
  await getThemeOrThrow(restaurantId);

  const theme = await prisma.theme.update({
    where: { restaurantId },
    data: THEME_PRESETS[presetId],
  });

  return toThemeDto(theme);
}
