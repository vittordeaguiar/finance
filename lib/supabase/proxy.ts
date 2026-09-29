import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { todayInSaoPaulo } from "../dates";
import { RECURRENCES_COOKIE, RECURRENCES_MAX_AGE_SECONDS, recurrencesMarker, recurrencesUpToDate } from "../recurrence";
import { supabaseEnv } from "./env";

/** Rotas acessíveis sem sessão. Todo o resto exige login. */
const PUBLIC_PATHS = ["/login", "/cadastro", "/recuperar-senha", "/nova-senha", "/auth/"];
/** Usuário logado que abre estas rotas vai para o dashboard. */
const GUEST_ONLY_PATHS = ["/login", "/cadastro"];

function matches(pathname: string, paths: string[]): boolean {
  return paths.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p));
}

/** Renova a sessão (cookies) e aplica os redirecionamentos de autenticação. */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, key } = supabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Não inserir lógica entre a criação do cliente e getClaims(): é ele que renova o token.
  // Com chave de assinatura assimétrica o JWT é validado localmente, sem ida ao servidor de Auth.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims.sub ?? null;

  const { pathname } = request.nextUrl;

  let redirectTo: string | null = null;
  if (!user && !matches(pathname, PUBLIC_PATHS)) redirectTo = "/login";
  if (user && matches(pathname, GUEST_ONLY_PATHS)) redirectTo = "/";

  if (redirectTo) {
    const target = request.nextUrl.clone();
    target.pathname = redirectTo;
    target.search = "";
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  if (user && !matches(pathname, PUBLIC_PATHS)) await materializeRecurrences(supabase, request, response, user);
  return response;
}

/**
 * Lança as recorrências vencidas no máximo uma vez por dia por usuário, antes das leituras da página.
 * Falha não grava o cookie: a próxima requisição tenta de novo. A RPC usa `skip locked`, então uma chamada
 * concorrente pode pular séries travadas por outra: só marca o dia se nenhuma série ativa ficou vencida.
 */
async function materializeRecurrences(
  supabase: ReturnType<typeof createServerClient>,
  request: NextRequest,
  response: NextResponse,
  userId: string,
): Promise<void> {
  const today = todayInSaoPaulo();
  if (recurrencesUpToDate(request.cookies.get(RECURRENCES_COOKIE)?.value, userId, today)) return;
  const { error } = await supabase.rpc("materialize_recurrences");
  if (error) {
    console.error("Erro ao lançar recorrências", error);
    return;
  }
  const { count, error: pendingError } = await supabase
    .from("recurrences")
    .select("id", { count: "exact", head: true })
    .is("ended_at", null)
    .lte("next_due_on", today);
  if (pendingError || count !== 0) return;
  response.cookies.set(RECURRENCES_COOKIE, recurrencesMarker(userId, today), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RECURRENCES_MAX_AGE_SECONDS,
  });
}
