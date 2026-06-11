import type { MenuItem, Theme } from "../../generated/prisma/client";
import { NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { DEFAULT_THEME } from "../lib/theme-defaults";

export type PublicRestaurantDto = {
  name: string;
  slug: string;
  description: string;
};

export type PublicMenuDto = {
  name: string;
  slug: string;
};

export type PublicThemeDto = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
};

export type PublicMenuItemDto = {
  id: string;
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  order: number;
};

export type PublicCategoryDto = {
  id: string;
  name: string;
  order: number;
  items: PublicMenuItemDto[];
};

export type PublicMenuResponseDto = {
  restaurant: PublicRestaurantDto;
  menu: PublicMenuDto;
  theme: PublicThemeDto;
  categories: PublicCategoryDto[];
};

function toPublicThemeDto(theme: Theme | null): PublicThemeDto {
  const source = theme ?? DEFAULT_THEME;

  return {
    primaryColor: source.primaryColor,
    secondaryColor: source.secondaryColor,
    backgroundColor: source.backgroundColor,
    textColor: source.textColor,
    accentColor: source.accentColor,
    fontFamily: source.fontFamily,
  };
}

function toPublicMenuItemDto(item: MenuItem): PublicMenuItemDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price.toFixed(2),
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    allergens: item.allergens,
    order: item.order,
  };
}

export async function getPublicMenu(
  restaurantSlug: string,
  menuSlug: string,
): Promise<PublicMenuResponseDto> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      theme: true,
      menus: {
        where: { slug: menuSlug },
        include: {
          categories: {
            orderBy: { order: "asc" },
            include: {
              items: {
                where: { isAvailable: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!restaurant || !restaurant.isActive) {
    throw new NotFoundError();
  }

  const menu = restaurant.menus[0];

  if (!menu || !menu.isPublished) {
    throw new NotFoundError();
  }

  const categories = menu.categories
    .filter((category) => category.items.length > 0)
    .map((category) => ({
      id: category.id,
      name: category.name,
      order: category.order,
      items: category.items.map(toPublicMenuItemDto),
    }));

  return {
    restaurant: {
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
    },
    menu: {
      name: menu.name,
      slug: menu.slug,
    },
    theme: toPublicThemeDto(restaurant.theme),
    categories,
  };
}
