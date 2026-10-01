import { ListIcon } from '@phosphor-icons/react'
import UserMenu from './UserMenu'
import type { UserInfo } from './UserMenu'
import { FOCUS_RING, cn } from '../utils/styles'

interface HeaderProps {
  title: string
  user: UserInfo
  menuOpen: boolean
  onMenuClick: () => void
}

export default function Header({ title, user, menuOpen, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          className={cn(
            'grid size-11 place-items-center rounded-md text-slate-700 hover:bg-slate-100 lg:hidden',
            FOCUS_RING,
          )}
        >
          <ListIcon size={24} aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <UserMenu user={user} />
    </header>
  )
}
