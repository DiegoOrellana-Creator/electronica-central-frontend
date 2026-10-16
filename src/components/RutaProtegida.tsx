import { Navigate, Outlet } from 'react-router-dom'
import { obtenerSesion, tienePermiso } from '../services/sesion'
import { ROUTES } from '../utils/navigation'

/**
 * Solo deja pasar a usuarios con sesion vigente; si no, envia al login.
 * Si se indican `permisos`, ademas exige al menos uno de ellos; si no, envia al panel.
 */
export default function RutaProtegida({ permisos }: { permisos?: readonly string[] }) {
  if (!obtenerSesion()) return <Navigate to={ROUTES.login} replace />
  if (permisos && !permisos.some(tienePermiso)) return <Navigate to={ROUTES.dashboard} replace />
  return <Outlet />
}