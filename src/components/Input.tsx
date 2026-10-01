import type { ComponentProps, ReactNode } from 'react'
import FormField from './FormField'
import { FOCUS_RING, cn } from '../utils/styles'

interface InputProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  /** Mensaje de error visible bajo el campo. */
  error?: string
  /** Elemento al final del campo, por ejemplo un boton de accion. */
  endAdornment?: ReactNode
}

export default function Input({
  label,
  error,
  endAdornment,
  required,
  className,
  ...rest
}: InputProps) {
  return (
    <FormField label={label} required={required} error={error}>
      {(control) => (
        <div className="relative">
          <input
            {...control}
            required={required}
            className={cn(
              'block min-h-11 w-full rounded-md border bg-white px-3 text-base text-slate-900',
              'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600',
              error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400',
              endAdornment ? 'pr-12' : null,
              FOCUS_RING,
              className,
            )}
            {...rest}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-0.5 flex items-center">{endAdornment}</div>
          )}
        </div>
      )}
    </FormField>
  )
}
