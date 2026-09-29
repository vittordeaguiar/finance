import { describe, expect, it } from "vitest";
import { isSidebarOpen, sidebarCookie } from "./sidebar";

describe("sidebar", () => {
  it("recolhida por padrão", () => {
    expect(isSidebarOpen(undefined)).toBe(false);
    expect(isSidebarOpen("recolhida")).toBe(false);
    expect(isSidebarOpen("aberta")).toBe(true);
  });
  it("cookie vale para o app todo", () => {
    expect(sidebarCookie(true)).toMatch(/^sidebar=aberta; path=\//);
    expect(sidebarCookie(false)).toMatch(/^sidebar=recolhida;/);
  });
});
