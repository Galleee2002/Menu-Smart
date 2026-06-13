import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.email(),
});

export const updateMemberRoleSchema = z.object({
  role: z.literal("STAFF"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
