import { describe, expect, it } from "vitest";
import {
  MINUS,
  formatBRL,
  formatBalance,
  formatExpense,
  formatIncome,
  maskBRLInput,
  parseBRLToCents,
} from "./money";

describe("parseBRLToCents", () => {
  it("interpreta o texto pt-BR como centavos", () => {
    expect(parseBRLToCents("1.800,00")).toBe(180000);
    expect(parseBRLToCents("412,80")).toBe(41280);
    expect(parseBRLToCents("R$ 0,05")).toBe(5);
  });
  it("vazio ou só zeros vira 0", () => {
    expect(parseBRLToCents("")).toBe(0);
    expect(parseBRLToCents("0,00")).toBe(0);
    expect(parseBRLToCents("abc")).toBe(0);
  });
  it("não usa float", () => {
    expect(parseBRLToCents("999.999.999,99")).toBe(99_999_999_999);
    expect(Number.isInteger(parseBRLToCents("0,10"))).toBe(true);
  });
});

describe("formatBRL", () => {
  it("formata com separadores pt-BR", () => {
    expect(formatBRL(440655)).toBe("4.406,55");
    expect(formatBRL(0)).toBe("0,00");
    expect(formatBRL(5)).toBe("0,05");
    expect(formatBRL(99_999_999_999)).toBe("999.999.999,99");
  });
  it("usa o valor absoluto", () => {
    expect(formatBRL(-31240)).toBe("312,40");
  });
  it("rejeita valores não inteiros", () => {
    expect(() => formatBRL(10.5)).toThrow();
  });
});

describe("sinais", () => {
  it("usa + e o menos U+2212", () => {
    expect(formatIncome(180000)).toBe("+ R$ 1.800,00");
    expect(formatExpense(41280)).toBe(`${MINUS} R$ 412,80`);
    expect(formatExpense(41280).charCodeAt(0)).toBe(0x2212);
  });
  it("saldo negativo leva o menos", () => {
    expect(formatBalance(440655)).toBe("R$ 4.406,55");
    expect(formatBalance(-31240)).toBe(`${MINUS} R$ 312,40`);
    expect(formatBalance(0)).toBe("R$ 0,00");
  });
});

describe("maskBRLInput", () => {
  it("formata da direita para a esquerda", () => {
    expect(maskBRLInput("1")).toBe("0,01");
    expect(maskBRLInput("0,012")).toBe("0,12");
    expect(maskBRLInput("180000")).toBe("1.800,00");
    expect(maskBRLInput("1.800,005")).toBe("18.000,05");
  });
  it("apagar tudo deixa o campo vazio", () => {
    expect(maskBRLInput("")).toBe("");
    expect(maskBRLInput("0,0")).toBe("");
  });
});
