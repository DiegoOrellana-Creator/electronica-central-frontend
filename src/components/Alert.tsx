import type { ReactNode } from 'react'
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '../utils/styles'

type AlertVariant = 'error' | 'warning' | 'info' | 'success'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  /** Accion opcional, por ejemplo un boton para reintentar. */
  action?: ReactNode
}

const VARIANTS: Record<AlertVariant, { classes: string; icon: Icon }> = {
  error: { classes: 'border-red-300 bg-red-50 text-red-800', icon: WarningCircleIcon },
  warning: { classes: 'border-amber-300 bg-amber-50 text-amber-900', icon: WarningIcon },
  info: { classes: 'border-blue-300 bg-blue-50 text-blue-900', icon: InfoIcon },
  success: { classes: 'border-green-300 bg-green-50 text-green-800', icon: CheckCircleIcon },
}

/** Mensaje en linea. Los errores se anuncian de inmediato; el resto de forma cortes. */
export default function Alert({ variant = 'info', title, children, action }: AlertProps) {
  const { classes, icon: AlertIcon } = VARIANTS[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-md border p-3 text-sm', classes)}
    >
      <AlertIcon size={20} weight="fill" aria-hidden="true" className="shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}
