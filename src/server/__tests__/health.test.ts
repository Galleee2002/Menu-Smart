import { describe, expect, it } from "vitest";
import { app } from "../index";

describe("GET /api/health", () => {
  it("returns 200 with success envelope", async () => {
    const res = await app.request("/api/health");

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: { status: "ok" },
    });
  });
});
