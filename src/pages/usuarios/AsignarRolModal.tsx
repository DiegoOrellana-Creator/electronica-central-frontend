import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import type { Rol, Usuario } from '../../utils/mockData'

interface AsignarRolModalProps {
  usuario: Usuario
  roles: readonly Rol[]
  onSubmit: (rolId: number) => Promise<void>
  onClose: () => void
}

export default function AsignarRolModal({ usuario, roles, onSubmit, onClose }: AsignarRolModalProps) {
  const formId = useId()
  const [rolId, setRolId] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const asignados = roles.filter((rol) => usuario.rolesIds.includes(rol.id))
  const disponibles = roles.filter((rol) => !usuario.rolesIds.includes(rol.id))
  const seleccionado = disponibles.find((rol) => String(rol.id) === rolId)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return
    if (!seleccionado) {
      setError('Seleccione un rol.')
      return
    }
    setGuardando(true)
    setFormError(null)
    try {
      await onSubmit(seleccionado.id)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo asignar el rol.')
      setGuardando(false)
    }
  }

  return (
    <Modal
      title="Asignar rol"
      description={`Seleccione el rol que desea asignar a ${usuario.nombre}.`}
      busy={guardando}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          {disponibles.length > 0 && (
            <Button type="submit" form={formId} loading={guardando}>
              {guardando ? 'Asignando…' : 'Asignar rol'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-slate-900">Roles actuales</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {asignados.length > 0 ? (
              asignados.map((rol) => (
                <Badge key={rol.id} icon={false}>
                  {rol.nombre}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-600">Sin roles asignados.</span>
            )}
          </div>
        </div>

        {disponibles.length === 0 ? (
          <Alert variant="info">El usuario ya tiene asignados todos los roles disponibles.</Alert>
        ) : (
          <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-3">
            {formError && <Alert variant="error">{formError}</Alert>}
            <Select
              label="Rol a asignar"
              name="rol"
              required
              value={rolId}
              onChange={(event) => {
                setRolId(event.target.value)
                setError(undefined)
              }}
              error={error}
              disabled={guardando}
            >
              <option value="">Seleccione un rol</option>
              {disponibles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </Select>
            {seleccionado && <p className="text-sm text-slate-600">{seleccionado.descripcion}</p>}
          </form>
        )}
      </div>
    </Modal>
  )
}
