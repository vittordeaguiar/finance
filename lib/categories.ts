import "server-only";
import type { TransactionType } from "./money";
import type { createClient } from "./supabase/server";
import type { CategoryChoice } from "./validation";

export const UNIQUE_VIOLATION = "23505";

export type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Converte a escolha do formulário em `category_id`. Categoria nova: insere com o tipo da movimentação;
 * se o nome já existir (índice único, ignora caixa e espaços), reusa a existente. `undefined` = falha.
 * Id de outro usuário ou de outro tipo passa daqui e é recusado pela FK composta no insert/update.
 */
export async function resolveCategoryId(
  supabase: Supabase,
  type: TransactionType,
  choice: CategoryChoice,
): Promise<string | null | undefined> {
  if (choice.kind === "none") return null;
  if (choice.kind === "existing") return choice.id;

  const { data, error } = await supabase
    .from("categories")
    .insert({ type, name: choice.name })
    .select("id")
    .single<{ id: string }>();
  if (data) return data.id;
  if (error?.code !== UNIQUE_VIOLATION) {
    console.error("Erro ao criar categoria", error);
    return undefined;
  }

  const { data: rows, error: findError } = await supabase
    .from("categories")
    .select("id,name")
    .eq("type", type)
    .returns<{ id: string; name: string }[]>();
  const key = choice.name.toLowerCase();
  const existing = rows?.find((row) => row.name.trim().toLowerCase() === key);
  if (!existing) console.error("Erro ao buscar categoria existente", findError);
  return existing?.id;
}
