import { describe, expect, it } from "vitest";
import { parseTheme, themeAttribute } from "./theme";

describe("tema", () => {
  it("sistema é o padrão", () => {
    expect(parseTheme(undefined)).toBe("sistema");
    expect(parseTheme("roxo")).toBe("sistema");
    expect(parseTheme("escuro")).toBe("escuro");
  });
  it("data-theme só para claro e escuro", () => {
    expect(themeAttribute("claro")).toBe("light");
    expect(themeAttribute("escuro")).toBe("dark");
    expect(themeAttribute("sistema")).toBeUndefined();
  });
});
