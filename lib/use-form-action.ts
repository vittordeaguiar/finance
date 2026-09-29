"use client";

import { useActionState, useEffect, useRef, startTransition, type FormEvent } from "react";

/**
 * `useActionState` sem o reset automático do formulário: os valores digitados ficam no lugar
 * após um erro. Depois de cada resposta, foca o primeiro campo com `aria-invalid`.
 */
export function useFormAction<State>(
  action: (state: Awaited<State>, formData: FormData) => Promise<State>,
  initialState: Awaited<State>,
) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  useEffect(() => {
    if (state === initialState) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state, initialState]);

  return { state, pending, formRef, formProps: { ref: formRef, action: formAction, onSubmit, noValidate: true } };
}
