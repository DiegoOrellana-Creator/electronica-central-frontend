import { useCallback, useEffect, useMemo, useState } from 'react'
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react'
import Alert from '../../components/Alert'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import LoadingState, { Skeleton } from '../../components/LoadingState'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import Table from '../../components/Table'
import type { Column } from '../../components/Table'
import type { EstadoCarga } from '../../hooks/estadoCarga'
import { listarMovimientosProducto } from '../../services/inventarioService'
import { tienePermiso } from '../../services/sesion'
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/formatters'
import type { ItemInventario, MetaPaginacion, MovimientoInventario } from '../../utils/tipos'

const LIMITE_POR_DEFECTO = 20

interface MovimientosInventarioModalProps {
  item: ItemInventario
  onClose: () => void
}

/** Modal accesible para consultar el historial de movimientos de inventario de un producto. */
export default function MovimientosInventarioModal({ item, onClose }: MovimientosInventarioModalProps) {
  const puedeVerCostos = tienePermiso('INVENTARIO_GESTIONAR')
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [meta, setMeta] = useState<MetaPaginacion>({ pagina: 1, limite: LIMITE_POR_DEFECTO, total: 0 })
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [error, setError] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      try {
        const respuesta = await listarMovimientosProducto(item.idProducto, {
          pagina,
          limite: LIMITE_POR_DEFECTO,
          ordenDescendente: true,
        })

        if (!vigente) return

        setMovimientos(respuesta.data)
        setMeta(respuesta.meta)
        setError(null)
        setEstado('listo')
      } catch (err) {
        if (!vigente) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el historial de movimientos.')
        setEstado('error')
      }
    }

    cargar()

    return () => {
      vigente = false
    }
  }, [item.idProducto, pagina, intento])

  const cambiarPagina = (nuevaPagina: number) => {
    setEstado('cargando')
    setPagina(nuevaPagina)
  }

  const recargar = useCallback(() => {
    setEstado('cargando')
    setError(null)
    setIntento((n) => n + 1)
  }, [])

  const columnas: Column<MovimientoInventario>[] = useMemo(() => {
    const cols: Column<MovimientoInventario>[] = [
      {
        key: 'fechaHora',
        header: 'Fecha y hora',
        primary: true,
        className: 'whitespace-nowrap',
        cell: (mov) => (
          <time dateTime={mov.fechaHora} className="font-medium text-slate-900">
            {formatDateTime(mov.fechaHora)}
          </time>
        ),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        cell: (mov) => (
          <Badge variant={mov.tipo === 'ENTRADA' ? 'success' : 'neutral'}>
            {mov.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
          </Badge>
        ),
      },
      {
        key: 'cantidad',
        header: 'Cantidad',
        className: 'whitespace-nowrap tabular-nums text-right',
        cell: (mov) => (
          <span className="font-semibold text-slate-900">{formatNumber(mov.cantidad)}</span>
        ),
      },
    ]

    if (puedeVerCostos) {
      cols.push({
        key: 'costoUnitario',
        header: 'Costo unitario',
        className: 'whitespace-nowrap tabular-nums text-right',
        cell: (mov) => (
          <span className="text-slate-700">
            {mov.costoUnitario !== undefined ? formatCurrency(mov.costoUnitario) : '—'}
          </span>
        ),
      })
    }

    cols.push(
      {
        key: 'motivo',
        header: 'Motivo',
        className: 'break-words',
        cell: (mov) => <span className="text-slate-700">{mov.motivo}</span>,
      },
      {
        key: 'responsable',
        header: 'Responsable',
        className: 'whitespace-nowrap',
        cell: (mov) => <span className="text-slate-600">{mov.responsable}</span>,
      },
    )

    return cols
  }, [puedeVerCostos])

  return (
    <Modal
      title="Historial de movimientos"
      description={`Producto: ${item.nombre} (${item.codigo})`}
      size="lg"
      onClose={onClose}
      footer={
        <Button variant="secondary" data-autofocus onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {estado === 'cargando' ? (
        <LoadingState label="Cargando historial de movimientos…">
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        </LoadingState>
      ) : estado === 'error' ? (
        <Alert
          variant="error"
          title="No se pudo cargar el historial"
          action={
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          }
        >
          {error ?? 'Ocurrió un problema al obtener los movimientos del producto. Intente nuevamente.'}
        </Alert>
      ) : movimientos.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table
              caption={`Movimientos de inventario para ${item.nombre}`}
              columns={columnas}
              rows={movimientos}
              getRowKey={(mov) => mov.idMovimiento}
            />
          </div>
          {meta.total > meta.limite && (
            <Pagination
              page={meta.pagina}
              pageSize={meta.limite}
              totalItems={meta.total}
              onPageChange={cambiarPagina}
              label="Paginación de movimientos de inventario"
              itemsLabel="movimientos"
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={ClockCounterClockwiseIcon}
          title="Sin movimientos registrados"
          description="Este producto aún no cuenta con movimientos de entrada o salida de inventario."
        />
      )}
    </Modal>
  )
}
