import { describe, expect, it } from "vitest";
import { dueDates, nextDueAfter, recurrenceDate, recurrencesMarker, recurrencesUpToDate } from "./recurrence";

describe("recurrenceDate", () => {
  it("dia 31 em abril cai no dia 30", () => {
    expect(recurrenceDate("2026-04", 31)).toBe("2026-04-30");
  });
  it("fevereiro normal e bissexto", () => {
    expect(recurrenceDate("2026-02", 31)).toBe("2026-02-28");
    expect(recurrenceDate("2028-02", 30)).toBe("2028-02-29");
  });
  it("aceita uma data e mantém dias que existem no mês", () => {
    expect(recurrenceDate("2026-03-10", 31)).toBe("2026-03-31");
    expect(recurrenceDate("2026-09", 5)).toBe("2026-09-05");
  });
});

describe("nextDueAfter", () => {
  it("vira o ano", () => {
    expect(nextDueAfter("2026-12-15", 15)).toBe("2027-01-15");
  });
  it("dia 31 volta ao 31 depois de fevereiro", () => {
    expect(nextDueAfter("2026-01-31", 31)).toBe("2026-02-28");
    expect(nextDueAfter("2026-02-28", 31)).toBe("2026-03-31");
    expect(nextDueAfter("2026-03-31", 31)).toBe("2026-04-30");
  });
});

describe("dueDates", () => {
  it("série criada em 31/01 lança 28/02 (29/02 em bissexto), 31/03 e 30/04", () => {
    expect(dueDates("2026-01-31", 31, "2026-04-30")).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
    expect(dueDates("2028-01-31", 31, "2028-03-01")).toEqual(["2028-01-31", "2028-02-29"]);
  });
  it("data inicial no passado gera os meses entre ela e hoje", () => {
    expect(dueDates("2026-06-25", 25, "2026-09-25")).toEqual(["2026-06-25", "2026-07-25", "2026-08-25", "2026-09-25"]);
    expect(dueDates("2026-06-25", 25, "2026-09-24")).toEqual(["2026-06-25", "2026-07-25", "2026-08-25"]);
  });
  it("série já em dia não gera nada", () => {
    expect(dueDates("2026-10-25", 25, "2026-09-25")).toEqual([]);
  });
});

describe("recurrencesUpToDate", () => {
  const user = "11111111-1111-1111-1111-111111111111";
  it("vale só para o mesmo usuário e o mesmo dia", () => {
    const marker = recurrencesMarker(user, "2026-09-25");
    expect(recurrencesUpToDate(marker, user, "2026-09-25")).toBe(true);
    expect(recurrencesUpToDate(marker, user, "2026-09-26")).toBe(false);
    expect(recurrencesUpToDate(marker, "22222222-2222-2222-2222-222222222222", "2026-09-25")).toBe(false);
    expect(recurrencesUpToDate(undefined, user, "2026-09-25")).toBe(false);
  });
});
