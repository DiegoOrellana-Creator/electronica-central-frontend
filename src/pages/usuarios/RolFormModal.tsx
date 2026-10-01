import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { FieldError } from '../../components/FormField'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import { ErrorDeServicio } from '../../services/simulacion'
import type { DatosRol } from '../../services/rolService'
import type { Permiso, Rol } from '../../utils/mockData'
import { focusField } from '../../utils/forms'
import { agruparPorModulo } from '../../utils/permisos'
import { FOCUS_RING, cn } from '../../utils/styles'

interface RolFormModalProps {
  /** Si se indica, el formulario edita ese rol; si no, crea uno nuevo. */
  rol?: Rol
  permisos: readonly Permiso[]
  onSubmit: (datos: DatosRol) => Promise<void>
  onClose: () => void
}

type Campo = 'nombre' | 'descripcion' | 'permisosIds'
type Errores = Partial<Record<Campo, string>>

const NOMBRE_DEL_CAMPO: Record<Campo, string> = {
  nombre: 'nombre',
  descripcion: 'descripcion',
  permisosIds: 'permisos',
}

export default function RolFormModal({ rol, permisos, onSubmit, onClose }: RolFormModalProps) {
  const editando = rol !== undefined
  const formId = useId()
  const permisosErrorId = useId()

  const [nombre, setNombre] = useState(rol?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '')
  const [permisosIds, setPermisosIds] = useState<number[]>(rol?.permisosIds ?? [])
  const [errores, setErrores] = useState<Errores>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const limpiarError = (campo: Campo) => {
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
    setFormError(null)
  }

  const alternarPermiso = (permisoId: number) => {
    setPermisosIds((prev) =>
      prev.includes(permisoId) ? prev.filter((id) => id !== permisoId) : [...prev, permisoId],
    )
    limpiarError('permisosIds')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return
    const form = event.currentTarget

    const nuevos: Errores = {}
    if (!nombre.trim()) nuevos.nombre = 'Ingrese el nombre del rol.'
    if (!descripcion.trim()) nuevos.descripcion = 'Ingrese una descripción.'
    if (permisosIds.length === 0) nuevos.permisosIds = 'Seleccione al menos un permiso.'

    const primerInvalido = (['nombre', 'descripcion', 'permisosIds'] as const).find((campo) => nuevos[campo])
    if (primerInvalido) {
      setErrores(nuevos)
      setFormError('Revise los campos marcados.')
      focusField(form, NOMBRE_DEL_CAMPO[primerInvalido])
      return
    }

    setErrores({})
    setFormError(null)
    setGuardando(true)
    try {
      await onSubmit({ nombre: nombre.trim(), descripcion: descripcion.trim(), permisosIds })
    } catch (error) {
      if (error instanceof ErrorDeServicio && error.campo === 'nombre') {
        flushSync(() => {
          setErrores({ nombre: error.message })
          setFormError('Revise los campos marcados.')
          setGuardando(false)
        })
        // Los campos deben estar habilitados antes de poder recibir el foco.
        focusField(form, 'nombre')
      } else {
        setFormError(error instanceof Error ? error.message : 'No se pudo guardar el rol.')
        setGuardando(false)
      }
    }
  }

  return (
    <Modal
      title={editando ? 'Editar rol' : 'Nuevo rol'}
      description="Los campos con asterisco (*) son obligatorios."
      size="lg"
      busy={guardando}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          label="Nombre"
          name="nombre"
          autoComplete="off"
          required
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            limpiarError('nombre')
          }}
          error={errores.nombre}
          disabled={guardando}
        />

        <Input
          label="Descripción"
          name="descripcion"
          autoComplete="off"
          required
          value={descripcion}
          onChange={(event) => {
            setDescripcion(event.target.value)
            limpiarError('descripcion')
          }}
          error={errores.descripcion}
          disabled={guardando}
        />

        <fieldset disabled={guardando} aria-describedby={errores.permisosIds ? permisosErrorId : undefined}>
          <legend className="text-sm font-medium text-slate-900">
            Permisos
            <span aria-hidden="true" className="ml-0.5 text-red-700">
              *
            </span>
          </legend>
          <div className="mt-2 space-y-4">
            {agruparPorModulo(permisos).map((grupo) => (
              <div key={grupo.modulo}>
                <p className="text-xs font-semibold text-slate-600">{grupo.modulo}</p>
                <div className="mt-1 grid gap-x-4 sm:grid-cols-2">
                  {grupo.permisos.map((permiso) => (
                    <label
                      key={permiso.id}
                      className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="permisos"
                        value={permiso.id}
                        checked={permisosIds.includes(permiso.id)}
                        onChange={() => alternarPermiso(permiso.id)}
                        className={cn('size-4 rounded border-slate-300 accent-blue-700', FOCUS_RING)}
                      />
                      {permiso.nombre}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {errores.permisosIds && <FieldError id={permisosErrorId}>{errores.permisosIds}</FieldError>}
        </fieldset>
      </form>
    </Modal>
  )
}
