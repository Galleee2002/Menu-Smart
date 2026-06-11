import type { RestaurantRole, User, UserRestaurant } from "../../generated/prisma/client";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  InviteMemberInput,
  UpdateMemberRoleInput,
} from "../schemas/member";

export type MemberDto = {
  userId: string;
  name: string;
  email: string;
  role: RestaurantRole;
  createdAt: string;
  updatedAt: string;
};

function toMemberDto(
  membership: UserRestaurant & { user: User },
): MemberDto {
  return {
    userId: membership.userId,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role,
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.updatedAt.toISOString(),
  };
}

export async function listMembers(restaurantId: string): Promise<MemberDto[]> {
  const memberships = await prisma.userRestaurant.findMany({
    where: { restaurantId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map(toMemberDto);
}

export async function inviteMember(
  restaurantId: string,
  input: InviteMemberInput,
): Promise<MemberDto> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const existingMembership = await prisma.userRestaurant.findFirst({
    where: { userId: user.id },
  });

  if (existingMembership) {
    if (existingMembership.restaurantId === restaurantId) {
      throw new ConflictError("User is already a member of this restaurant");
    }
    throw new ConflictError("User already belongs to a restaurant");
  }

  const membership = await prisma.userRestaurant.create({
    data: {
      userId: user.id,
      restaurantId,
      role: "STAFF",
    },
    include: { user: true },
  });

  return toMemberDto(membership);
}

export async function updateMemberRole(
  restaurantId: string,
  userId: string,
  input: UpdateMemberRoleInput,
): Promise<MemberDto> {
  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
    include: { user: true },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  if (membership.role === "OWNER") {
    throw new ValidationError("Cannot change role of restaurant owner");
  }

  if (input.role !== "STAFF") {
    throw new ValidationError("Only STAFF role is allowed in MVP");
  }

  const updated = await prisma.userRestaurant.update({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
    data: { role: input.role },
    include: { user: true },
  });

  return toMemberDto(updated);
}

export async function removeMember(
  restaurantId: string,
  userId: string,
): Promise<void> {
  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  if (membership.role === "OWNER") {
    throw new ValidationError("Cannot remove restaurant owner");
  }

  await prisma.userRestaurant.delete({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
  });
}
