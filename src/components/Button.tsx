import type { ComponentProps } from 'react'
import { SpinnerIcon } from '@phosphor-icons/react'
import { FOCUS_RING, cn } from '../utils/styles'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  /** Muestra un indicador de carga y deshabilita el boton. */
  loading?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

export default function Button({
  variant = 'primary',
  loading = false,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold',
        'transition-colors motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-80',
        VARIANT_CLASSES[variant],
        FOCUS_RING,
        className,
      )}
      {...rest}
    >
      {loading && (
        <SpinnerIcon size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
      )}
      {children}
    </button>
  )
}
