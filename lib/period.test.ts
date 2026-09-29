import { describe, expect, it } from "vitest";
import { makePeriod, monthParamForNav, navHref, nextMonthHref, prevMonthHref } from "./period";

describe("navHref", () => {
  it("mês atual sem parâmetros é a própria aba", () => {
    expect(navHref({ month: "2026-09", current: "2026-09" })).toBe("/");
    expect(navHref({ path: "/relatorios", month: "2026-09", current: "2026-09" })).toBe("/relatorios");
  });
  it("preserva mês, categoria e itens", () => {
    expect(
      navHref({ path: "/movimentacoes", month: "2026-08", current: "2026-09", categoria: "sem", itens: 100 }),
    ).toBe("/movimentacoes?mes=2026-08&categoria=sem&itens=100");
    expect(navHref({ month: "2026-09", current: "2026-09", categoria: "abc" })).toBe("/?categoria=abc");
  });
});

describe("stepper", () => {
  it("troca de mês sem sair da aba", () => {
    const p = makePeriod("2026-08", "2026-09", "/relatorios");
    expect(prevMonthHref(p)).toBe("/relatorios?mes=2026-07");
    expect(nextMonthHref(p)).toBe("/relatorios");
    expect(nextMonthHref(makePeriod("2026-09", "2026-09"))).toBeNull();
  });
});

describe("monthParamForNav", () => {
  it("aceita só mês válido e não futuro", () => {
    expect(monthParamForNav("2026-08", "2026-09")).toBe("2026-08");
    expect(monthParamForNav("2026-10", "2026-09")).toBe("2026-09");
    expect(monthParamForNav("2026-13", "2026-09")).toBe("2026-09");
    expect(monthParamForNav(null, "2026-09")).toBe("2026-09");
  });
});

describe("navItemHref", () => {
  it("leva o mês também para Configurações", async () => {
    const { navItemHref } = await import("@/components/finance/nav-items");
    expect(navItemHref("/configuracoes", "2026-08", "2026-09")).toBe("/configuracoes?mes=2026-08");
    expect(navItemHref("/relatorios", null, "2026-09")).toBe("/relatorios");
  });
});

describe("busca (V8)", () => {
  it("navHref leva o q junto com mês e categoria", () => {
    expect(navHref({ path: "/movimentacoes", month: "2026-08", current: "2026-09", categoria: "sem", q: "luz" })).toBe(
      "/movimentacoes?mes=2026-08&categoria=sem&q=luz",
    );
  });
  it("trocar de mês mantém o q", () => {
    const p = makePeriod("2026-08", "2026-09", "/movimentacoes", "mercado");
    expect(prevMonthHref(p)).toBe("/movimentacoes?mes=2026-07&q=mercado");
    expect(nextMonthHref(p)).toBe("/movimentacoes?q=mercado");
  });
});
