import { useMemo, useRef, useState } from 'react'
import {
  EyeIcon,
  FunnelXIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  PencilSimpleIcon,
  PlusIcon,
  PowerIcon,
} from '@phosphor-icons/react'
import ActionMenu from '../components/ActionMenu'
import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import IconButton from '../components/IconButton'
import LoadingState, { Skeleton } from '../components/LoadingState'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import Select from '../components/Select'
import Table from '../components/Table'
import type { Column } from '../components/Table'
import { useProductos } from '../hooks/useProductos'
import { useToast } from '../hooks/useToast'
import { tienePermiso } from '../services/sesion'
import { formatCurrency } from '../utils/formatters'
import type { Producto } from '../utils/tipos'
import { normalizeText } from '../utils/text'
import CategoriaOptions from './productos/CategoriaOptions'
import ProductoDetalleModal from './productos/ProductoDetalleModal'
import ProductoFormModal from './productos/ProductoFormModal'

const TAMANO_PAGINA = 10

type FiltroEstado = 'todos' | 'activo' | 'inactivo'

const esFiltroEstado = (valor: string): valor is FiltroEstado =>
  valor === 'todos' || valor === 'activo' || valor === 'inactivo'

type ModalProducto = { tipo: 'crear' } | { tipo: 'editar' | 'detalle' | 'estado'; productoId: string }

export default function Productos() {
  const toast = useToast()
  const { productos, categorias, unidades, estado, recargar, crear, actualizar, cambiarEstado } = useProductos()
  // Solo el administrador crea, edita o cambia el estado de los productos.
  const puedeModificar = tienePermiso('CATALOGO_GESTIONAR')

  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todos')
  const [pagina, setPagina] = useState(1)
  const [modal, setModal] = useState<ModalProducto | null>(null)
  const resultadosRef = useRef<HTMLDivElement>(null)

  const categoriasPorId = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias])
  const unidadesPorId = useMemo(() => new Map(unidades.map((u) => [u.id, u])), [unidades])

  // Todo cambio de busqueda o filtro vuelve a la primera pagina.
  const filtrar = (aplicar: () => void) => {
    aplicar()
    setPagina(1)
  }

  const cerrar = () => setModal(null)

  const texto = normalizeText(busqueda.trim())
  const filtrosActivos = texto !== '' || categoriaFiltro !== '' || estadoFiltro !== 'todos'

  const filtrados = productos.filter((producto) => {
    if (categoriaFiltro && producto.categoriaId !== categoriaFiltro) return false
    if (estadoFiltro !== 'todos' && producto.estado !== estadoFiltro) return false
    if (texto) {
      const categoria = categoriasPorId.get(producto.categoriaId)
      const padre = categoria?.categoriaPadreId != null ? categoriasPorId.get(categoria.categoriaPadreId) : undefined
      const campos = [
        producto.nombre,
        producto.descripcion,
        categoria?.nombre ?? '',
        padre?.nombre ?? '',
        producto.marca,
        producto.modelo,
      ]
      if (!campos.some((campo) => normalizeText(campo).includes(texto))) return false
    }
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice((paginaActual - 1) * TAMANO_PAGINA, paginaActual * TAMANO_PAGINA)

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriaFiltro('')
    setEstadoFiltro('todos')
    setPagina(1)
  }

  const cambiarPagina = (nueva: number) => {
    setPagina(nueva)
    resultadosRef.current?.scrollIntoView({ block: 'start' })
  }

  const columnas: Column<Producto>[] = [
    { key: 'nombre', header: 'Producto', primary: true, className: 'break-words', cell: (producto) => producto.nombre },
    {
      key: 'categoria',
      header: 'Categoría',
      cell: (producto) => categoriasPorId.get(producto.categoriaId)?.nombre ?? 'Sin categoría',
    },
    { key: 'marca', header: 'Marca', className: 'break-words', cell: (producto) => producto.marca },
    {
      key: 'modelo',
      header: 'Modelo',
      className: 'break-words',
      cell: (producto) => producto.modelo || <span aria-label="Sin modelo">—</span>,
    },
    {
      key: 'unidad',
      header: 'Unidad',
      cell: (producto) => unidadesPorId.get(producto.unidadId)?.nombre ?? 'Sin unidad',
    },
    {
      key: 'precio',
      header: 'Precio',
      className: 'whitespace-nowrap tabular-nums',
      cell: (producto) => formatCurrency(producto.precio),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (producto) => (
        <Badge variant={producto.estado === 'activo' ? 'success' : 'neutral'}>
          {producto.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      actions: true,
      cell: (producto) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Ver detalle de ${producto.nombre}`}
            icon={EyeIcon}
            onClick={() => setModal({ tipo: 'detalle', productoId: producto.id })}
          />
          {puedeModificar && (
            <>
              <IconButton
                label={`Editar ${producto.nombre}`}
                icon={PencilSimpleIcon}
                onClick={() => setModal({ tipo: 'editar', productoId: producto.id })}
              />
              <ActionMenu
                label={`Más acciones para ${producto.nombre}`}
                items={[
                  {
                    label: producto.estado === 'activo' ? 'Desactivar producto' : 'Activar producto',
                    icon: PowerIcon,
                    onSelect: () => setModal({ tipo: 'estado', productoId: producto.id }),
                  },
                ]}
              />
            </>
          )}
        </div>
      ),
    },
  ]

  const seleccionado =
    modal && modal.tipo !== 'crear' ? productos.find((producto) => producto.id === modal.productoId) : undefined

  const renderModal = () => {
    if (!modal) return null
    if (modal.tipo === 'crear') {
      return (
        <ProductoFormModal
          categorias={categorias}
          unidades={unidades}
          onClose={cerrar}
          onSubmit={async (datos) => {
            await crear(datos)
            toast.success('Producto creado correctamente.')
            cerrar()
          }}
        />
      )
    }
    if (!seleccionado) return null

    switch (modal.tipo) {
      case 'editar':
        return (
          <ProductoFormModal
            producto={seleccionado}
            categorias={categorias}
            unidades={unidades}
            onClose={cerrar}
            onSubmit={async (datos) => {
              await actualizar(seleccionado.id, datos)
              toast.success('Producto actualizado correctamente.')
              cerrar()
            }}
          />
        )
      case 'detalle':
        return (
          <ProductoDetalleModal producto={seleccionado} categorias={categorias} unidades={unidades} onClose={cerrar} />
        )
      case 'estado': {
        const activando = seleccionado.estado === 'inactivo'
        return (
          <ConfirmDialog
            title={activando ? 'Activar producto' : 'Desactivar producto'}
            message={
              activando
                ? `¿Desea activar el producto ${seleccionado.nombre}? Pasará a estado Activo.`
                : `¿Desea desactivar el producto ${seleccionado.nombre}? Pasará a estado Inactivo y podrá activarlo nuevamente cuando lo necesite.`
            }
            confirmLabel={activando ? 'Activar' : 'Desactivar'}
            loadingLabel={activando ? 'Activando…' : 'Desactivando…'}
            variant={activando ? 'primary' : 'danger'}
            onCancel={cerrar}
            onConfirm={async () => {
              await cambiarEstado(seleccionado.id, activando ? 'activo' : 'inactivo')
              toast.success(activando ? 'Producto activado correctamente.' : 'Producto desactivado correctamente.')
              cerrar()
            }}
          />
        )
      }
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Productos</h2>
        <p className="mt-1 text-sm text-slate-600">
          {puedeModificar
            ? 'Consulte y gestione el catálogo de productos electrónicos de la tienda.'
            : 'Consulte el catálogo de productos electrónicos de la tienda.'}
        </p>
      </header>

      {estado === 'cargando' ? (
        <LoadingState label="Cargando productos…">
          <div className="space-y-3">
            <Skeleton className="h-11 w-full sm:w-2/3" />
            <Skeleton className="h-11 w-full sm:w-1/2" />
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        </LoadingState>
      ) : estado === 'error' ? (
        <Alert
          variant="error"
          title="No se pudo cargar el catálogo"
          action={
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          }
        >
          Ocurrió un problema al obtener los productos. Intente nuevamente.
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:flex-1">
              <SearchBar
                label="Buscar productos por nombre, descripción, categoría, marca o modelo"
                value={busqueda}
                onChange={(valor) => filtrar(() => setBusqueda(valor))}
                placeholder="Buscar por nombre, marca, modelo…"
              />
            </div>
            {puedeModificar && (
              <Button className="sm:shrink-0" onClick={() => setModal({ tipo: 'crear' })}>
                <PlusIcon size={18} aria-hidden="true" />
                Nuevo producto
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <Select
              label="Categoría"
              name="categoria"
              value={categoriaFiltro}
              onChange={(event) => filtrar(() => setCategoriaFiltro(event.target.value))}
            >
              <option value="">Todas</option>
              <CategoriaOptions categorias={categorias} />
            </Select>
            <Select
              label="Estado"
              name="estado"
              value={estadoFiltro}
              onChange={(event) => {
                const valor = event.target.value
                if (esFiltroEstado(valor)) filtrar(() => setEstadoFiltro(valor))
              }}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Select>
            <Button variant="secondary" disabled={!filtrosActivos} onClick={limpiarFiltros}>
              <FunnelXIcon size={18} aria-hidden="true" />
              Limpiar filtros
            </Button>
          </div>

          <div ref={resultadosRef} className="scroll-mt-4">
            <p aria-live="polite" className="text-sm text-slate-600">
              {filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          {filtrados.length > 0 ? (
            <>
              <Table
                caption="Productos del catálogo"
                columns={columnas}
                rows={visibles}
                getRowKey={(producto) => producto.id}
              />
              <Pagination
                page={paginaActual}
                pageSize={TAMANO_PAGINA}
                totalItems={filtrados.length}
                onPageChange={cambiarPagina}
                label="Paginación de productos"
                itemsLabel="productos"
              />
            </>
          ) : productos.length === 0 ? (
            <EmptyState
              icon={PackageIcon}
              title="Aún no hay productos"
              description={
                puedeModificar
                  ? 'Cree el primer producto para comenzar el catálogo.'
                  : 'Todavía no se han registrado productos en el catálogo.'
              }
              action={
                puedeModificar ? <Button onClick={() => setModal({ tipo: 'crear' })}>Nuevo producto</Button> : undefined
              }
            />
          ) : (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No se encontraron productos"
              description="Pruebe con otro término de búsqueda o cambie los filtros."
              action={
                <Button variant="secondary" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              }
            />
          )}

          {renderModal()}
        </div>
      )}
    </div>
  )
}