import { Navigate, Outlet } from 'react-router-dom'
import { obtenerSesion } from '../services/sesion'
import { ROUTES } from '../utils/navigation'

/** Solo deja pasar a usuarios con sesion vigente; si no, envia al login. */
export default function RutaProtegida() {
  if (!obtenerSesion()) return <Navigate to={ROUTES.login} replace />
  return <Outlet />
}
