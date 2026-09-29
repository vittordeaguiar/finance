import { describe, expect, it } from "vitest";
import { formatShare, shareMillis, toCategoryTotals, topCategoryTotals, totalsWithout } from "./report";

describe("toCategoryTotals", () => {
  it("converte e põe Sem categoria por último", () => {
    const r = toCategoryTotals([
      { category_id: null, name: null, total_cents: "90000", tx_count: "3" },
      { category_id: "a", name: "Mercado", total_cents: 50000, tx_count: 2 },
    ]);
    expect(r).toEqual([
      { categoryId: "a", name: "Mercado", totalCents: 50000, count: 2 },
      { categoryId: null, name: null, totalCents: 90000, count: 3 },
    ]);
  });
});

describe("shareMillis / formatShare", () => {
  it("calcula em milésimos", () => {
    expect(shareMillis(342, 1000)).toBe(342);
    expect(formatShare(342)).toBe("34,2%");
    expect(formatShare(1000)).toBe("100,0%");
    expect(formatShare(5)).toBe("0,5%");
  });
  it("soma 100% com tolerância de 0,1 por linha", () => {
    const parts = [1, 1, 1];
    const sum = parts.reduce((a, b) => a + b, 0);
    const total = parts.map((p) => shareMillis(p, sum)).reduce((a, b) => a + b, 0);
    expect(Math.abs(total - 1000)).toBeLessThanOrEqual(parts.length);
  });
  it("soma zero vira 0", () => {
    expect(shareMillis(0, 0)).toBe(0);
  });
});

describe("topCategoryTotals", () => {
  const row = (id: string | null, total: number) => ({ categoryId: id, name: id, totalCents: total, count: 1 });
  it("pega as maiores e deixa Sem categoria por último", () => {
    const r = topCategoryTotals([row("a", 50), row("b", 40), row("c", 10), row(null, 90)], 3);
    expect(r.map((t) => t.categoryId)).toEqual(["a", "b", null]);
  });
  it("Sem categoria fora do top fica de fora", () => {
    const r = topCategoryTotals([row("a", 50), row("b", 40), row("c", 30), row(null, 5)], 3);
    expect(r.map((t) => t.categoryId)).toEqual(["a", "b", "c"]);
  });
});

describe("totalsWithout", () => {
  const totals = [
    { categoryId: "a", name: "Mercado", totalCents: 30000, count: 2 },
    { categoryId: "b", name: "Luz", totalCents: 15000, count: 1 },
    { categoryId: null, name: null, totalCents: 5000, count: 1 },
  ];
  it("desconta da categoria da movimentação", () => {
    expect(totalsWithout(totals, { type: "expense", amountCents: 10000, categoryId: "a" }, "expense")[0]).toEqual({
      categoryId: "a",
      name: "Mercado",
      totalCents: 20000,
      count: 1,
    });
  });
  it("categoria sem movimentações sai da lista, inclusive Sem categoria", () => {
    const withoutB = totalsWithout(totals, { type: "expense", amountCents: 15000, categoryId: "b" }, "expense");
    expect(withoutB.map((t) => t.categoryId)).toEqual(["a", null]);
    const withoutNone = totalsWithout(totals, { type: "expense", amountCents: 5000, categoryId: null }, "expense");
    expect(withoutNone.map((t) => t.categoryId)).toEqual(["a", "b"]);
  });
  it("outro tipo ou nada pendente não muda", () => {
    expect(totalsWithout(totals, { type: "income", amountCents: 15000, categoryId: "b" }, "expense")).toEqual(totals);
    expect(totalsWithout(totals, null, "expense")).toEqual(totals);
  });
});
