import { useMemo, useRef, useState } from 'react'
import {
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  FunnelXIcon,
  MagnifyingGlassIcon,
  PlusMinusIcon,
  WarehouseIcon,
} from '@phosphor-icons/react'
import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import IconButton from '../components/IconButton'
import LoadingState, { Skeleton } from '../components/LoadingState'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import Table from '../components/Table'
import type { Column } from '../components/Table'
import Tabs from '../components/Tabs'
import type { TabItem } from '../components/Tabs'
import { useInventario } from '../hooks/useInventario'
import type { VistaInventario } from '../hooks/useInventario'
import { useToast } from '../hooks/useToast'
import AjusteInventarioModal from './inventario/AjusteInventarioModal'
import MovimientosInventarioModal from './inventario/MovimientosInventarioModal'
import { tienePermiso } from '../services/sesion'
import { formatCurrency, formatNumber } from '../utils/formatters'
import type { ItemInventario, ResultadoAjusteInventario } from '../utils/tipos'

const TABS: readonly TabItem[] = [
  { id: 'todos', label: 'Todos los productos' },
  { id: 'alertas', label: 'Alertas de existencias' },
]

export default function Inventario() {
  const puedeVerCostos = tienePermiso('INVENTARIO_GESTIONAR')
  const toast = useToast()
  const [productoMovimientos, setProductoMovimientos] = useState<ItemInventario | null>(null)
  const [productoAjuste, setProductoAjuste] = useState<ItemInventario | null>(null)
  const {
    vista,
    cambiarVista,
    items,
    meta,
    estado,
    error,
    busqueda,
    setBusqueda,
    setPagina,
    recargar,
    limpiarBusqueda,
  } = useInventario()

  const handleAjusteExitoso = (resultado: ResultadoAjusteInventario, item: ItemInventario) => {
    setProductoAjuste(null)
    recargar()
    toast.success(
      `Ajuste de ${resultado.movimiento.tipo.toLowerCase()} registrado correctamente (${formatNumber(resultado.movimiento.cantidad)} u.).`,
    )
    // Permite al usuario consultar de inmediato el movimiento recién registrado
    setProductoMovimientos(item)
  }

  const resultadosRef = useRef<HTMLDivElement>(null)

  const cambiarPagina = (nuevaPagina: number) => {
    setPagina(nuevaPagina)
    resultadosRef.current?.scrollIntoView({ block: 'start' })
  }

  const columnas: Column<ItemInventario>[] = useMemo(() => {
    const cols: Column<ItemInventario>[] = [
      {
        key: 'producto',
        header: 'Producto',
        primary: true,
        className: 'break-words',
        cell: (item) => (
          <div>
            <div className="font-semibold text-slate-900">{item.nombre}</div>
            <div className="font-mono text-xs text-slate-500">{item.codigo}</div>
          </div>
        ),
      },
      {
        key: 'ubicacion',
        header: 'Ubicación física',
        className: 'break-words',
        cell: (item) => {
          const tieneDetalle = Boolean(item.ubicacion.pasillo || item.ubicacion.estante)
          if (tieneDetalle) {
            return `Pasillo ${item.ubicacion.pasillo || '—'}, Estante ${item.ubicacion.estante || '—'}`
          }
          return item.ubicacion.codigo || <span aria-label="Sin ubicación">—</span>
        },
      },
      {
        key: 'stockActual',
        header: 'Stock actual',
        className: 'whitespace-nowrap tabular-nums text-right',
        cell: (item) => (
          <span
            className={
              item.alerta === 'AGOTADO'
                ? 'font-bold text-red-700'
                : item.alerta === 'BAJO_MINIMO'
                  ? 'font-semibold text-amber-700'
                  : 'font-semibold text-slate-900'
            }
          >
            {formatNumber(item.stockActual)}
          </span>
        ),
      },
      {
        key: 'stockMinimo',
        header: 'Stock mínimo',
        className: 'whitespace-nowrap tabular-nums text-right',
        cell: (item) => (
          <span className="text-slate-600">{formatNumber(item.stockMinimo)}</span>
        ),
      },
    ]

    if (puedeVerCostos) {
      cols.push({
        key: 'costoPromedio',
        header: 'Costo promedio',
        className: 'whitespace-nowrap tabular-nums text-right',
        cell: (item) => (
          <span className="text-slate-700">
            {item.costoPromedio !== undefined ? formatCurrency(item.costoPromedio) : '—'}
          </span>
        ),
      })
    }

    cols.push(
      {
        key: 'alerta',
        header: 'Estado',
        cell: (item) => {
          if (item.alerta === 'AGOTADO') {
            return <Badge variant="error">Agotado</Badge>
          }
          if (item.alerta === 'BAJO_MINIMO') {
            return <Badge variant="warning">Bajo mínimo</Badge>
          }
          return <Badge variant="success">Normal</Badge>
        },
      },
      {
        key: 'acciones',
        header: 'Acciones',
        actions: true,
        className: 'whitespace-nowrap text-right',
        cell: (item) => (
          <div className="flex items-center justify-end gap-1">
            <IconButton
              label={`Ver movimientos de ${item.nombre}`}
              icon={ClockCounterClockwiseIcon}
              onClick={() => setProductoMovimientos(item)}
            />
            {puedeVerCostos && (
              <IconButton
                label={`Ajustar existencias de ${item.nombre}`}
                icon={PlusMinusIcon}
                onClick={() => setProductoAjuste(item)}
              />
            )}
          </div>
        ),
      },
    )

    return cols
  }, [puedeVerCostos])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Inventario</h2>
        <p className="mt-1 text-sm text-slate-600">
          {puedeVerCostos
            ? 'Consulte existencias, ubicaciones físicas, costos y niveles de alerta de los productos.'
            : 'Consulte existencias, ubicaciones físicas y niveles de alerta de los productos.'}
        </p>
      </header>

      <Tabs
        label="Vistas de inventario"
        idPrefix="inv"
        tabs={TABS}
        value={vista}
        onChange={(id) => cambiarVista(id as VistaInventario)}
      />

      {estado === 'cargando' ? (
        <LoadingState label="Cargando existencias de inventario…">
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
          title="No se pudo cargar el inventario"
          action={
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          }
        >
          {error ?? 'Ocurrió un problema al obtener las existencias. Intente nuevamente.'}
        </Alert>
      ) : (
        <div className="space-y-4">
          {vista === 'todos' && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="sm:flex-1">
                <SearchBar
                  label="Buscar por código o nombre de producto"
                  value={busqueda}
                  onChange={setBusqueda}
                  placeholder="Buscar por código o nombre de producto…"
                />
              </div>
              {busqueda.trim() !== '' && (
                <Button variant="secondary" onClick={limpiarBusqueda}>
                  <FunnelXIcon size={18} aria-hidden="true" />
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}

          <div ref={resultadosRef} className="scroll-mt-4">
            <p aria-live="polite" className="text-sm text-slate-600">
              {vista === 'alertas'
                ? `${meta.total} ${meta.total === 1 ? 'producto en alerta de stock' : 'productos en alerta de stock'}`
                : `${meta.total} ${meta.total === 1 ? 'producto encontrado' : 'productos encontrados'}`}
            </p>
          </div>

          {items.length > 0 ? (
            <>
              <Table
                caption={
                  vista === 'alertas'
                    ? 'Productos con alertas de stock (agotados o bajo mínimo)'
                    : 'Existencias de productos en inventario'
                }
                columns={columnas}
                rows={items}
                getRowKey={(item) => item.idProducto}
              />
              <Pagination
                page={meta.pagina}
                pageSize={meta.limite}
                totalItems={meta.total}
                onPageChange={cambiarPagina}
                label={
                  vista === 'alertas'
                    ? 'Paginación de alertas de inventario'
                    : 'Paginación de inventario'
                }
                itemsLabel="productos"
              />
            </>
          ) : vista === 'alertas' ? (
            <EmptyState
              icon={CheckCircleIcon}
              title="No hay alertas de stock"
              description="No hay productos que requieran atención por sus niveles de existencias."
            />
          ) : busqueda.trim() !== '' ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No se encontraron productos"
              description="No hay existencias que coincidan con el término de búsqueda ingresado."
              action={
                <Button variant="secondary" onClick={limpiarBusqueda}>
                  Limpiar búsqueda
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={WarehouseIcon}
              title="Aún no hay existencias registradas"
              description="Todavía no se han registrado productos con existencias en el inventario."
            />
          )}
        </div>
      )}

      {productoMovimientos && (
        <MovimientosInventarioModal
          item={productoMovimientos}
          onClose={() => setProductoMovimientos(null)}
        />
      )}

      {productoAjuste && (
        <AjusteInventarioModal
          item={productoAjuste}
          onSuccess={handleAjusteExitoso}
          onClose={() => setProductoAjuste(null)}
        />
      )}
    </div>
  )
}
