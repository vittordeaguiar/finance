import { z } from "zod";
import { copy } from "./copy";
import { isValidIsoDate, recurrenceDate, shiftMonth, todayInSaoPaulo } from "./dates";
import { MAX_AMOUNT_CENTS, parseBRLToCents } from "./money";

export const MIN_PASSWORD_LENGTH = 8;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email(copy.signup.errorEmailInvalid));

export function validateEmail(raw: FormDataEntryValue | null): { email: string } | { error: string } {
  const result = emailSchema.safeParse(typeof raw === "string" ? raw : "");
  return result.success ? { email: result.data } : { error: copy.signup.errorEmailInvalid };
}

function passwordErrors(password: string, confirm: string): FieldErrors<"password" | "confirm"> {
  const errors: FieldErrors<"password" | "confirm"> = {};
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = copy.signup.errorPasswordShort(password.length);
  if (confirm !== password) errors.confirm = copy.signup.errorMismatch;
  return errors;
}

export type SignupField = "name" | "email" | "password" | "confirm";
export type SignupInput = { name: string; email: string; password: string };

export function validateSignup(
  form: FormData,
): { ok: true; data: SignupInput } | { ok: false; fieldErrors: FieldErrors<SignupField> } {
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const email = validateEmail(form.get("email"));

  const fieldErrors: FieldErrors<SignupField> = { ...passwordErrors(password, confirm) };
  if (name.length === 0) fieldErrors.name = copy.signup.errorNameRequired;
  else if (name.length > 80) fieldErrors.name = copy.tx.errorDescriptionLong;
  if ("error" in email) fieldErrors.email = email.error;

  if (Object.keys(fieldErrors).length > 0 || "error" in email) return { ok: false, fieldErrors };
  return { ok: true, data: { name, email: email.email, password } };
}

export function validateNewPassword(
  form: FormData,
): { ok: true; password: string } | { ok: false; fieldErrors: FieldErrors<"password" | "confirm"> } {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const fieldErrors = passwordErrors(password, confirm);
  return Object.keys(fieldErrors).length > 0 ? { ok: false, fieldErrors } : { ok: true, password };
}

// ---------- Movimentação ----------

export type TransactionField = "description" | "amount" | "occurredAt" | "newCategory";

/** Categoria escolhida: nenhuma, uma existente (id) ou uma nova (nome, já sem espaços nas pontas). */
export type CategoryChoice = { kind: "none" } | { kind: "existing"; id: string } | { kind: "new"; name: string };

export type TransactionInput = {
  description: string;
  amountCents: number;
  occurredAt: string;
  category: CategoryChoice;
};

/** Valor do `<select>` que abre o campo de nome da categoria nova. */
export const NEW_CATEGORY_VALUE = "__nova__";

const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, copy.tx.errorDescription)
    .max(80, copy.tx.errorDescriptionLong),
  amountCents: z
    .number()
    .int()
    .positive(copy.tx.errorAmount)
    .max(MAX_AMOUNT_CENTS, copy.tx.errorAmountMax),
  occurredAt: z.iso.date(copy.tx.errorDateInvalid),
  categoryId: z.union([z.literal(""), z.literal(NEW_CATEGORY_VALUE), z.uuid()]),
  newCategory: z.string().trim().max(30, copy.category.errorNewLong),
});

/** Valida o formulário do modal. `today` = hoje em São Paulo (injetável para testes). */
export function validateTransaction(
  form: FormData,
  today: string = todayInSaoPaulo(),
): { ok: true; data: TransactionInput } | { ok: false; fieldErrors: FieldErrors<TransactionField> } {
  const result = transactionSchema.safeParse({
    description: String(form.get("description") ?? ""),
    amountCents: parseBRLToCents(String(form.get("amount") ?? "")),
    occurredAt: String(form.get("occurredAt") ?? ""),
    categoryId: String(form.get("categoryId") ?? ""),
    newCategory: String(form.get("newCategory") ?? ""),
  });

  const fieldErrors: FieldErrors<TransactionField> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      const field: TransactionField | null =
        key === "description" ? "description" : key === "amountCents" ? "amount" : key === "occurredAt" ? "occurredAt" : key === "newCategory" ? "newCategory" : null;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
  }
  const occurredAt = String(form.get("occurredAt") ?? "");
  if (!fieldErrors.occurredAt && isValidIsoDate(occurredAt) && occurredAt > today) {
    fieldErrors.occurredAt = copy.tx.errorDateFuture;
  }
  if (!fieldErrors.occurredAt && !isValidIsoDate(occurredAt)) fieldErrors.occurredAt = copy.tx.errorDateInvalid;

  // "+ Nova categoria…" escolhida com o nome vazio.
  const wantsNew = form.get("categoryId") === NEW_CATEGORY_VALUE;
  const newName = String(form.get("newCategory") ?? "").trim();
  if (wantsNew && !fieldErrors.newCategory && newName.length === 0) fieldErrors.newCategory = copy.category.errorNewRequired;

  if (Object.keys(fieldErrors).length > 0 || !result.success) return { ok: false, fieldErrors };
  const { categoryId, newCategory, ...rest } = result.data;
  // Nome novo preenchido tem prioridade sobre o id.
  const category: CategoryChoice =
    newCategory.length > 0
      ? { kind: "new", name: newCategory }
      : categoryId === "" || categoryId === NEW_CATEGORY_VALUE
        ? { kind: "none" }
        : { kind: "existing", id: categoryId };
  return { ok: true, data: { ...rest, category } };
}

// ---------- Recorrência (V6) ----------

/** Data inicial mais antiga aceita: 12 meses antes de hoje (mesmo cálculo de `create_recurrence`). */
export function oldestRecurrenceStart(today: string): string {
  return recurrenceDate(shiftMonth(today.slice(0, 7), -12), Number(today.slice(8, 10)));
}

/** Movimentação com "Repetir todo mês": mesmas regras + data inicial de até 12 meses atrás. */
export function validateRecurrenceStart(
  form: FormData,
  today: string = todayInSaoPaulo(),
): ReturnType<typeof validateTransaction> {
  const result = validateTransaction(form, today);
  const occurredAt = String(form.get("occurredAt") ?? "");
  const tooOld = isValidIsoDate(occurredAt) && occurredAt < oldestRecurrenceStart(today);
  if (result.ok) return tooOld ? { ok: false, fieldErrors: { occurredAt: copy.recurrence.errorDateOld } } : result;
  if (tooOld && !result.fieldErrors.occurredAt) result.fieldErrors.occurredAt = copy.recurrence.errorDateOld;
  return result;
}

/** "Repetir todo mês" marcado (checkbox envia "on"). */
export const repeatSchema = z.preprocess((value) => value === "on", z.boolean());

export type RecurrenceField = "description" | "amount" | "newCategory";
export type RecurrenceInput = { description: string; amountCents: number; category: CategoryChoice };

const recurrenceEditSchema = transactionSchema.omit({ occurredAt: true });

/** Edição da série: descrição, valor e categoria (tipo e dia não mudam). */
export function validateRecurrenceEdit(
  form: FormData,
): { ok: true; data: RecurrenceInput } | { ok: false; fieldErrors: FieldErrors<RecurrenceField> } {
  const result = recurrenceEditSchema.safeParse({
    description: String(form.get("description") ?? ""),
    amountCents: parseBRLToCents(String(form.get("amount") ?? "")),
    categoryId: String(form.get("categoryId") ?? ""),
    newCategory: String(form.get("newCategory") ?? ""),
  });
  const fieldErrors: FieldErrors<RecurrenceField> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      const field: RecurrenceField | null =
        key === "description" ? "description" : key === "amountCents" ? "amount" : key === "newCategory" ? "newCategory" : null;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
  }
  const wantsNew = form.get("categoryId") === NEW_CATEGORY_VALUE;
  if (wantsNew && !fieldErrors.newCategory && String(form.get("newCategory") ?? "").trim().length === 0) {
    fieldErrors.newCategory = copy.category.errorNewRequired;
  }
  if (Object.keys(fieldErrors).length > 0 || !result.success) return { ok: false, fieldErrors };
  const { categoryId, newCategory, ...rest } = result.data;
  const category: CategoryChoice =
    newCategory.length > 0
      ? { kind: "new", name: newCategory }
      : categoryId === "" || categoryId === NEW_CATEGORY_VALUE
        ? { kind: "none" }
        : { kind: "existing", id: categoryId };
  return { ok: true, data: { ...rest, category } };
}

// ---------- Configurações ----------

const categoryNameSchema = z.string().trim().min(1, copy.category.errorNewRequired).max(30, copy.category.errorNewLong);

/** Nome de categoria (criar ou renomear): 1 a 30 caracteres depois do `trim`. */
export function validateCategoryName(
  raw: FormDataEntryValue | null,
): { ok: true; name: string } | { ok: false; error: string } {
  const result = categoryNameSchema.safeParse(typeof raw === "string" ? raw : "");
  return result.success ? { ok: true, name: result.data } : { ok: false, error: result.error.issues[0].message };
}

const profileNameSchema = z.string().trim().min(1, copy.signup.errorNameRequired).max(80, copy.tx.errorDescriptionLong);

/** Nome do perfil: mesmas regras do cadastro. */
export function validateProfileName(
  raw: FormDataEntryValue | null,
): { ok: true; name: string } | { ok: false; error: string } {
  const result = profileNameSchema.safeParse(typeof raw === "string" ? raw : "");
  return result.success ? { ok: true, name: result.data } : { ok: false, error: result.error.issues[0].message };
}

/** V8: busca por descrição (`?q=`). Mesmo limite da descrição; vazio ou inválido = sem busca. */
const searchSchema = z.string().trim().min(1).max(80);

export function parseSearch(raw: string | string[] | undefined): string | null {
  const parsed = searchSchema.safeParse(Array.isArray(raw) ? raw[0] : raw);
  return parsed.success ? parsed.data : null;
}
