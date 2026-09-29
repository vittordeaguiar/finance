import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/lib/copy";

/** Detalhe e edição de uma ocorrência: de onde ela vem e onde gerenciar a série. */
export function RecurrenceNote() {
  return (
    <p className="text-[13px] leading-normal text-text-secondary">
      {copy.recurrence.fromSeries}{" "}
      <TextLink href="/configuracoes#config-recorrencias">{copy.recurrence.manage}</TextLink>
    </p>
  );
}
