import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldShell, describedBy, fieldBorder, inputClass } from "./Field";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  labelAside?: ReactNode;
  hint?: ReactNode;
  hintStyle?: "mono" | "text";
  /** Mensagem de erro — ou `true` para só marcar a borda, sem mensagem (login). */
  error?: ReactNode;
  fieldClassName?: string;
};

export function TextField({
  id,
  label,
  labelAside,
  hint,
  hintStyle,
  error,
  fieldClassName,
  className,
  ...inputProps
}: TextFieldProps) {
  const message = error === true ? null : error;
  return (
    <FieldShell
      id={id}
      label={label}
      labelAside={labelAside}
      hint={hint}
      hintStyle={hintStyle}
      error={message}
      className={fieldClassName}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, message)}
        className={cn(inputClass, fieldBorder(error ? "x" : null), className)}
        {...inputProps}
      />
    </FieldShell>
  );
}
