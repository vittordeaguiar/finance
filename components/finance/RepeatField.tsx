"use client";

import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";

type RepeatFieldProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Dia do mês da data escolhida (texto de ajuda). `null` = data inválida. */
  day: number | null;
  disabled?: boolean;
};

/** "Repetir todo mês" (só na criação). Marcada, mostra em que dia a série é lançada. */
export function RepeatField({ id, checked, onChange, day, disabled }: RepeatFieldProps) {
  const showHelp = checked && day !== null;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-11 cursor-pointer items-center gap-3 self-start text-[15px] font-medium text-text",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          id={id}
          name="repeat"
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          aria-describedby={showHelp ? `${id}-hint` : undefined}
          className={cn(
            "size-5 shrink-0 cursor-pointer accent-accent",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed",
          )}
        />
        {copy.recurrence.repeat}
      </label>
      {showHelp && (
        <span id={`${id}-hint`} className="text-[13px] leading-normal text-text-secondary">
          {copy.recurrence.help(day)}
        </span>
      )}
    </div>
  );
}

