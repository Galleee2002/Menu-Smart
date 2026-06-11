import { describe, expect, it } from "vitest";
import { slugify } from "../slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("La Casa del Sabor")).toBe("la-casa-del-sabor");
  });

  it("removes accents", () => {
    expect(slugify("Café Niño")).toBe("cafe-nino");
  });

  it("strips special characters", () => {
    expect(slugify("Hello!!! World???")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("---test---")).toBe("test");
  });

  it("returns restaurant for empty result", () => {
    expect(slugify("!!!")).toBe("");
  });
});
