import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import Textarea from '../../components/Textarea'
import { ErrorDeServicio } from '../../services/simulacion'
import type { DatosCategoria } from '../../services/categoriaService'
import type { Categoria, EstadoCategoria } from '../../utils/mockData'
import { focusField } from '../../utils/forms'

interface CategoriaFormModalProps {
  /** Si se indica, el formulario edita esa categoria; si no, crea una nueva. */
  categoria?: Categoria
  categorias: readonly Categoria[]
  onSubmit: (datos: DatosCategoria) => Promise<void>
  onClose: () => void
}

type Campo = 'nombre' | 'categoriaPadreId'
type Errores = Partial<Record<Campo, string>>

const esCampo = (valor: string | undefined): valor is Campo => valor === 'nombre' || valor === 'categoriaPadreId'

export default function CategoriaFormModal({ categoria, categorias, onSubmit, onClose }: CategoriaFormModalProps) {
  const editando = categoria !== undefined
  const formId = useId()

  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(categoria?.descripcion ?? '')
  const [padreId, setPadreId] = useState(categoria?.categoriaPadreId != null ? String(categoria.categoriaPadreId) : '')
  const [estado, setEstado] = useState<EstadoCategoria>(categoria?.estado ?? 'activo')
  const [errores, setErrores] = useState<Errores>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  // Solo una categoria principal puede ser padre (maximo dos niveles), y nunca la misma categoria.
  const padresPosibles = categorias.filter((c) => c.categoriaPadreId === null && c.id !== categoria?.id)
  // Una categoria con subcategorias ya es padre: no puede depender de otra.
  const tieneSubcategorias = editando && categorias.some((c) => c.categoriaPadreId === categoria.id)

  const limpiarError = (campo: Campo) => {
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return
    const form = event.currentTarget

    if (!nombre.trim()) {
      setErrores({ nombre: 'Ingrese el nombre de la categoría.' })
      setFormError('Revise los campos marcados.')
      focusField(form, 'nombre')
      return
    }

    setErrores({})
    setFormError(null)
    setGuardando(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoriaPadreId: padreId ? Number(padreId) : null,
        estado,
      })
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
        setFormError(error instanceof Error ? error.message : 'No se pudo guardar la categoría.')
        setGuardando(false)
      }
    }
  }

  return (
    <Modal
      title={editando ? 'Editar categoría' : 'Nueva categoría'}
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
          maxLength={80}
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            limpiarError('nombre')
          }}
          error={errores.nombre}
          disabled={guardando}
        />

        <Textarea
          label="Descripción"
          name="descripcion"
          rows={3}
          maxLength={200}
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          disabled={guardando}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Select
              label="Categoría padre"
              name="categoriaPadreId"
              value={padreId}
              onChange={(event) => {
                setPadreId(event.target.value)
                limpiarError('categoriaPadreId')
              }}
              error={errores.categoriaPadreId}
              disabled={guardando || tieneSubcategorias}
            >
              <option value="">Sin categoría padre</option>
              {padresPosibles.map((padre) => (
                <option key={padre.id} value={padre.id}>
                  {padre.estado === 'inactivo' ? `${padre.nombre} (inactiva)` : padre.nombre}
                </option>
              ))}
            </Select>
            {tieneSubcategorias && (
              <p className="mt-1.5 text-sm text-slate-600">
                Esta categoría tiene subcategorías, por lo que debe seguir siendo principal.
              </p>
            )}
          </div>

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
