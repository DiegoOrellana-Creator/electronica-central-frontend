import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import type { Rol, Usuario } from '../../utils/tipos'

interface RevocarRolModalProps {
  usuario: Usuario
  roles: readonly Rol[]
  /** Se invoca al elegir el rol a revocar; la confirmacion la gestiona el padre. */
  onElegir: (rol: Rol) => void
  onClose: () => void
}

export default function RevocarRolModal({ usuario, roles, onElegir, onClose }: RevocarRolModalProps) {
  const asignados = roles.filter((rol) => usuario.rolesIds.includes(rol.id))

  return (
    <Modal
      title="Revocar rol"
      description={`Elija el rol que desea retirar a ${usuario.nombre}. Se le pedirá confirmación.`}
      onClose={onClose}
      footer={
        <Button variant="secondary" data-autofocus onClick={onClose}>
          Cancelar
        </Button>
      }
    >
      {asignados.length === 0 ? (
        <Alert variant="info">El usuario no tiene roles asignados.</Alert>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {asignados.map((rol) => (
            <li key={rol.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{rol.nombre}</p>
                <p className="text-sm text-slate-600">{rol.descripcion}</p>
              </div>
              <Button
                variant="secondary"
                aria-label={`Revocar rol ${rol.nombre}`}
                onClick={() => onElegir(rol)}
              >
                Revocar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
