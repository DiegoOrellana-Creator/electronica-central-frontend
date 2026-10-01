import { useState } from 'react'
import { EyeIcon, PencilSimpleIcon, PlusIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import IconButton from '../../components/IconButton'
import SearchBar from '../../components/SearchBar'
import Table from '../../components/Table'
import type { Column } from '../../components/Table'
import { useToast } from '../../hooks/useToast'
import type { useRoles } from '../../hooks/useRoles'
import type { Permiso, Rol, Usuario } from '../../utils/mockData'
import { normalizeText } from '../../utils/text'
import RolDetalleModal from './RolDetalleModal'
import RolFormModal from './RolFormModal'

type Operaciones = Pick<ReturnType<typeof useRoles>, 'crear' | 'actualizar'>

interface RolesTabProps {
  roles: readonly Rol[]
  permisos: readonly Permiso[]
  usuarios: readonly Usuario[]
  operaciones: Operaciones
}

type ModalRol = { tipo: 'crear' } | { tipo: 'editar' | 'detalle'; rolId: number }

export default function RolesTab({ roles, permisos, usuarios, operaciones }: RolesTabProps) {
  const toast = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState<ModalRol | null>(null)

  const cerrar = () => setModal(null)

  const texto = normalizeText(busqueda.trim())
  const visibles = roles.filter(
    (rol) => !texto || normalizeText(rol.nombre).includes(texto) || normalizeText(rol.descripcion).includes(texto),
  )

  const columnas: Column<Rol>[] = [
    { key: 'nombre', header: 'Nombre', primary: true, cell: (rol) => rol.nombre },
    { key: 'descripcion', header: 'Descripción', cell: (rol) => rol.descripcion },
    {
      key: 'permisos',
      header: 'Permisos',
      cell: (rol) => `${rol.permisosIds.length} ${rol.permisosIds.length === 1 ? 'permiso' : 'permisos'}`,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      actions: true,
      cell: (rol) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Ver detalle del rol ${rol.nombre}`}
            icon={EyeIcon}
            onClick={() => setModal({ tipo: 'detalle', rolId: rol.id })}
          />
          <IconButton
            label={`Editar el rol ${rol.nombre}`}
            icon={PencilSimpleIcon}
            onClick={() => setModal({ tipo: 'editar', rolId: rol.id })}
          />
        </div>
      ),
    },
  ]

  const seleccionado = modal && modal.tipo !== 'crear' ? roles.find((rol) => rol.id === modal.rolId) : undefined

  const renderModal = () => {
    if (!modal) return null
    if (modal.tipo === 'crear') {
      return (
        <RolFormModal
          permisos={permisos}
          onClose={cerrar}
          onSubmit={async (datos) => {
            await operaciones.crear(datos)
            toast.success('Rol creado correctamente.')
            cerrar()
          }}
        />
      )
    }
    if (!seleccionado) return null
    if (modal.tipo === 'editar') {
      return (
        <RolFormModal
          rol={seleccionado}
          permisos={permisos}
          onClose={cerrar}
          onSubmit={async (datos) => {
            await operaciones.actualizar(seleccionado.id, datos)
            toast.success('Rol actualizado correctamente.')
            cerrar()
          }}
        />
      )
    }
    return (
      <RolDetalleModal
        rol={seleccionado}
        permisos={permisos}
        usuarios={usuarios.filter((usuario) => usuario.rolesIds.includes(seleccionado.id))}
        onClose={cerrar}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:flex-1">
          <SearchBar
            label="Buscar roles por nombre o descripción"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre o descripción…"
          />
        </div>
        <Button className="sm:shrink-0" onClick={() => setModal({ tipo: 'crear' })}>
          <PlusIcon size={18} aria-hidden="true" />
          Nuevo rol
        </Button>
      </div>

      <p aria-live="polite" className="text-sm text-slate-600">
        {visibles.length} {visibles.length === 1 ? 'rol' : 'roles'}
      </p>

      {visibles.length > 0 ? (
        <Table caption="Roles del sistema" columns={columnas} rows={visibles} getRowKey={(rol) => rol.id} />
      ) : roles.length === 0 ? (
        <EmptyState
          icon={ShieldCheckIcon}
          title="Aún no hay roles"
          description="Cree el primer rol para asignarlo a los usuarios."
          action={<Button onClick={() => setModal({ tipo: 'crear' })}>Nuevo rol</Button>}
        />
      ) : (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No se encontraron roles"
          description="Pruebe con otro término de búsqueda."
          action={
            <Button variant="secondary" onClick={() => setBusqueda('')}>
              Limpiar búsqueda
            </Button>
          }
        />
      )}

      {renderModal()}
    </div>
  )
}
