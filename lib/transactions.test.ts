import { describe, expect, it } from "vitest";
import { EMPTY_SUMMARY, sortRecurrences, balanceAfterDelete, balanceAfterEdit, escapeLike, monthTotals, summaryWithout, toSummary, toTransaction } from "./transactions";

describe("toSummary", () => {
  it("sem linha na view vira tudo zero", () => {
    expect(toSummary(null)).toEqual(EMPTY_SUMMARY);
  });
  it("converte para número", () => {
    expect(
      toSummary({ income_cents: 665000, expense_cents: 224345, balance_cents: 440655, income_count: 3, expense_count: 5 }),
    ).toEqual({ incomeCents: 665000, expenseCents: 224345, balanceCents: 440655, incomeCount: 3, expenseCount: 5 });
  });
});

describe("toTransaction", () => {
  it("mapeia colunas snake_case", () => {
    expect(
      toTransaction({
        id: "a",
        type: "expense",
        description: "Supermercado",
        amount_cents: 41280,
        occurred_at: "2026-09-22",
        created_at: "2026-09-22T12:00:00Z",
        category_id: null,
        recurrence_id: null,
        category: null,
      }),
    ).toMatchObject({ amountCents: 41280, occurredAt: "2026-09-22", categoryId: null, categoryName: null, recurrenceId: null });
  });
  it("traz id e nome da categoria", () => {
    expect(
      toTransaction({
        id: "a",
        type: "expense",
        description: "Supermercado",
        amount_cents: 41280,
        occurred_at: "2026-09-22",
        created_at: "2026-09-22T12:00:00Z",
        category_id: "c1",
        recurrence_id: "r1",
        category: { name: "Mercado" },
      }),
    ).toMatchObject({ categoryId: "c1", categoryName: "Mercado", recurrenceId: "r1" });
  });
});

describe("balanceAfterDelete", () => {
  it("excluir despesa aumenta o saldo; excluir receita diminui", () => {
    expect(balanceAfterDelete(440655, { type: "expense", amountCents: 41280 })).toBe(481935);
    expect(balanceAfterDelete(440655, { type: "income", amountCents: 180000 })).toBe(260655);
  });
});

describe("balanceAfterEdit", () => {
  it("aplica a diferença de valor", () => {
    expect(balanceAfterEdit(583975, { type: "expense", amountCents: 41280 }, { type: "expense", amountCents: 43280 })).toBe(581975);
  });
  it("inverte o sinal quando o tipo muda", () => {
    expect(balanceAfterEdit(10000, { type: "expense", amountCents: 2000 }, { type: "income", amountCents: 2000 })).toBe(14000);
  });
  it("sem mudança de valor ou tipo, mantém o saldo", () => {
    expect(balanceAfterEdit(-500, { type: "income", amountCents: 100 }, { type: "income", amountCents: 100 })).toBe(-500);
  });
});

describe("monthTotals", () => {
  it("soma e conta por tipo", () => {
    expect(
      monthTotals([
        { type: "income", amount_cents: 420000 },
        { type: "expense", amount_cents: 41280 },
        { type: "expense", amount_cents: 7430 },
      ]),
    ).toEqual({ incomeCents: 420000, expenseCents: 48710, incomeCount: 1, expenseCount: 2 });
  });
  it("sem linhas, tudo zero", () => {
    expect(monthTotals([])).toEqual({ incomeCents: 0, expenseCents: 0, incomeCount: 0, expenseCount: 0 });
  });
});

describe("sortRecurrences", () => {
  const r = (id: string, type: "income" | "expense", day: number) => ({
    id,
    type,
    description: id,
    amountCents: 100,
    categoryId: null,
    categoryName: null,
    dayOfMonth: day,
    nextDueOn: "2026-10-01",
  });
  it("despesas primeiro, depois receitas, cada grupo pelo dia", () => {
    const sorted = sortRecurrences([r("a", "income", 5), r("b", "expense", 20), r("c", "expense", 3), r("d", "income", 1)]);
    expect(sorted.map((x) => x.id)).toEqual(["c", "b", "d", "a"]);
  });
});

describe("summaryWithout", () => {
  const summary = { incomeCents: 500000, expenseCents: 120000, balanceCents: 380000, incomeCount: 2, expenseCount: 3 };
  it("despesa pendente volta ao saldo e sai das despesas do mês", () => {
    expect(summaryWithout(summary, { type: "expense", amountCents: 20000 })).toEqual({
      ...summary,
      expenseCents: 100000,
      expenseCount: 2,
      balanceCents: 400000,
    });
  });
  it("receita pendente sai do saldo e das receitas do mês", () => {
    expect(summaryWithout(summary, { type: "income", amountCents: 100000 })).toEqual({
      ...summary,
      incomeCents: 400000,
      incomeCount: 1,
      balanceCents: 280000,
    });
  });
});

describe("escapeLike", () => {
  it("escapa os curingas do LIKE e a barra", () => {
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("c:\\x")).toBe("c:\\\\x");
  });
  it("remove o * (curinga do PostgREST)", () => {
    expect(escapeLike("*")).toBe("");
    expect(escapeLike("mer*cado")).toBe("mercado");
  });
  it("texto comum não muda", () => {
    expect(escapeLike("Supermercado")).toBe("Supermercado");
  });
});
