import { useMemo, useRef, useState } from 'react'
import {
  EyeIcon,
  FunnelXIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  PowerIcon,
  TagIcon,
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
import { useCategorias } from '../hooks/useCategorias'
import { useToast } from '../hooks/useToast'
import type { Categoria } from '../utils/tipos'
import { normalizeText } from '../utils/text'
import CategoriaDetalleModal from './categorias/CategoriaDetalleModal'
import CategoriaFormModal from './categorias/CategoriaFormModal'

const TAMANO_PAGINA = 10

type FiltroEstado = 'todos' | 'activo' | 'inactivo'

const esFiltroEstado = (valor: string): valor is FiltroEstado =>
  valor === 'todos' || valor === 'activo' || valor === 'inactivo'

/** Valor del filtro de categoria padre para las categorias principales. */
const SIN_PADRE = 'ninguno'

type ModalCategoria = { tipo: 'crear' } | { tipo: 'editar' | 'detalle' | 'estado'; categoriaId: string }

export default function Categorias() {
  const toast = useToast()
  const { categorias, productosPorCategoria, estado, recargar, crear, actualizar, cambiarEstado } = useCategorias()

  const [busqueda, setBusqueda] = useState('')
  const [padreFiltro, setPadreFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todos')
  const [pagina, setPagina] = useState(1)
  const [modal, setModal] = useState<ModalCategoria | null>(null)
  const resultadosRef = useRef<HTMLDivElement>(null)

  const categoriasPorId = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias])
  const principales = useMemo(() => categorias.filter((c) => c.categoriaPadreId === null), [categorias])

  // Cada categoria principal va seguida de sus subcategorias.
  const ordenadas = useMemo(() => {
    const clave = (c: Categoria) => (c.categoriaPadreId === null ? c : categoriasPorId.get(c.categoriaPadreId))?.nombre ?? ''
    return [...categorias].sort(
      (a, b) =>
        clave(a).localeCompare(clave(b), 'es') ||
        Number(a.categoriaPadreId !== null) - Number(b.categoriaPadreId !== null) ||
        a.nombre.localeCompare(b.nombre, 'es'),
    )
  }, [categorias, categoriasPorId])

  const nombrePadre = (categoria: Categoria) =>
    categoria.categoriaPadreId !== null ? categoriasPorId.get(categoria.categoriaPadreId)?.nombre : undefined

  // Todo cambio de busqueda o filtro vuelve a la primera pagina.
  const filtrar = (aplicar: () => void) => {
    aplicar()
    setPagina(1)
  }

  const cerrar = () => setModal(null)

  const texto = normalizeText(busqueda.trim())
  const filtrosActivos = texto !== '' || padreFiltro !== '' || estadoFiltro !== 'todos'

  const filtradas = ordenadas.filter((categoria) => {
    if (padreFiltro === SIN_PADRE && categoria.categoriaPadreId !== null) return false
    if (padreFiltro !== '' && padreFiltro !== SIN_PADRE && categoria.categoriaPadreId !== padreFiltro) {
      return false
    }
    if (estadoFiltro !== 'todos' && categoria.estado !== estadoFiltro) return false
    if (texto) {
      const campos = [categoria.nombre, categoria.descripcion, nombrePadre(categoria) ?? '']
      if (!campos.some((campo) => normalizeText(campo).includes(texto))) return false
    }
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * TAMANO_PAGINA, paginaActual * TAMANO_PAGINA)

  const limpiarFiltros = () => {
    setBusqueda('')
    setPadreFiltro('')
    setEstadoFiltro('todos')
    setPagina(1)
  }

  const cambiarPagina = (nueva: number) => {
    setPagina(nueva)
    resultadosRef.current?.scrollIntoView({ block: 'start' })
  }

  const columnas: Column<Categoria>[] = [
    { key: 'nombre', header: 'Nombre', primary: true, className: 'break-words', cell: (categoria) => categoria.nombre },
    {
      key: 'descripcion',
      header: 'Descripción',
      className: 'break-words',
      cell: (categoria) => categoria.descripcion || <span aria-label="Sin descripción">—</span>,
    },
    {
      key: 'padre',
      header: 'Categoría padre',
      className: 'break-words',
      cell: (categoria) => nombrePadre(categoria) ?? <span aria-label="Sin categoría padre">—</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (categoria) => (
        <Badge variant={categoria.estado === 'activo' ? 'success' : 'neutral'}>
          {categoria.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      actions: true,
      cell: (categoria) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Ver detalle de ${categoria.nombre}`}
            icon={EyeIcon}
            onClick={() => setModal({ tipo: 'detalle', categoriaId: categoria.id })}
          />
          <IconButton
            label={`Editar ${categoria.nombre}`}
            icon={PencilSimpleIcon}
            onClick={() => setModal({ tipo: 'editar', categoriaId: categoria.id })}
          />
          <ActionMenu
            label={`Más acciones para ${categoria.nombre}`}
            items={[
              {
                label: categoria.estado === 'activo' ? 'Desactivar categoría' : 'Activar categoría',
                icon: PowerIcon,
                onSelect: () => setModal({ tipo: 'estado', categoriaId: categoria.id }),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const seleccionada =
    modal && modal.tipo !== 'crear' ? categorias.find((categoria) => categoria.id === modal.categoriaId) : undefined

  const renderModal = () => {
    if (!modal) return null
    if (modal.tipo === 'crear') {
      return (
        <CategoriaFormModal
          categorias={categorias}
          onClose={cerrar}
          onSubmit={async (datos) => {
            await crear(datos)
            toast.success('Categoría creada correctamente.')
            cerrar()
          }}
        />
      )
    }
    if (!seleccionada) return null

    switch (modal.tipo) {
      case 'editar':
        return (
          <CategoriaFormModal
            categoria={seleccionada}
            categorias={categorias}
            onClose={cerrar}
            onSubmit={async (datos) => {
              await actualizar(seleccionada.id, datos)
              toast.success('Categoría actualizada correctamente.')
              cerrar()
            }}
          />
        )
      case 'detalle': {
        const subcategorias = categorias.filter((c) => c.categoriaPadreId === seleccionada.id)
        const productosAsociados = [seleccionada, ...subcategorias].reduce(
          (total, c) => total + (productosPorCategoria.get(c.id) ?? 0),
          0,
        )
        return (
          <CategoriaDetalleModal
            categoria={seleccionada}
            padre={seleccionada.categoriaPadreId !== null ? categoriasPorId.get(seleccionada.categoriaPadreId) : undefined}
            subcategorias={subcategorias}
            productosAsociados={productosAsociados}
            onEditar={() => setModal({ tipo: 'editar', categoriaId: seleccionada.id })}
            onClose={cerrar}
          />
        )
      }
      case 'estado': {
        const activando = seleccionada.estado === 'inactivo'
        const productos = productosPorCategoria.get(seleccionada.id) ?? 0
        const aviso =
          !activando && productos > 0
            ? ` Sus ${productos} ${productos === 1 ? 'producto asociado seguirá' : 'productos asociados seguirán'} vinculados a la categoría.`
            : ''
        return (
          <ConfirmDialog
            title={activando ? 'Activar categoría' : 'Desactivar categoría'}
            message={
              activando
                ? `¿Desea activar la categoría "${seleccionada.nombre}"? Pasará a estado Activo.`
                : `¿Desea desactivar la categoría "${seleccionada.nombre}"? Pasará a estado Inactivo y podrá activarla nuevamente cuando lo necesite.${aviso}`
            }
            confirmLabel={activando ? 'Activar' : 'Desactivar'}
            loadingLabel={activando ? 'Activando…' : 'Desactivando…'}
            variant={activando ? 'primary' : 'danger'}
            onCancel={cerrar}
            onConfirm={async () => {
              await cambiarEstado(seleccionada.id, activando ? 'activo' : 'inactivo')
              toast.success(activando ? 'Categoría activada correctamente.' : 'Categoría desactivada correctamente.')
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
        <h2 className="text-xl font-semibold text-slate-900">Categorías</h2>
        <p className="mt-1 text-sm text-slate-600">
          Administre las categorías y subcategorías que organizan los productos de la tienda.
        </p>
      </header>

      {estado === 'cargando' ? (
        <LoadingState label="Cargando categorías…">
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
          title="No se pudieron cargar las categorías"
          action={
            <Button variant="secondary" onClick={recargar}>
              Reintentar
            </Button>
          }
        >
          Ocurrió un problema al obtener las categorías. Intente nuevamente.
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:flex-1">
              <SearchBar
                label="Buscar categorías por nombre, descripción o categoría padre"
                value={busqueda}
                onChange={(valor) => filtrar(() => setBusqueda(valor))}
                placeholder="Buscar por nombre, descripción o padre…"
              />
            </div>
            <Button className="sm:shrink-0" onClick={() => setModal({ tipo: 'crear' })}>
              <PlusIcon size={18} aria-hidden="true" />
              Nueva categoría
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <Select
              label="Categoría padre"
              name="categoriaPadre"
              value={padreFiltro}
              onChange={(event) => filtrar(() => setPadreFiltro(event.target.value))}
            >
              <option value="">Todas</option>
              <option value={SIN_PADRE}>Sin categoría padre</option>
              {principales.map((principal) => (
                <option key={principal.id} value={principal.id}>
                  {principal.nombre}
                </option>
              ))}
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
              {filtradas.length} {filtradas.length === 1 ? 'categoría' : 'categorías'}
            </p>
          </div>

          {filtradas.length > 0 ? (
            <>
              <Table
                caption="Categorías de productos"
                columns={columnas}
                rows={visibles}
                getRowKey={(categoria) => categoria.id}
              />
              <Pagination
                page={paginaActual}
                pageSize={TAMANO_PAGINA}
                totalItems={filtradas.length}
                onPageChange={cambiarPagina}
                label="Paginación de categorías"
                itemsLabel="categorías"
              />
            </>
          ) : categorias.length === 0 ? (
            <EmptyState
              icon={TagIcon}
              title="Aún no hay categorías"
              description="Cree la primera categoría para organizar los productos."
              action={<Button onClick={() => setModal({ tipo: 'crear' })}>Nueva categoría</Button>}
            />
          ) : (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No se encontraron categorías"
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
