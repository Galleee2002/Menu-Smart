import type { MenuItem } from "../../generated/prisma/client";
import { Prisma } from "../../generated/prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  BulkPricingInput,
  CreateItemInput,
  ReorderItemsInput,
  UpdateItemInput,
} from "../schemas/item";

export type MenuItemDto = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  order: number;
};

function toMenuItemDto(item: MenuItem): MenuItemDto {
  return {
    id: item.id,
    categoryId: item.categoryId,
    name: item.name,
    description: item.description,
    price: item.price.toFixed(2),
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    allergens: item.allergens,
    order: item.order,
  };
}

function assertCanWrite(role: string): void {
  if (role !== "OWNER" && role !== "STAFF") {
    throw new ForbiddenError();
  }
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

function applyPricing(
  currentPrice: Prisma.Decimal,
  mode: "percentage" | "fixed",
  value: number,
): Prisma.Decimal {
  const current = Number(currentPrice);
  const adjusted =
    mode === "percentage"
      ? current * (1 + value / 100)
      : current + value;

  return new Prisma.Decimal(Math.max(0, roundPrice(adjusted)));
}

async function getMenuMembership(userId: string, menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { restaurantId: true },
  });

  if (!menu) {
    throw new NotFoundError();
  }

  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId: menu.restaurantId },
    },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  return { menu, membership };
}

async function getCategoryMembership(userId: string, categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      menuId: true,
      menu: { select: { restaurantId: true } },
    },
  });

  if (!category) {
    throw new NotFoundError();
  }

  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: category.menu.restaurantId,
      },
    },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  return { category, membership };
}

async function getRestaurantMembership(userId: string, restaurantId: string) {
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

export async function listItems(
  userId: string,
  filters: { categoryId?: string; menuId?: string },
): Promise<MenuItemDto[]> {
  const { categoryId, menuId } = filters;

  if (!categoryId && !menuId) {
    throw new ValidationError("categoryId or menuId query parameter is required");
  }

  if (categoryId && menuId) {
    throw new ValidationError("Provide only one of categoryId or menuId");
  }

  if (categoryId) {
    await getCategoryMembership(userId, categoryId);

    const items = await prisma.menuItem.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
    });

    return items.map(toMenuItemDto);
  }

  await getMenuMembership(userId, menuId!);

  const items = await prisma.menuItem.findMany({
    where: { category: { menuId: menuId! } },
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
  });

  return items.map(toMenuItemDto);
}

export async function createItem(
  userId: string,
  input: CreateItemInput,
): Promise<MenuItemDto> {
  const { membership } = await getCategoryMembership(userId, input.categoryId);
  assertCanWrite(membership.role);

  let order = input.order;
  if (order === undefined) {
    const maxOrder = await prisma.menuItem.aggregate({
      where: { categoryId: input.categoryId },
      _max: { order: true },
    });
    order = (maxOrder._max.order ?? -1) + 1;
  }

  const item = await prisma.menuItem.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? "",
      price: new Prisma.Decimal(input.price),
      isAvailable: input.isAvailable ?? true,
      isFeatured: input.isFeatured ?? false,
      allergens: input.allergens ?? [],
      order,
    },
  });

  return toMenuItemDto(item);
}

export async function updateItem(
  itemId: string,
  restaurantId: string,
  input: UpdateItemInput,
): Promise<MenuItemDto> {
  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      category: { menu: { restaurantId } },
    },
  });

  if (!item) {
    throw new NotFoundError();
  }

  if (input.categoryId !== undefined && input.categoryId !== item.categoryId) {
    const targetCategory = await prisma.category.findFirst({
      where: {
        id: input.categoryId,
        menu: { restaurantId },
      },
      select: { id: true },
    });

    if (!targetCategory) {
      throw new ValidationError("Target category must belong to the same restaurant");
    }
  }

  const updated = await prisma.menuItem.update({
    where: { id: itemId },
    data: {
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined
        ? { price: new Prisma.Decimal(input.price) }
        : {}),
      ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.allergens !== undefined ? { allergens: input.allergens } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
    },
  });

  return toMenuItemDto(updated);
}

export async function deleteItem(itemId: string): Promise<void> {
  await prisma.menuItem.delete({
    where: { id: itemId },
  });
}

export async function reorderItems(
  userId: string,
  input: ReorderItemsInput,
): Promise<MenuItemDto[]> {
  const { membership } = await getCategoryMembership(userId, input.categoryId);
  assertCanWrite(membership.role);

  const itemIds = input.items.map((entry) => entry.id);
  const items = await prisma.menuItem.findMany({
    where: {
      id: { in: itemIds },
      categoryId: input.categoryId,
    },
    select: { id: true },
  });

  if (items.length !== itemIds.length) {
    throw new ValidationError("All items must belong to the specified category");
  }

  await prisma.$transaction(
    input.items.map((entry) =>
      prisma.menuItem.update({
        where: { id: entry.id },
        data: { order: entry.order },
      }),
    ),
  );

  return listItems(userId, { categoryId: input.categoryId });
}

export async function bulkUpdatePricing(
  userId: string,
  input: BulkPricingInput,
): Promise<{ updatedCount: number }> {
  let items: MenuItem[];

  if (input.scope === "menu") {
    const { membership } = await getMenuMembership(userId, input.menuId);
    assertCanWrite(membership.role);

    items = await prisma.menuItem.findMany({
      where: { category: { menuId: input.menuId } },
    });
  } else if (input.scope === "category") {
    const { membership } = await getCategoryMembership(userId, input.categoryId);
    assertCanWrite(membership.role);

    items = await prisma.menuItem.findMany({
      where: { categoryId: input.categoryId },
    });
  } else {
    const membership = await getRestaurantMembership(userId, input.restaurantId);
    assertCanWrite(membership.role);

    items = await prisma.menuItem.findMany({
      where: { category: { menu: { restaurantId: input.restaurantId } } },
    });
  }

  if (items.length === 0) {
    return { updatedCount: 0 };
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: {
          price: applyPricing(item.price, input.mode, input.value),
        },
      }),
    ),
  );

  return { updatedCount: items.length };
}
