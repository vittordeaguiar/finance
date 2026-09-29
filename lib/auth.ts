/**
 * Marca uma sessão aberta por link de recuperação. Só com ela a tela /nova-senha mostra o
 * formulário: uma sessão comum (usuário logado) não pode trocar a senha sem ter recebido o link.
 */
export const RECOVERY_COOKIE = "saldo_recovery";
export const RECOVERY_MAX_AGE_SECONDS = 60 * 60;
