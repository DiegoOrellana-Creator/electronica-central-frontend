import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import Textarea from '../../components/Textarea'
import { ErrorDeServicio } from '../../services/simulacion'
import { registrarAjusteInventario } from '../../services/inventarioService'
import { formatNumber } from '../../utils/formatters'
import type { ItemInventario, ResultadoAjusteInventario, TipoMovimientoInventario } from '../../utils/tipos'

interface AjusteInventarioModalProps {
  item: ItemInventario
  onSuccess: (resultado: ResultadoAjusteInventario, item: ItemInventario) => void
  onClose: () => void
}

type Campo = 'tipo' | 'cantidad' | 'costoUnitario' | 'motivo'
type Errores = Partial<Record<Campo, string>>

/** Modal accesible para registrar un ajuste de inventario (Entrada o Salida) de un producto. */
export default function AjusteInventarioModal({ item, onSuccess, onClose }: AjusteInventarioModalProps) {
  const formId = useId()
  const [tipo, setTipo] = useState<TipoMovimientoInventario>('ENTRADA')
  const [cantidad, setCantidad] = useState('')
  const [costoUnitario, setCostoUnitario] = useState(
    item.costoPromedio !== undefined && item.costoPromedio > 0 ? item.costoPromedio.toString() : '',
  )
  const [motivo, setMotivo] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  // Clave de idempotencia única por intento lógico de operación
  const claveIdempotenciaRef = useRef(crypto.randomUUID())
  const ultimoPayloadRef = useRef<string>('')

  const limpiarError = (campo: Campo) => {
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
    setFormError(null)
  }

  const cantidadNum = Number(cantidad.trim().replace(',', '.'))
  const esCantidadValida = !isNaN(cantidadNum) && cantidadNum > 0
  const stockProyectado = esCantidadValida
    ? tipo === 'ENTRADA'
      ? item.stockActual + cantidadNum
      : Math.max(0, item.stockActual - cantidadNum)
    : item.stockActual

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return

    const nuevosErrores: Errores = {}

    // Validar cantidad
    const cantLimpia = cantidad.trim().replace(',', '.')
    if (!cantLimpia) {
      nuevosErrores.cantidad = 'Ingrese la cantidad a ajustar.'
    } else {
      const numCant = Number(cantLimpia)
      if (isNaN(numCant) || numCant <= 0) {
        nuevosErrores.cantidad = 'La cantidad debe ser un número positivo mayor a cero.'
      } else if (!/^\d+(\.\d{1,4})?$/.test(cantLimpia)) {
        nuevosErrores.cantidad = 'La cantidad no puede tener más de 4 posiciones decimales.'
      } else if (tipo === 'SALIDA' && numCant > item.stockActual) {
        nuevosErrores.cantidad = `Stock insuficiente. La cantidad máxima que puede retirar es ${formatNumber(item.stockActual)}.`
      }
    }

    // Validar costo unitario en entradas
    let numCosto: number | undefined = undefined
    if (tipo === 'ENTRADA') {
      const costoLimpio = costoUnitario.trim().replace(',', '.')
      if (!costoLimpio) {
        nuevosErrores.costoUnitario = 'El costo unitario es obligatorio al registrar una entrada.'
      } else {
        numCosto = Number(costoLimpio)
        if (isNaN(numCosto) || numCosto < 0) {
          nuevosErrores.costoUnitario = 'El costo unitario no puede ser negativo.'
        }
      }
    }

    // Validar motivo
    if (!motivo.trim()) {
      nuevosErrores.motivo = 'Ingrese el motivo del ajuste de inventario.'
    } else if (motivo.trim().length > 2000) {
      nuevosErrores.motivo = 'El motivo no puede exceder los 2000 caracteres.'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      setFormError('Revise los campos marcados.')
      return
    }

    // Si los datos cambiaron respecto al último intento, generamos una clave nueva;
    // si son los mismos (reintento por fallo de red), conservamos la misma clave.
    const payloadActual = `${tipo}:${cantLimpia}:${numCosto ?? ''}:${motivo.trim()}`
    if (ultimoPayloadRef.current !== payloadActual) {
      ultimoPayloadRef.current = payloadActual
      claveIdempotenciaRef.current = crypto.randomUUID()
    }

    setErrores({})
    setFormError(null)
    setGuardando(true)

    try {
      const resultado = await registrarAjusteInventario({
        idProducto: item.idProducto,
        tipo,
        cantidad: Number(cantLimpia),
        costoUnitario: numCosto,
        motivo: motivo.trim(),
        claveIdempotencia: claveIdempotenciaRef.current,
      })

      onSuccess(resultado, item)
    } catch (error) {
      if (error instanceof ErrorDeServicio) {
        const campo = error.campo as Campo | undefined
        if (campo && ['tipo', 'cantidad', 'costoUnitario', 'motivo'].includes(campo)) {
          setErrores({ [campo]: error.message })
          setFormError('Revise los campos marcados.')
        } else {
          setFormError(error.message)
        }
      } else {
        setFormError(error instanceof Error ? error.message : 'No se pudo registrar el ajuste de inventario.')
      }
      setGuardando(false)
    }
  }

  return (
    <Modal
      title="Ajuste de inventario"
      description={`Producto: ${item.nombre} (${item.codigo})`}
      size="md"
      busy={guardando}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={guardando}>
            {guardando ? 'Registrando ajuste…' : tipo === 'ENTRADA' ? 'Registrar entrada' : 'Registrar salida'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <Alert variant="error" title="No se pudo registrar el ajuste">
            {formError}
          </Alert>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Stock actual:</span>
            <span className="font-semibold text-slate-900">{formatNumber(item.stockActual)}</span>
          </div>
          {esCantidadValida && (
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1">
              <span className="text-slate-600">Stock estimado resultante:</span>
              <span className="font-bold text-slate-900">{formatNumber(stockProyectado)}</span>
            </div>
          )}
        </div>

        <Select
          label="Tipo de ajuste"
          required
          value={tipo}
          error={errores.tipo}
          disabled={guardando}
          onChange={(e) => {
            setTipo(e.target.value as TipoMovimientoInventario)
            limpiarError('tipo')
            limpiarError('cantidad')
          }}
        >
          <option value="ENTRADA">Entrada (Ingreso de existencias)</option>
          <option value="SALIDA">Salida (Egreso / Ajuste por merma)</option>
        </Select>

        <Input
          label="Cantidad"
          required
          type="text"
          inputMode="decimal"
          placeholder="Ej. 10 ó 15.5"
          value={cantidad}
          error={errores.cantidad}
          disabled={guardando}
          onChange={(e) => {
            setCantidad(e.target.value)
            limpiarError('cantidad')
          }}
        />

        {tipo === 'ENTRADA' && (
          <Input
            label="Costo unitario (Bs)"
            required
            type="text"
            inputMode="decimal"
            placeholder="Ej. 45.50"
            value={costoUnitario}
            error={errores.costoUnitario}
            disabled={guardando}
            onChange={(e) => {
              setCostoUnitario(e.target.value)
              limpiarError('costoUnitario')
            }}
          />
        )}

        <Textarea
          label="Motivo del ajuste"
          required
          rows={3}
          placeholder="Describa el motivo de la operación (ej. compra a proveedor, reposición, merma por rotura, devolución)..."
          value={motivo}
          error={errores.motivo}
          disabled={guardando}
          onChange={(e) => {
            setMotivo(e.target.value)
            limpiarError('motivo')
          }}
        />
      </form>
    </Modal>
  )
}
