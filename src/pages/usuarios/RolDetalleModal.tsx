import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import type { Permiso, Rol, Usuario } from '../../utils/tipos'
import PermisosPorModulo from './PermisosPorModulo'

interface RolDetalleModalProps {
  rol: Rol
  permisos: readonly Permiso[]
  /** Usuarios que tienen asignado este rol (relacion usuario_rol). */
  usuarios: readonly Usuario[]
  onClose: () => void
}

export default function RolDetalleModal({ rol, permisos, usuarios, onClose }: RolDetalleModalProps) {
  const permisosDelRol = permisos.filter((permiso) => rol.permisosIds.includes(permiso.id))

  return (
    <Modal
      title="Detalle del rol"
      size="lg"
      onClose={onClose}
      footer={
        <Button variant="secondary" data-autofocus onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <dl className="space-y-4">
        <div>
          <dt className="text-xs font-semibold text-slate-600">Nombre</dt>
          <dd className="mt-1 text-sm text-slate-900">{rol.nombre}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Descripción</dt>
          <dd className="mt-1 text-sm text-slate-900">{rol.descripcion}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Usuarios con este rol</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <Badge key={usuario.id} icon={false}>
                  {usuario.nombre}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-600">Ningún usuario tiene este rol.</span>
            )}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="permisos-del-rol" className="mt-6 border-t border-slate-200 pt-4">
        <h3 id="permisos-del-rol" className="text-sm font-semibold text-slate-900">
          Permisos ({permisosDelRol.length})
        </h3>
        <div className="mt-3">
          <PermisosPorModulo permisos={permisosDelRol} />
        </div>
      </section>
    </Modal>
  )
}
