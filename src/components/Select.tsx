import type { ComponentProps } from 'react'
import FormField from './FormField'
import { FOCUS_RING, cn } from '../utils/styles'

interface SelectProps extends Omit<ComponentProps<'select'>, 'id'> {
  label: string
  error?: string
  hideLabel?: boolean
}

/** Lista desplegable nativa con etiqueta y mensaje de error. Recibe `<option>` como hijos. */
export default function Select({
  label,
  error,
  hideLabel,
  required,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <FormField label={label} required={required} error={error} hideLabel={hideLabel}>
      {(control) => (
        <select
          {...control}
          required={required}
          className={cn(
            'block min-h-11 w-full rounded-md border bg-white px-3 text-base text-slate-900',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600',
            error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400',
            FOCUS_RING,
            className,
          )}
          {...rest}
        >
          {children}
        </select>
      )}
    </FormField>
  )
}
