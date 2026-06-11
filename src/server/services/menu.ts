import type { Menu } from "../../generated/prisma/client";
import { ConflictError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { generateUniqueMenuSlug } from "../lib/slugify";
import type { CreateMenuInput, UpdateMenuInput } from "../schemas/menu";

export type MenuDto = {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toMenuDto(menu: Menu): MenuDto {
  return {
    id: menu.id,
    restaurantId: menu.restaurantId,
    name: menu.name,
    slug: menu.slug,
    isPublished: menu.isPublished,
    createdAt: menu.createdAt.toISOString(),
    updatedAt: menu.updatedAt.toISOString(),
  };
}

async function getUserMembership(userId: string, restaurantId?: string) {
  if (restaurantId) {
    const membership = await prisma.userRestaurant.findUnique({
      where: {
        userId_restaurantId: { userId, restaurantId },
      },
    });

    if (!membership) {
      throw new NotFoundError();
    }

    return membership;
  }

  const membership = await prisma.userRestaurant.findFirst({
    where: { userId },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  return membership;
}

export async function listMenus(
  userId: string,
  restaurantId?: string,
): Promise<MenuDto[]> {
  const membership = restaurantId
    ? await prisma.userRestaurant.findUnique({
        where: {
          userId_restaurantId: { userId, restaurantId },
        },
      })
    : await prisma.userRestaurant.findFirst({
        where: { userId },
      });

  if (!membership) {
    return [];
  }

  const menus = await prisma.menu.findMany({
    where: { restaurantId: membership.restaurantId },
    orderBy: { createdAt: "asc" },
  });

  return menus.map(toMenuDto);
}

export async function createMenu(
  userId: string,
  input: CreateMenuInput,
): Promise<MenuDto> {
  const membership = await getUserMembership(userId, input.restaurantId);
  const slug =
    input.slug ??
    (await generateUniqueMenuSlug(membership.restaurantId, input.name));

  if (input.slug) {
    const slugTaken = await prisma.menu.findUnique({
      where: {
        restaurantId_slug: {
          restaurantId: membership.restaurantId,
          slug,
        },
      },
      select: { id: true },
    });

    if (slugTaken) {
      throw new ConflictError("Slug already taken");
    }
  }

  const menu = await prisma.menu.create({
    data: {
      restaurantId: membership.restaurantId,
      name: input.name,
      slug,
      isPublished: input.isPublished ?? false,
    },
  });

  return toMenuDto(menu);
}

export async function updateMenu(
  menuId: string,
  restaurantId: string,
  input: UpdateMenuInput,
): Promise<MenuDto> {
  if (input.slug) {
    const slugTaken = await prisma.menu.findFirst({
      where: {
        restaurantId,
        slug: input.slug,
        NOT: { id: menuId },
      },
      select: { id: true },
    });

    if (slugTaken) {
      throw new ConflictError("Slug already taken");
    }
  }

  const menu = await prisma.menu.update({
    where: { id: menuId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    },
  });

  return toMenuDto(menu);
}

export async function deleteMenu(menuId: string): Promise<void> {
  await prisma.menu.delete({
    where: { id: menuId },
  });
}
