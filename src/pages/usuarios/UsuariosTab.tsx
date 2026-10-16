import { useState } from 'react'
import {
  EyeIcon,
  PencilSimpleIcon,
  PlusIcon,
  PowerIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import ActionMenu from '../../components/ActionMenu'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import IconButton from '../../components/IconButton'
import SearchBar from '../../components/SearchBar'
import Select from '../../components/Select'
import Table from '../../components/Table'
import type { Column } from '../../components/Table'
import { useToast } from '../../hooks/useToast'
import type { useUsuarios } from '../../hooks/useUsuarios'
import { tienePermiso } from '../../services/sesion'
import type { Permiso, Rol, Usuario } from '../../utils/tipos'
import { normalizeText } from '../../utils/text'
import AsignarRolModal from './AsignarRolModal'
import RevocarRolModal from './RevocarRolModal'
import UsuarioDetalleModal from './UsuarioDetalleModal'
import UsuarioFormModal from './UsuarioFormModal'

type Operaciones = Pick<
  ReturnType<typeof useUsuarios>,
  'crear' | 'actualizar' | 'cambiarEstado' | 'asignarRol' | 'revocarRol'
>

interface UsuariosTabProps {
  usuarios: readonly Usuario[]
  roles: readonly Rol[]
  permisos: readonly Permiso[]
  operaciones: Operaciones
}

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

const esFiltro = (valor: string): valor is FiltroEstado =>
  valor === 'todos' || valor === 'activos' || valor === 'inactivos'

/** Roles que un empleado (sin USUARIOS_GESTIONAR) puede asignar al crear un usuario. */
const ROLES_DEL_EMPLEADO = ['VENDEDOR', 'CLIENTE']

type ModalUsuario =
  | { tipo: 'crear' }
  | { tipo: 'editar' | 'detalle' | 'asignar' | 'revocar' | 'estado'; usuarioId: string }
  | { tipo: 'confirmarRevocar'; usuarioId: string; rolId: string }

export default function UsuariosTab({ usuarios, roles, permisos, operaciones }: UsuariosTabProps) {
  const toast = useToast()
  // Solo el administrador edita usuarios, cambia su estado o gestiona sus roles.
  // El empleado puede ver la lista y crear usuarios nuevos.
  const puedeGestionar = tienePermiso('USUARIOS_GESTIONAR')
  const rolesAsignables = puedeGestionar ? roles : roles.filter((rol) => ROLES_DEL_EMPLEADO.includes(rol.nombre))

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [modal, setModal] = useState<ModalUsuario | null>(null)

  const cerrar = () => setModal(null)

  const texto = normalizeText(busqueda.trim())
  const visibles = usuarios.filter((usuario) => {
    const coincideEstado =
      filtro === 'todos' || (filtro === 'activos' ? usuario.estado === 'activo' : usuario.estado === 'inactivo')
    const coincideTexto =
      !texto || normalizeText(usuario.nombre).includes(texto) || normalizeText(usuario.correo).includes(texto)
    return coincideEstado && coincideTexto
  })

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltro('todos')
  }

  const columnas: Column<Usuario>[] = [
    { key: 'nombre', header: 'Nombre', primary: true, cell: (usuario) => usuario.nombre },
    {
      key: 'correo',
      header: 'Correo electrónico',
      className: 'break-words',
      cell: (usuario) => usuario.correo,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (usuario) => (
        <Badge variant={usuario.estado === 'activo' ? 'success' : 'neutral'}>
          {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (usuario) => {
        const asignados = roles.filter((rol) => usuario.rolesIds.includes(rol.id))
        if (asignados.length === 0) return <span className="text-slate-600">Sin roles asignados</span>
        return (
          <span className="flex flex-wrap gap-1.5 sm:justify-end lg:justify-start">
            {asignados.map((rol) => (
              <Badge key={rol.id} icon={false}>
                {rol.nombre}
              </Badge>
            ))}
          </span>
        )
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      actions: true,
      cell: (usuario) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Ver detalle de ${usuario.nombre}`}
            icon={EyeIcon}
            onClick={() => setModal({ tipo: 'detalle', usuarioId: usuario.id })}
          />
          {puedeGestionar && (
            <>
              <IconButton
                label={`Editar ${usuario.nombre}`}
                icon={PencilSimpleIcon}
                onClick={() => setModal({ tipo: 'editar', usuarioId: usuario.id })}
              />
              <ActionMenu
                label={`Más acciones para ${usuario.nombre}`}
                items={[
                  {
                    label: 'Asignar rol',
                    icon: UserPlusIcon,
                    disabled: usuario.rolesIds.length >= roles.length,
                    onSelect: () => setModal({ tipo: 'asignar', usuarioId: usuario.id }),
                  },
                  {
                    label: 'Revocar rol',
                    icon: UserMinusIcon,
                    disabled: usuario.rolesIds.length === 0,
                    onSelect: () => setModal({ tipo: 'revocar', usuarioId: usuario.id }),
                  },
                  {
                    label: usuario.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario',
                    icon: PowerIcon,
                    onSelect: () => setModal({ tipo: 'estado', usuarioId: usuario.id }),
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
    modal && modal.tipo !== 'crear' ? usuarios.find((usuario) => usuario.id === modal.usuarioId) : undefined

  const renderModal = () => {
    if (!modal) return null
    if (modal.tipo === 'crear') {
      return (
        <UsuarioFormModal
          roles={rolesAsignables}
          onClose={cerrar}
          onSubmit={async (datos) => {
            await operaciones.crear(datos)
            toast.success('Usuario creado correctamente.')
            cerrar()
          }}
        />
      )
    }
    if (!seleccionado) return null

    switch (modal.tipo) {
      case 'editar':
        return (
          <UsuarioFormModal
            usuario={seleccionado}
            roles={roles}
            onClose={cerrar}
            onSubmit={async (datos) => {
              await operaciones.actualizar(seleccionado.id, datos)
              toast.success('Usuario actualizado correctamente.')
              cerrar()
            }}
          />
        )
      case 'detalle':
        return <UsuarioDetalleModal usuario={seleccionado} roles={roles} permisos={permisos} onClose={cerrar} />
      case 'asignar':
        return (
          <AsignarRolModal
            usuario={seleccionado}
            roles={roles}
            onClose={cerrar}
            onSubmit={async (rolId) => {
              await operaciones.asignarRol(seleccionado.id, rolId)
              toast.success('Rol asignado correctamente.')
              cerrar()
            }}
          />
        )
      case 'revocar':
        return (
          <RevocarRolModal
            usuario={seleccionado}
            roles={roles}
            onClose={cerrar}
            onElegir={(rol) => setModal({ tipo: 'confirmarRevocar', usuarioId: seleccionado.id, rolId: rol.id })}
          />
        )
      case 'confirmarRevocar': {
        const rol = roles.find((r) => r.id === modal.rolId)
        if (!rol) return null
        return (
          <ConfirmDialog
            title="Revocar rol"
            message={`¿Desea revocar el rol ${rol.nombre} a ${seleccionado.nombre}? El usuario dejará de tener los permisos que otorga ese rol.`}
            confirmLabel="Revocar rol"
            loadingLabel="Revocando…"
            variant="danger"
            onCancel={cerrar}
            onConfirm={async () => {
              await operaciones.revocarRol(seleccionado.id, rol.id)
              toast.success('Rol revocado correctamente.')
              cerrar()
            }}
          />
        )
      }
      case 'estado': {
        const activando = seleccionado.estado === 'inactivo'
        return (
          <ConfirmDialog
            title={activando ? 'Activar usuario' : 'Desactivar usuario'}
            message={
              activando
                ? `¿Desea activar a ${seleccionado.nombre}? El usuario pasará a estado Activo.`
                : `¿Desea desactivar a ${seleccionado.nombre}? El usuario pasará a estado Inactivo y podrá activarlo nuevamente cuando lo necesite.`
            }
            confirmLabel={activando ? 'Activar' : 'Desactivar'}
            loadingLabel={activando ? 'Activando…' : 'Desactivando…'}
            variant={activando ? 'primary' : 'danger'}
            onCancel={cerrar}
            onConfirm={async () => {
              await operaciones.cambiarEstado(seleccionado.id, activando ? 'activo' : 'inactivo')
              toast.success(activando ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.')
              cerrar()
            }}
          />
        )
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:flex-1">
          <SearchBar
            label="Buscar usuarios por nombre o correo"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre o correo…"
          />
        </div>
        <div className="sm:w-48">
          <Select
            label="Estado"
            name="estado"
            value={filtro}
            onChange={(event) => {
              if (esFiltro(event.target.value)) setFiltro(event.target.value)
            }}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </Select>
        </div>
        <Button className="sm:shrink-0" onClick={() => setModal({ tipo: 'crear' })}>
          <PlusIcon size={18} aria-hidden="true" />
          Nuevo usuario
        </Button>
      </div>

      <p aria-live="polite" className="text-sm text-slate-600">
        {visibles.length} {visibles.length === 1 ? 'usuario' : 'usuarios'}
      </p>

      {visibles.length > 0 ? (
        <Table caption="Usuarios del sistema" columns={columnas} rows={visibles} getRowKey={(usuario) => usuario.id} />
      ) : usuarios.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Aún no hay usuarios"
          description="Cree el primer usuario para comenzar."
          action={<Button onClick={() => setModal({ tipo: 'crear' })}>Nuevo usuario</Button>}
        />
      ) : (
        <EmptyState
          icon={UsersIcon}
          title="No se encontraron usuarios"
          description="Pruebe con otro término de búsqueda o cambie el filtro de estado."
          action={
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          }
        />
      )}

      {renderModal()}
    </div>
  )
}