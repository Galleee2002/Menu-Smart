import { Hono } from "hono";
import { ValidationError } from "../lib/errors";
import { ok } from "../lib/response";
import {
  inviteMember,
  listMembers,
  removeMember,
  updateMemberRole,
} from "../services/member";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "../schemas/member";
import type { AppEnv } from "../types";

export const memberRoutes = new Hono<AppEnv>();

memberRoutes.get("/", async (c) => {
  const members = await listMembers(c.req.param("id")!);
  return ok(c, members);
});

memberRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = inviteMemberSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const member = await inviteMember(c.req.param("id")!, parsed.data);
  return ok(c, member, 201);
});

memberRoutes.patch("/:userId", async (c) => {
  const body = await c.req.json();
  const parsed = updateMemberRoleSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const member = await updateMemberRole(
    c.req.param("id")!,
    c.req.param("userId")!,
    parsed.data,
  );
  return ok(c, member);
});

memberRoutes.delete("/:userId", async (c) => {
  await removeMember(c.req.param("id")!, c.req.param("userId")!);
  return ok(c, { deleted: true });
});
