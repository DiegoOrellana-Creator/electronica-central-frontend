import { useRef, useState } from 'react'
import {
  EyeIcon,
  FunnelXIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  PowerIcon,
  RulerIcon,
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
import { useToast } from '../hooks/useToast'
import { useUnidades } from '../hooks/useUnidades'
import type { UnidadMedida } from '../utils/tipos'
import { normalizeText } from '../utils/text'
import UnidadDetalleModal from './unidades/UnidadDetalleModal'
import UnidadFormModal from './unidades/UnidadFormModal'

const TAMANO_PAGINA = 10

type FiltroEstado = 'todos' | 'activo' | 'inactivo'

const esFiltroEstado = (valor: string): valor is FiltroEstado =>
  valor === 'todos' || valor === 'activo' || valor === 'inactivo'

type ModalUnidad = { tipo: 'crear' } | { tipo: 'editar' | 'detalle' | 'estado'; unidadId: string }

export default function UnidadesMedida() {
  const toast = useToast()
  const { unidades, productosPorUnidad, estado, recargar, crear, actualizar, cambiarEstado } = useUnidades()

  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todos')
  const [pagina, setPagina] = useState(1)
  const [modal, setModal] = useState<ModalUnidad | null>(null)
  const resultadosRef = useRef<HTMLDivElement>(null)

  // Todo cambio de busqueda o filtro vuelve a la primera pagina.
  const filtrar = (aplicar: () => void) => {
    aplicar()
    setPagina(1)
  }

  const cerrar = () => setModal(null)

  const texto = normalizeText(busqueda.trim())
  const filtrosActivos = texto !== '' || estadoFiltro !== 'todos'

  const filtradas = unidades.filter((unidad) => {
    if (estadoFiltro !== 'todos' && unidad.estado !== estadoFiltro) return false
    if (texto) {
      if (![unidad.nombre, unidad.abreviatura].some((campo) => normalizeText(campo).includes(texto))) return false
    }
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * TAMANO_PAGINA, paginaActual * TAMANO_PAGINA)

  const limpiarFiltros = () => {
    setBusqueda('')
    setEstadoFiltro('todos')
    setPagina(1)
  }

  const cambiarPagina = (nueva: number) => {
    setPagina(nueva)
    resultadosRef.current?.scrollIntoView({ block: 'start' })
  }

  const columnas: Column<UnidadMedida>[] = [
    { key: 'nombre', header: 'Nombre', primary: true, className: 'break-words', cell: (unidad) => unidad.nombre },
    { key: 'abreviatura', header: 'Abreviatura', className: 'break-words', cell: (unidad) => unidad.abreviatura },
    {
      key: 'estado',
      header: 'Estado',
      cell: (unidad) => (
        <Badge variant={unidad.estado === 'activo' ? 'success' : 'neutral'}>
          {unidad.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      actions: true,
      cell: (unidad) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Ver detalle de ${unidad.nombre}`}
            icon={EyeIcon}
            onClick={() => setModal({ tipo: 'detalle', unidadId: unidad.id })}
          />
          <IconButton
            label={`Editar ${unidad.nombre}`}
            icon={PencilSimpleIcon}
            onClick={() => setModal({ tipo: 'editar', unidadId: unidad.id })}
          />
          <ActionMenu
            label={`Más acciones para ${unidad.nombre}`}
            items={[
              {
                label: unidad.estado === 'activo' ? 'Desactivar unidad' : 'Activar unidad',
                icon: PowerIcon,
                onSelect: () => setModal({ tipo: 'estado', unidadId: unidad.id }),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const seleccionada = modal && modal.tipo !== 'crear' ? unidades.find((unidad) => unidad.id === modal.unidadId) : undefined

  const renderModal = () => {
    if (!modal) return null
    if (modal.tipo === 'crear') {
      return (
        <UnidadFormModal
          onClose={cerrar}
          onSubmit={async (datos) => {
            await crear(datos)
            toast.success('Unidad de medida creada correctamente.')
            cerrar()
          }}
        />
      )
    }
    if (!seleccionada) return null

    switch (modal.tipo) {
      case 'editar':
        return (
          <UnidadFormModal
            unidad={seleccionada}
            onClose={cerrar}
            onSubmit={async (datos) => {
              await actualizar(seleccionada.id, datos)
              toast.success('Unidad de medida actualizada correctamente.')
              cerrar()
            }}
          />
        )
      case 'detalle':
        return (
          <UnidadDetalleModal
            unidad={seleccionada}
            productosAsociados={productosPorUnidad.get(seleccionada.id) ?? 0}
            onEditar={() => setModal({ tipo: 'editar', unidadId: seleccionada.id })}
            onClose={cerrar}
          />
        )
      case 'estado': {
        const activando = seleccionada.estado === 'inactivo'
        const productos = productosPorUnidad.get(seleccionada.id) ?? 0
        const aviso =
          !activando && productos > 0
            ? ` Sus ${productos} ${productos === 1 ? 'producto seguirá' : 'productos seguirán'} vinculados a la unidad.`
            : ''
        return (
          <ConfirmDialog
            title={activando ? 'Activar unidad de medida' : 'Desactivar unidad de medida'}
            message={
              activando
                ? `¿Desea activar la unidad "${seleccionada.nombre}"? Pasará a estado Activo.`
                : `¿Desea desactivar la unidad "${seleccionada.nombre}"? Pasará a estado Inactivo y podrá activarla nuevamente cuando lo necesite.${aviso}`
            }
            confirmLabel={activando ? 'Activar' : 'Desactivar'}
            loadingLabel={activando ? 'Activando…' : 'Desactivando…'}
            variant={activando ? 'primary' : 'danger'}
            onCancel={cerrar}
            onConfirm={async () => {
              await cambiarEstado(seleccionada.id, activando ? 'activo' : 'inactivo')
              toast.success(
                activando ? 'Unidad de medida activada correctamente.' : 'Unidad de medida desactivada correctamente.',
              )
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
        <h2 className="text-xl font-semibold text-slate-900">Unidades de Medida</h2>
        <p className="mt-1 text-sm text-slate-600">
          Administre las unidades en las que se venden los productos de la tienda.
        </p>
      </header>

      {estado === 'cargando' ? (
        <LoadingState label="Cargando unidades de medida…">
          <div className="space-y-3">
            <Skeleton className="h-11 w-full sm:w-2/3" />
            <Skeleton className="h-11 w-full sm:w-1/2" />
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        </LoadingState>
      ) : estado === 'error' ? (
        <Alert
          variant="error"
          title="No se pudieron cargar las unidades de medida"
          action={
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          }
        >
          Ocurrió un problema al obtener las unidades de medida. Intente nuevamente.
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:flex-1">
              <SearchBar
                label="Buscar unidades por nombre o abreviatura"
                value={busqueda}
                onChange={(valor) => filtrar(() => setBusqueda(valor))}
                placeholder="Buscar por nombre o abreviatura…"
              />
            </div>
            <Button className="sm:shrink-0" onClick={() => setModal({ tipo: 'crear' })}>
              <PlusIcon size={18} aria-hidden="true" />
              Nueva unidad
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto] lg:items-end">
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
              {filtradas.length} {filtradas.length === 1 ? 'unidad' : 'unidades'}
            </p>
          </div>

          {filtradas.length > 0 ? (
            <>
              <Table
                caption="Unidades de medida"
                columns={columnas}
                rows={visibles}
                getRowKey={(unidad) => unidad.id}
              />
              <Pagination
                page={paginaActual}
                pageSize={TAMANO_PAGINA}
                totalItems={filtradas.length}
                onPageChange={cambiarPagina}
                label="Paginación de unidades de medida"
                itemsLabel="unidades"
              />
            </>
          ) : unidades.length === 0 ? (
            <EmptyState
              icon={RulerIcon}
              title="Aún no hay unidades de medida"
              description="Cree la primera unidad para poder asignarla a los productos."
              action={<Button onClick={() => setModal({ tipo: 'crear' })}>Nueva unidad</Button>}
            />
          ) : (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No se encontraron unidades"
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
