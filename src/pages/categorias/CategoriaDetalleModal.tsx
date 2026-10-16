import { PencilSimpleIcon } from '@phosphor-icons/react'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import type { Categoria } from '../../utils/tipos'

interface CategoriaDetalleModalProps {
  categoria: Categoria
  /** Categoria padre, si la categoria es una subcategoria. */
  padre?: Categoria
  subcategorias: readonly Categoria[]
  /** Productos asociados a la categoria (y a sus subcategorias, si es principal). */
  productosAsociados: number
  /** Si no se indica (usuario sin permiso para modificar), el boton Editar no se muestra. */
  onEditar?: () => void
  onClose: () => void
}

/** Detalle de solo lectura de una categoria. */
export default function CategoriaDetalleModal({
  categoria,
  padre,
  subcategorias,
  productosAsociados,
  onEditar,
  onClose,
}: CategoriaDetalleModalProps) {
  return (
    <Modal
      title="Detalle de la categoría"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" data-autofocus onClick={onClose}>
            Cerrar
          </Button>
          {onEditar && (
            <Button onClick={onEditar}>
              <PencilSimpleIcon size={18} aria-hidden="true" />
              Editar categoría
            </Button>
          )}
        </>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-slate-600">Nombre</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{categoria.nombre}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-slate-600">Descripción</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">
            {categoria.descripcion || <span className="text-slate-600">Sin descripción.</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Categoría padre</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">
            {padre ? padre.nombre : <span className="text-slate-600">Sin categoría padre.</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Estado</dt>
          <dd className="mt-1">
            <Badge variant={categoria.estado === 'activo' ? 'success' : 'neutral'}>
              {categoria.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Tipo</dt>
          <dd className="mt-1 text-sm text-slate-900">{padre ? 'Subcategoría' : 'Categoría principal'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Productos asociados</dt>
          <dd className="mt-1 text-sm text-slate-900">{productosAsociados}</dd>
        </div>
        {!padre && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold text-slate-600">Subcategorías</dt>
            <dd className="mt-1 break-words text-sm text-slate-900">
              {subcategorias.length > 0 ? (
                subcategorias.map((sub) => sub.nombre).join(', ')
              ) : (
                <span className="text-slate-600">No tiene subcategorías.</span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </Modal>
  )
}