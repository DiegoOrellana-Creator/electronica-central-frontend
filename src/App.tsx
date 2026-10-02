import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import RecuperarContrasena from './pages/RecuperarContrasena'
import RestablecerContrasena from './pages/RestablecerContrasena'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Bitacora from './pages/Bitacora'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import UnidadesMedida from './pages/UnidadesMedida'
import RutaProtegida from './components/RutaProtegida'
import { ROUTES } from './utils/navigation'

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.recuperar} element={<RecuperarContrasena />} />
      <Route path={ROUTES.restablecer} element={<RestablecerContrasena />} />
      <Route element={<RutaProtegida />}>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.dashboard} element={<Dashboard />} />
        <Route path={ROUTES.usuarios} element={<Usuarios />} />
        <Route path={ROUTES.bitacora} element={<Bitacora />} />
        <Route path={ROUTES.productos} element={<Productos />} />
        <Route path={ROUTES.categorias} element={<Categorias />} />
        <Route path={ROUTES.unidadesMedida} element={<UnidadesMedida />} />
      </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
    </Routes>
  )
}
