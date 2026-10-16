import { useSearchParams } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import LoadingState, { Skeleton } from '../components/LoadingState'
import Tabs from '../components/Tabs'
import { useRoles } from '../hooks/useRoles'
import { useUsuarios } from '../hooks/useUsuarios'
import { tienePermiso } from '../services/sesion'
import RolesTab from './usuarios/RolesTab'
import UsuariosTab from './usuarios/UsuariosTab'

const TABS = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'roles', label: 'Roles' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Usuarios() {
  const [params, setParams] = useSearchParams()
  // Solo el administrador gestiona roles y permisos; el empleado solo ve y crea usuarios.
  const puedeGestionar = tienePermiso('USUARIOS_GESTIONAR')
  const tab: TabId = puedeGestionar && params.get('tab') === 'roles' ? 'roles' : 'usuarios'

  const { usuarios, estado: estadoUsuarios, recargar: recargarUsuarios, ...operacionesUsuarios } = useUsuarios()
  const { roles, permisos, estado: estadoRoles, recargar: recargarRoles, ...operacionesRoles } = useRoles()

  const cargando = estadoUsuarios === 'cargando' || estadoRoles === 'cargando'
  const conError = estadoUsuarios === 'error' || estadoRoles === 'error'

  const cambiarTab = (id: string) => {
    setParams(id === 'roles' ? { tab: 'roles' } : {}, { replace: true })
  }

  const reintentar = () => {
    recargarUsuarios()
    recargarRoles()
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          {puedeGestionar ? 'Usuarios y Roles' : 'Usuarios'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {puedeGestionar
            ? 'Gestione las cuentas de acceso, los roles y los permisos del sistema.'
            : 'Consulte las cuentas de acceso y registre nuevos usuarios.'}
        </p>
      </header>

      {cargando ? (
        <LoadingState label="Cargando usuarios y roles…">
          <div className="space-y-3">
            <Skeleton className="h-11 w-full sm:w-1/2" />
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        </LoadingState>
      ) : conError ? (
        <Alert
          variant="error"
          title="No se pudo cargar la información"
          action={
            <Button variant="secondary" onClick={reintentar}>
              Reintentar
            </Button>
          }
        >
          Ocurrió un problema al obtener los usuarios y roles. Intente nuevamente.
        </Alert>
      ) : puedeGestionar ? (
        <>
          <Tabs label="Secciones de usuarios y roles" idPrefix="ur" tabs={TABS} value={tab} onChange={cambiarTab} />
          {tab === 'usuarios' ? (
            <div role="tabpanel" id="ur-panel-usuarios" aria-labelledby="ur-tab-usuarios">
              <UsuariosTab usuarios={usuarios} roles={roles} permisos={permisos} operaciones={operacionesUsuarios} />
            </div>
          ) : (
            <div role="tabpanel" id="ur-panel-roles" aria-labelledby="ur-tab-roles">
              <RolesTab roles={roles} permisos={permisos} usuarios={usuarios} operaciones={operacionesRoles} />
            </div>
          )}
        </>
      ) : (
        <UsuariosTab usuarios={usuarios} roles={roles} permisos={permisos} operaciones={operacionesUsuarios} />
      )}
    </div>
  )
}