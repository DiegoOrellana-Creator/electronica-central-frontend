import type { ReactNode } from 'react'
import {
  CheckCircleIcon,
  InfoIcon,
  MinusCircleIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '../utils/styles'

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  /** Icono propio, o `false` para mostrar solo texto (por ejemplo, etiquetas de rol). */
  icon?: Icon | false
  children: ReactNode
}

// Cada estado combina color, icono y texto: nunca depende solo del color.
const VARIANTS: Record<BadgeVariant, { classes: string; icon: Icon }> = {
  success: { classes: 'bg-green-50 text-green-800 ring-green-700/25', icon: CheckCircleIcon },
  error: { classes: 'bg-red-50 text-red-800 ring-red-700/25', icon: XCircleIcon },
  warning: { classes: 'bg-amber-50 text-amber-900 ring-amber-700/30', icon: WarningIcon },
  info: { classes: 'bg-blue-50 text-blue-800 ring-blue-700/25', icon: InfoIcon },
  neutral: { classes: 'bg-slate-100 text-slate-700 ring-slate-500/25', icon: MinusCircleIcon },
}

export default function Badge({ variant = 'neutral', icon, children }: BadgeProps) {
  const { classes, icon: defaultIcon } = VARIANTS[variant]
  const BadgeIcon = icon === false ? null : (icon ?? defaultIcon)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        classes,
      )}
    >
      {BadgeIcon && <BadgeIcon size={14} weight="fill" aria-hidden="true" />}
      {children}
    </span>
  )
}
