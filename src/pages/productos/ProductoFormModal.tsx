import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import FormField from '../../components/FormField'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import { ErrorDeServicio } from '../../services/simulacion'
import type { DatosProducto } from '../../services/productoService'
import type { Categoria, EstadoProducto, Producto, UnidadMedida } from '../../utils/tipos'
import { focusField } from '../../utils/forms'
import { FOCUS_RING, cn } from '../../utils/styles'
import { parsePrecio } from '../../utils/validators'
import CategoriaOptions from './CategoriaOptions'

interface ProductoFormModalProps {
  /** Si se indica, el formulario edita ese producto; si no, crea uno nuevo. */
  producto?: Producto
  categorias: readonly Categoria[]
  unidades: readonly UnidadMedida[]
  onSubmit: (datos: DatosProducto) => Promise<void>
  onClose: () => void
}

type Campo = 'nombre' | 'precio' | 'categoriaId' | 'marca' | 'unidadId'
type Errores = Partial<Record<Campo, string>>

// Orden en que aparecen los campos obligatorios: el foco va al primero con error.
const ORDEN_CAMPOS: readonly Campo[] = ['nombre', 'precio', 'categoriaId', 'marca', 'unidadId']

const esCampo = (valor: string | undefined): valor is Campo =>
  valor !== undefined && (ORDEN_CAMPOS as readonly string[]).includes(valor)

const precioInicial = (producto?: Producto) =>
  producto ? producto.precio.toFixed(2).replace('.', ',') : ''

export default function ProductoFormModal({ producto, categorias, unidades, onSubmit, onClose }: ProductoFormModalProps) {
  const editando = producto !== undefined
  const formId = useId()

  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '')
  const [precio, setPrecio] = useState(precioInicial(producto))
  const [categoriaId, setCategoriaId] = useState(producto ? String(producto.categoriaId) : '')
  const [marca, setMarca] = useState(producto?.marca ?? '')
  const [modelo, setModelo] = useState(producto?.modelo ?? '')
  const [unidadId, setUnidadId] = useState(producto ? String(producto.unidadId) : '')
  const [estado, setEstado] = useState<EstadoProducto>(producto?.estado ?? 'activo')
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
    if (!nombre.trim()) nuevos.nombre = 'Ingrese el nombre del producto.'
    const resultadoPrecio = parsePrecio(precio)
    if ('error' in resultadoPrecio) nuevos.precio = resultadoPrecio.error
    if (!categoriaId) nuevos.categoriaId = 'Seleccione una categoría.'
    if (!marca.trim()) nuevos.marca = 'Ingrese la marca.'
    if (!unidadId) nuevos.unidadId = 'Seleccione una unidad de medida.'

    const primerInvalido = ORDEN_CAMPOS.find((campo) => nuevos[campo])
    if (primerInvalido !== undefined || 'error' in resultadoPrecio) {
      setErrores(nuevos)
      setFormError('Revise los campos marcados.')
      focusField(form, primerInvalido ?? 'precio')
      return
    }

    setErrores({})
    setFormError(null)
    setGuardando(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: resultadoPrecio.valor,
        categoriaId,
        marca: marca.trim(),
        modelo: modelo.trim(),
        unidadId,
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
        setFormError(error instanceof Error ? error.message : 'No se pudo guardar el producto.')
        setGuardando(false)
      }
    }
  }

  return (
    <Modal
      title={editando ? 'Editar producto' : 'Nuevo producto'}
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
          maxLength={120}
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            limpiarError('nombre')
          }}
          error={errores.nombre}
          disabled={guardando}
        />

        <FormField label="Descripción">
          {(control) => (
            <textarea
              {...control}
              name="descripcion"
              rows={3}
              maxLength={300}
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              disabled={guardando}
              className={cn(
                'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 hover:border-slate-400',
                'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600',
                FOCUS_RING,
              )}
            />
          )}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Precio (Bs)"
            name="precio"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            required
            value={precio}
            onChange={(event) => {
              setPrecio(event.target.value)
              limpiarError('precio')
            }}
            error={errores.precio}
            disabled={guardando}
          />

          <Select
            label="Categoría"
            name="categoriaId"
            required
            value={categoriaId}
            onChange={(event) => {
              setCategoriaId(event.target.value)
              limpiarError('categoriaId')
            }}
            error={errores.categoriaId}
            disabled={guardando}
          >
            <option value="">Seleccione una categoría</option>
            <CategoriaOptions categorias={categorias} />
          </Select>

          <Input
            label="Marca"
            name="marca"
            autoComplete="off"
            required
            maxLength={60}
            value={marca}
            onChange={(event) => {
              setMarca(event.target.value)
              limpiarError('marca')
            }}
            error={errores.marca}
            disabled={guardando}
          />

          <Input
            label="Modelo"
            name="modelo"
            autoComplete="off"
            maxLength={60}
            value={modelo}
            onChange={(event) => setModelo(event.target.value)}
            disabled={guardando}
          />

          <Select
            label="Unidad de medida"
            name="unidadId"
            required
            value={unidadId}
            onChange={(event) => {
              setUnidadId(event.target.value)
              limpiarError('unidadId')
            }}
            error={errores.unidadId}
            disabled={guardando}
          >
            <option value="">Seleccione una unidad</option>
            {unidades.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.nombre} ({unidad.abreviatura})
              </option>
            ))}
          </Select>

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
