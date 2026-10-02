import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import type { UserInfo } from '../components/UserMenu'
import { obtenerUsuario } from '../services/sesion'
import { NAV_ITEMS } from '../utils/navigation'

const NOMBRES_ROL: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  VENDEDOR: 'Vendedor',
  DESARROLLADOR: 'Desarrollador',
  CLIENTE: 'Cliente',
}

function usuarioActual(): UserInfo {
  const usuario = obtenerUsuario()
  const rol = usuario?.roles[0]
  return {
    name: usuario?.nombreUsuario ?? 'Usuario',
    role: rol ? (NOMBRES_ROL[rol] ?? rol) : '',
  }
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const [currentUser] = useState(usuarioActual)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const title = NAV_ITEMS.find((item) => pathname.startsWith(item.to))?.label ?? ''

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-blue-800 focus:shadow-md"
      >
        Saltar al contenido
      </a>

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Header
          title={title}
          user={currentUser}
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main id="contenido" className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
