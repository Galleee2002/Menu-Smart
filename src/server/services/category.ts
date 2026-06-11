import type { Category } from "../../generated/prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "../schemas/category";

export type CategoryDto = {
  id: string;
  menuId: string;
  name: string;
  order: number;
};

export function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    menuId: category.menuId,
    name: category.name,
    order: category.order,
  };
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

function assertCanWrite(role: string): void {
  if (role !== "OWNER" && role !== "STAFF") {
    throw new ForbiddenError();
  }
}

export async function listCategories(
  userId: string,
  menuId: string,
): Promise<CategoryDto[]> {
  await getMenuMembership(userId, menuId);

  const categories = await prisma.category.findMany({
    where: { menuId },
    orderBy: { order: "asc" },
  });

  return categories.map(toCategoryDto);
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<CategoryDto> {
  const { membership } = await getMenuMembership(userId, input.menuId);
  assertCanWrite(membership.role);

  let order = input.order;
  if (order === undefined) {
    const maxOrder = await prisma.category.aggregate({
      where: { menuId: input.menuId },
      _max: { order: true },
    });
    order = (maxOrder._max.order ?? -1) + 1;
  }

  const category = await prisma.category.create({
    data: {
      menuId: input.menuId,
      name: input.name,
      order,
    },
  });

  return toCategoryDto(category);
}

export async function updateCategory(
  categoryId: string,
  restaurantId: string,
  input: UpdateCategoryInput,
): Promise<CategoryDto> {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      menu: { restaurantId },
    },
  });

  if (!category) {
    throw new NotFoundError();
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
    },
  });

  return toCategoryDto(updated);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await prisma.category.delete({
    where: { id: categoryId },
  });
}

export async function reorderCategories(
  userId: string,
  input: ReorderCategoriesInput,
): Promise<CategoryDto[]> {
  const { membership } = await getMenuMembership(userId, input.menuId);
  assertCanWrite(membership.role);

  const categoryIds = input.items.map((item) => item.id);
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
      menuId: input.menuId,
    },
    select: { id: true },
  });

  if (categories.length !== categoryIds.length) {
    throw new ValidationError("All categories must belong to the specified menu");
  }

  await prisma.$transaction(
    input.items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );

  return listCategories(userId, input.menuId);
}
