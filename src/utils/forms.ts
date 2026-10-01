/** Lleva el foco al campo del formulario con ese `name` (o al primero de un grupo). */
export function focusField(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name)
  const target = field instanceof RadioNodeList ? field[0] : field
  if (target instanceof HTMLElement) target.focus()
}
