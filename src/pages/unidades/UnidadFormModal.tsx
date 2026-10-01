import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import { ErrorDeServicio } from '../../services/simulacion'
import type { DatosUnidad } from '../../services/unidadService'
import type { EstadoUnidad, UnidadMedida } from '../../utils/mockData'
import { focusField } from '../../utils/forms'

interface UnidadFormModalProps {
  /** Si se indica, el formulario edita esa unidad; si no, crea una nueva. */
  unidad?: UnidadMedida
  onSubmit: (datos: DatosUnidad) => Promise<void>
  onClose: () => void
}

type Campo = 'nombre' | 'abreviatura'
type Errores = Partial<Record<Campo, string>>

// Orden en que aparecen los campos obligatorios: el foco va al primero con error.
const ORDEN_CAMPOS: readonly Campo[] = ['nombre', 'abreviatura']

const esCampo = (valor: string | undefined): valor is Campo => valor === 'nombre' || valor === 'abreviatura'

export default function UnidadFormModal({ unidad, onSubmit, onClose }: UnidadFormModalProps) {
  const editando = unidad !== undefined
  const formId = useId()

  const [nombre, setNombre] = useState(unidad?.nombre ?? '')
  const [abreviatura, setAbreviatura] = useState(unidad?.abreviatura ?? '')
  const [estado, setEstado] = useState<EstadoUnidad>(unidad?.estado ?? 'activo')
  const [errores, setErrores] = useState<Errores>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const limpiarError = (campo: Campo) => {
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return
    const form = event.currentTarget

    const nuevos: Errores = {}
    if (!nombre.trim()) nuevos.nombre = 'Ingrese el nombre de la unidad.'
    if (!abreviatura.trim()) nuevos.abreviatura = 'Ingrese la abreviatura.'

    const primerInvalido = ORDEN_CAMPOS.find((campo) => nuevos[campo])
    if (primerInvalido !== undefined) {
      setErrores(nuevos)
      setFormError('Revise los campos marcados.')
      focusField(form, primerInvalido)
      return
    }

    setErrores({})
    setFormError(null)
    setGuardando(true)
    try {
      await onSubmit({ nombre: nombre.trim(), abreviatura: abreviatura.trim(), estado })
    } catch (error) {
      const campo = error instanceof ErrorDeServicio ? error.campo : undefined
      if (error instanceof ErrorDeServicio && esCampo(campo)) {
        const delServicio: Errores = {}
        delServicio[campo] = error.message
        flushSync(() => {
          setErrores(delServicio)
          setFormError('Revise los campos marcados.')
          setGuardando(false)
        })
        // Los campos deben estar habilitados antes de poder recibir el foco.
        focusField(form, campo)
      } else {
        setFormError(error instanceof Error ? error.message : 'No se pudo guardar la unidad de medida.')
        setGuardando(false)
      }
    }
  }

  return (
    <Modal
      title={editando ? 'Editar unidad de medida' : 'Nueva unidad de medida'}
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

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Nombre"
            name="nombre"
            autoComplete="off"
            required
            maxLength={40}
            value={nombre}
            onChange={(event) => {
              setNombre(event.target.value)
              limpiarError('nombre')
            }}
            error={errores.nombre}
            disabled={guardando}
          />

          <Input
            label="Abreviatura"
            name="abreviatura"
            autoComplete="off"
            required
            maxLength={10}
            value={abreviatura}
            onChange={(event) => {
              setAbreviatura(event.target.value)
              limpiarError('abreviatura')
            }}
            error={errores.abreviatura}
            disabled={guardando}
          />
        </div>

        <div className="sm:w-1/2 sm:pr-2.5">
          <Select
            label="Estado"
            name="estado"
            required
            value={estado}
            onChange={(event) => setEstado(event.target.value === 'inactivo' ? 'inactivo' : 'activo')}
            disabled={guardando}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </div>
      </form>
    </Modal>
  )
}
