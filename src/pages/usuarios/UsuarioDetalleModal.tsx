import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import type { Permiso, Rol, Usuario } from '../../utils/mockData'
import { formatDate } from '../../utils/formatters'
import PermisosPorModulo from './PermisosPorModulo'

interface UsuarioDetalleModalProps {
  usuario: Usuario
  roles: readonly Rol[]
  permisos: readonly Permiso[]
  onClose: () => void
}

export default function UsuarioDetalleModal({ usuario, roles, permisos, onClose }: UsuarioDetalleModalProps) {
  const rolesDelUsuario = roles.filter((rol) => usuario.rolesIds.includes(rol.id))
  const idsDePermisos = new Set(rolesDelUsuario.flatMap((rol) => rol.permisosIds))
  const permisosEfectivos = permisos.filter((permiso) => idsDePermisos.has(permiso.id))

  return (
    <Modal
      title="Detalle del usuario"
      size="lg"
      onClose={onClose}
      footer={
        <Button variant="secondary" data-autofocus onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-slate-600">Nombre</dt>
          <dd className="mt-1 text-sm text-slate-900">{usuario.nombre}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Correo electrónico</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{usuario.correo}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Estado</dt>
          <dd className="mt-1">
            <Badge variant={usuario.estado === 'activo' ? 'success' : 'neutral'}>
              {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Registrado</dt>
          <dd className="mt-1 text-sm text-slate-900">{formatDate(usuario.creadoEn)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-slate-600">Roles</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {rolesDelUsuario.length > 0 ? (
              rolesDelUsuario.map((rol) => (
                <Badge key={rol.id} icon={false}>
                  {rol.nombre}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-600">Sin roles asignados.</span>
            )}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="permisos-efectivos" className="mt-6 border-t border-slate-200 pt-4">
        <h3 id="permisos-efectivos" className="text-sm font-semibold text-slate-900">
          Permisos que otorgan sus roles
        </h3>
        <div className="mt-3">
          <PermisosPorModulo permisos={permisosEfectivos} />
        </div>
      </section>
    </Modal>
  )
}
