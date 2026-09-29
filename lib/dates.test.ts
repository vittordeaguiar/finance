import { describe, expect, it } from "vitest";
import {
  formatDateDesktop,
  formatDateLong,
  formatDateMobile,
  isValidIsoDate,
  monthLabel,
  monthOf,
  monthRange,
  parseMonthParam,
  shiftMonth,
  todayInSaoPaulo,
} from "./dates";

describe("todayInSaoPaulo", () => {
  it("usa o fuso de São Paulo, não UTC", () => {
    // 02:30 UTC de 23/09 ainda é 22/09 em São Paulo (UTC−3)
    expect(todayInSaoPaulo(new Date("2026-09-23T02:30:00Z"))).toBe("2026-09-22");
    expect(todayInSaoPaulo(new Date("2026-09-23T03:30:00Z"))).toBe("2026-09-23");
  });
});

describe("formatação", () => {
  it("desktop: dia com 2 dígitos, mês minúsculo sem ponto", () => {
    expect(formatDateDesktop("2026-09-22")).toBe("22 set 2026");
    expect(formatDateDesktop("2026-03-05")).toBe("05 mar 2026");
  });
  it("mobile e detalhe em caixa alta", () => {
    expect(formatDateMobile("2026-09-22")).toBe("22 SET");
    expect(formatDateLong("2026-12-01")).toBe("01 DEZ 2026");
  });
  it("não desloca o dia por fuso", () => {
    expect(formatDateDesktop("2026-01-01")).toBe("01 jan 2026");
  });
});

describe("isValidIsoDate", () => {
  it("aceita datas reais", () => {
    expect(isValidIsoDate("2026-02-28")).toBe(true);
    expect(isValidIsoDate("2028-02-29")).toBe(true);
  });
  it("rejeita formatos e dias inválidos", () => {
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("22/09/2026")).toBe(false);
    expect(isValidIsoDate("")).toBe(false);
  });
});

describe("mês", () => {
  it("parseMonthParam aceita AAAA-MM até o mês atual", () => {
    expect(parseMonthParam("2026-08", "2026-09")).toBe("2026-08");
    expect(parseMonthParam("2026-09", "2026-09")).toBe("2026-09");
    expect(parseMonthParam(["2025-12", "x"], "2026-09")).toBe("2025-12");
  });
  it("parseMonthParam recusa futuro, formato e mês inválidos", () => {
    expect(parseMonthParam("2026-10", "2026-09")).toBeNull();
    expect(parseMonthParam("2026-13", "2026-09")).toBeNull();
    expect(parseMonthParam("2026-00", "2026-09")).toBeNull();
    expect(parseMonthParam("2026-8", "2026-09")).toBeNull();
    expect(parseMonthParam(undefined, "2026-09")).toBeNull();
  });
  it("shiftMonth atravessa o ano", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2025-12", 1)).toBe("2026-01");
  });
  it("monthRange é semiaberto", () => {
    expect(monthRange("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  });
  it("monthLabel e monthOf", () => {
    expect(monthLabel("2026-03")).toEqual({ name: "março", short: "MAR", year: "2026" });
    expect(monthOf("2026-09-22")).toBe("2026-09");
  });
});
