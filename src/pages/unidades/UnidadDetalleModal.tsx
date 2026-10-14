import { PencilSimpleIcon } from '@phosphor-icons/react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import type { UnidadMedida } from '../../utils/tipos'

interface UnidadDetalleModalProps {
  unidad: UnidadMedida
  /** Productos que utilizan la unidad. */
  productosAsociados: number
  onEditar: () => void
  onClose: () => void
}

/** Detalle de solo lectura de una unidad de medida. */
export default function UnidadDetalleModal({ unidad, productosAsociados, onEditar, onClose }: UnidadDetalleModalProps) {
  return (
    <Modal
      title="Detalle de la unidad de medida"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" data-autofocus onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={onEditar}>
            <PencilSimpleIcon size={18} aria-hidden="true" />
            Editar unidad
          </Button>
        </>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-slate-600">Nombre</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{unidad.nombre}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Abreviatura</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{unidad.abreviatura}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Estado</dt>
          <dd className="mt-1">
            <Badge variant={unidad.estado === 'activo' ? 'success' : 'neutral'}>
              {unidad.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Productos que la usan</dt>
          <dd className="mt-1 text-sm text-slate-900">{productosAsociados}</dd>
        </div>
      </dl>
    </Modal>
  )
}
