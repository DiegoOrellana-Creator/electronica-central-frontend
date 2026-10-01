import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { formatCurrency } from '../../utils/formatters'
import type { Categoria, Producto, UnidadMedida } from '../../utils/mockData'
import { rutaCategoria } from '../../utils/productos'

interface ProductoDetalleModalProps {
  producto: Producto
  categorias: readonly Categoria[]
  unidades: readonly UnidadMedida[]
  onClose: () => void
}

/** Detalle de solo lectura de un producto. */
export default function ProductoDetalleModal({ producto, categorias, unidades, onClose }: ProductoDetalleModalProps) {
  const categoria = categorias.find((c) => c.id === producto.categoriaId)
  const unidad = unidades.find((u) => u.id === producto.unidadId)

  return (
    <Modal
      title="Detalle del producto"
      size="lg"
      onClose={onClose}
      footer={
        <Button variant="secondary" data-autofocus onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-slate-600">Nombre</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{producto.nombre}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-slate-600">Descripción</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">
            {producto.descripcion || <span className="text-slate-600">Sin descripción.</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Precio</dt>
          <dd className="mt-1 text-sm text-slate-900">{formatCurrency(producto.precio)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Estado</dt>
          <dd className="mt-1">
            <Badge variant={producto.estado === 'activo' ? 'success' : 'neutral'}>
              {producto.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Categoría</dt>
          <dd className="mt-1 text-sm text-slate-900">{rutaCategoria(categoria, categorias)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Unidad de medida</dt>
          <dd className="mt-1 text-sm text-slate-900">
            {unidad ? `${unidad.nombre} (${unidad.abreviatura})` : 'Sin unidad'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Marca</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{producto.marca}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Modelo</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">
            {producto.modelo || <span className="text-slate-600">Sin modelo.</span>}
          </dd>
        </div>
      </dl>
    </Modal>
  )
}
