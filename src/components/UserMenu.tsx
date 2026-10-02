import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretDownIcon, SignOutIcon } from '@phosphor-icons/react'
import { cerrarSesion } from '../services/authService'
import { ROUTES } from '../utils/navigation'
import { FOCUS_RING, cn } from '../utils/styles'
import { useClickOutside } from '../hooks/useClickOutside'
import { useEscapeKey } from '../hooks/useEscapeKey'

export interface UserInfo {
  name: string
  role: string
}

interface UserMenuProps {
  user: UserInfo
}

export default function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])
  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  useClickOutside(containerRef, open, close)
  useEscapeKey(open, closeAndRestoreFocus)

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="user-menu-panel"
        aria-label={`Menú de usuario, ${user.name}`}
        className={cn(
          'flex min-h-11 items-center gap-2 rounded-md px-2 text-slate-700 hover:bg-slate-100',
          FOCUS_RING,
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-blue-700 text-xs font-semibold text-white"
        >
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-slate-900">{user.name}</span>
          <span className="block text-xs leading-tight text-slate-600">{user.role}</span>
        </span>
        <CaretDownIcon size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="user-menu-panel"
          className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-md"
        >
          <div className="border-b border-slate-200 px-3 py-2">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-600">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              close()
              void cerrarSesion().finally(() => navigate(ROUTES.login, { replace: true }))
            }}
            className={cn(
              'mt-1 flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-slate-100',
              FOCUS_RING,
            )}
          >
            <SignOutIcon size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
