import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react'
import { evaluarContrasena } from '../utils/validators'
import { cn } from '../utils/styles'

interface PasswordRulesProps {
  contrasena: string
  id?: string
}

/** Lista de requisitos de la contrasena. Cada uno combina icono, texto y lectura para lectores de pantalla. */
export default function PasswordRules({ contrasena, id }: PasswordRulesProps) {
  return (
    <ul id={id} aria-label="Requisitos de la contraseña" className="space-y-1 text-sm">
      {evaluarContrasena(contrasena).map((regla) => (
        <li
          key={regla.texto}
          className={cn('flex items-center gap-2', regla.cumple ? 'text-green-800' : 'text-slate-600')}
        >
          {regla.cumple ? (
            <CheckCircleIcon size={18} weight="fill" aria-hidden="true" className="shrink-0" />
          ) : (
            <CircleIcon size={18} aria-hidden="true" className="shrink-0" />
          )}
          <span>{regla.texto}</span>
          <span className="sr-only">{regla.cumple ? '(cumplido)' : '(pendiente)'}</span>
        </li>
      ))}
    </ul>
  )
}
