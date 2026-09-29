import { describe, expect, it } from "vitest";
import { copy } from "./copy";
import {
  NEW_CATEGORY_VALUE,
  oldestRecurrenceStart,
  parseSearch,
  repeatSchema,
  validateEmail,
  validateNewPassword,
  validateRecurrenceEdit,
  validateRecurrenceStart,
  validateSignup,
  validateTransaction,
} from "./validation";

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

describe("validateSignup", () => {
  it("aceita dados válidos e normaliza o email", () => {
    const r = validateSignup(form({ name: " Vittor ", email: " Voce@Email.com ", password: "12345678", confirm: "12345678" }));
    expect(r).toEqual({ ok: true, data: { name: "Vittor", email: "voce@email.com", password: "12345678" } });
  });

  it("reporta cada campo com a mensagem do copy", () => {
    const r = validateSignup(form({ name: "", email: "x", password: "123456", confirm: "1234567" }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.fieldErrors).toEqual({
      name: "Informe seu nome.",
      email: "Informe um email válido.",
      password: "A senha tem 6 caracteres. Use pelo menos 8.",
      confirm: "As senhas não coincidem.",
    });
  });
});

describe("validateNewPassword", () => {
  it("exige 8 caracteres e confirmação igual", () => {
    expect(validateNewPassword(form({ password: "abcdefgh", confirm: "abcdefgh" }))).toEqual({ ok: true, password: "abcdefgh" });
    const r = validateNewPassword(form({ password: "abc", confirm: "abd" }));
    expect(r.ok).toBe(false);
  });
});

describe("validateEmail", () => {
  it("rejeita vazio e formato inválido", () => {
    expect(validateEmail("")).toEqual({ error: "Informe um email válido." });
    expect(validateEmail("sem-arroba")).toHaveProperty("error");
    expect(validateEmail(null)).toHaveProperty("error");
    expect(validateEmail("a@b.co")).toEqual({ email: "a@b.co" });
  });
});

describe("validateTransaction", () => {
  const today = "2026-09-24";
  it("aceita e converte o valor para centavos", () => {
    const r = validateTransaction(form({ description: "  Supermercado ", amount: "412,80", occurredAt: "2026-09-22" }), today);
    expect(r).toEqual({ ok: true, data: { description: "Supermercado", amountCents: 41280, occurredAt: "2026-09-22", category: { kind: "none" } } });
  });
  it("mensagens do print 12 e data futura", () => {
    const r = validateTransaction(form({ description: "   ", amount: "0,00", occurredAt: "2026-09-25" }), today);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.fieldErrors).toEqual({
      description: "Informe uma descrição.",
      amount: "O valor precisa ser maior que zero.",
      occurredAt: "A data não pode ser no futuro.",
    });
  });
  it("hoje é permitido; limites de tamanho e valor", () => {
    expect(validateTransaction(form({ description: "x", amount: "1", occurredAt: today }), today).ok).toBe(true);
    const r = validateTransaction(form({ description: "a".repeat(81), amount: "1.000.000.000,00", occurredAt: "" }), today);
    if (r.ok) throw new Error("devia falhar");
    expect(r.fieldErrors.description).toBe("Use no máximo 80 caracteres.");
    expect(r.fieldErrors.amount).toBe("O valor máximo é R$ 999.999.999,99.");
    expect(r.fieldErrors.occurredAt).toBe("Informe uma data válida.");
  });
  it("data impossível", () => {
    const r = validateTransaction(form({ description: "x", amount: "1", occurredAt: "2026-02-30" }), today);
    expect(r.ok).toBe(false);
  });
});

describe("validateTransaction · categoria", () => {
  const today = "2026-09-25";
  const base = { description: "Ração", amount: "10,00", occurredAt: "2026-09-22" };
  const id = "3f8e2b1c-4d5a-4b6c-8d7e-9f0a1b2c3d4e";

  it("existente vira id", () => {
    const r = validateTransaction(form({ ...base, categoryId: id }), today);
    expect(r.ok && r.data.category).toEqual({ kind: "existing", id });
  });
  it("nova tem prioridade e vem sem espaços", () => {
    const r = validateTransaction(form({ ...base, categoryId: NEW_CATEGORY_VALUE, newCategory: "  Pets " }), today);
    expect(r.ok && r.data.category).toEqual({ kind: "new", name: "Pets" });
  });
  it("nova vazia é erro no campo newCategory", () => {
    const r = validateTransaction(form({ ...base, categoryId: NEW_CATEGORY_VALUE, newCategory: "   " }), today);
    expect(!r.ok && r.fieldErrors.newCategory).toBe("Informe o nome da categoria.");
  });
  it("nova com mais de 30 caracteres é erro", () => {
    const r = validateTransaction(form({ ...base, categoryId: NEW_CATEGORY_VALUE, newCategory: "a".repeat(31) }), today);
    expect(!r.ok && r.fieldErrors.newCategory).toBe("Use no máximo 30 caracteres.");
  });
  it("id inválido é recusado", () => {
    expect(validateTransaction(form({ ...base, categoryId: "x" }), today).ok).toBe(false);
  });
});

describe("configurações", () => {
  it("nome de categoria", async () => {
    const { validateCategoryName } = await import("./validation");
    expect(validateCategoryName("  Pets ")).toEqual({ ok: true, name: "Pets" });
    expect(validateCategoryName("  ")).toEqual({ ok: false, error: "Informe o nome da categoria." });
    expect(validateCategoryName("a".repeat(31))).toEqual({ ok: false, error: "Use no máximo 30 caracteres." });
    expect(validateCategoryName(null).ok).toBe(false);
  });
  it("nome do perfil", async () => {
    const { validateProfileName } = await import("./validation");
    expect(validateProfileName(" Vittor ")).toEqual({ ok: true, name: "Vittor" });
    expect(validateProfileName("").ok).toBe(false);
    expect(validateProfileName("a".repeat(81)).ok).toBe(false);
  });
});

describe("recorrência", () => {
  const base = { description: "Aluguel", amount: "1.500,00", categoryId: "" };

  it("data inicial mais antiga: 12 meses antes, limitada ao fim do mês", () => {
    expect(oldestRecurrenceStart("2026-09-25")).toBe("2025-09-25");
    expect(oldestRecurrenceStart("2028-02-29")).toBe("2027-02-28");
  });

  it("aceita até 12 meses atrás e recusa antes disso", () => {
    expect(validateRecurrenceStart(form({ ...base, occurredAt: "2025-09-25" }), "2026-09-25").ok).toBe(true);
    const old = validateRecurrenceStart(form({ ...base, occurredAt: "2025-09-24" }), "2026-09-25");
    expect(old).toEqual({ ok: false, fieldErrors: { occurredAt: copy.recurrence.errorDateOld } });
  });

  it("continua recusando data no futuro e somando aos outros erros", () => {
    const future = validateRecurrenceStart(form({ ...base, occurredAt: "2026-09-26" }), "2026-09-25");
    expect(future).toEqual({ ok: false, fieldErrors: { occurredAt: copy.tx.errorDateFuture } });
    const both = validateRecurrenceStart(form({ ...base, description: "", occurredAt: "2020-01-01" }), "2026-09-25");
    expect(both).toEqual({
      ok: false,
      fieldErrors: { description: copy.tx.errorDescription, occurredAt: copy.recurrence.errorDateOld },
    });
  });

  it("repeat: só \"on\" marca", () => {
    expect(repeatSchema.parse("on")).toBe(true);
    expect(repeatSchema.parse(null)).toBe(false);
    expect(repeatSchema.parse("off")).toBe(false);
  });

  it("edição da série: descrição, valor e categoria", () => {
    expect(validateRecurrenceEdit(form(base))).toEqual({
      ok: true,
      data: { description: "Aluguel", amountCents: 150000, category: { kind: "none" } },
    });
    expect(validateRecurrenceEdit(form({ ...base, amount: "0,00" }))).toEqual({
      ok: false,
      fieldErrors: { amount: copy.tx.errorAmount },
    });
    expect(validateRecurrenceEdit(form({ ...base, categoryId: NEW_CATEGORY_VALUE, newCategory: " " }))).toEqual({
      ok: false,
      fieldErrors: { newCategory: copy.category.errorNewRequired },
    });
  });
});

describe("parseSearch", () => {
  it("apara e aceita até 80 caracteres", () => {
    expect(parseSearch("  mercado ")).toBe("mercado");
    expect(parseSearch(["luz", "agua"])).toBe("luz");
  });
  it("vazio, ausente ou longo demais vira sem busca", () => {
    expect(parseSearch(undefined)).toBeNull();
    expect(parseSearch("   ")).toBeNull();
    expect(parseSearch("a".repeat(81))).toBeNull();
  });
});
