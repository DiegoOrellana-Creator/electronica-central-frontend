import {
  ClipboardTextIcon,
  PackageIcon,
  RulerIcon,
  SquaresFourIcon,
  TagIcon,
  UsersIcon,
  WarehouseIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { tienePermiso } from '../services/sesion'

export const BRAND_NAME = 'Electrónica Central AZ'

export const ROUTES = {
  login: '/login',
  recuperar: '/recuperar',
  restablecer: '/restablecer',
  dashboard: '/dashboard',
  usuarios: '/usuarios',
  bitacora: '/bitacora',
  productos: '/productos',
  categorias: '/categorias',
  unidadesMedida: '/unidades-medida',
  inventario: '/inventario',
} as const

export interface NavItem {
  label: string
  to: string
  icon: Icon
  /** Descripcion breve de la seccion (accesos rapidos del Panel). */
  description: string
  /** Si se indica, la opcion solo se muestra con al menos uno de estos permisos. */
  permisos?: readonly string[]
}

/** Opciones del Sidebar (Ciclo #1). Las rutas y los titulos del Header salen de aqui. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Panel',
    to: ROUTES.dashboard,
    icon: SquaresFourIcon,
    description: 'Resumen general del sistema.',
  },
  {
    label: 'Usuarios y Roles',
    to: ROUTES.usuarios,
    icon: UsersIcon,
    description: 'Cuentas de acceso, roles y permisos.',
    permisos: ['USUARIOS_GESTIONAR', 'USUARIOS_CREAR'],
  },
  {
    label: 'Bitácora',
    to: ROUTES.bitacora,
    icon: ClipboardTextIcon,
    description: 'Registro de las acciones realizadas en el sistema.',
    permisos: ['BITACORA_CONSULTAR'],
  },
  {
    label: 'Productos',
    to: ROUTES.productos,
    icon: PackageIcon,
    description: 'Catálogo de productos electrónicos.',
    permisos: ['CATALOGO_CONSULTAR', 'CATALOGO_GESTIONAR'],
  },
  {
    label: 'Categorías',
    to: ROUTES.categorias,
    icon: TagIcon,
    description: 'Clasificación jerárquica de los productos.',
    permisos: ['CATALOGO_CONSULTAR', 'CATALOGO_GESTIONAR'],
  },
  {
    label: 'Unidades de Medida',
    to: ROUTES.unidadesMedida,
    icon: RulerIcon,
    description: 'Unidades con las que se miden los productos.',
    permisos: ['CATALOGO_CONSULTAR', 'CATALOGO_GESTIONAR'],
  },
  {
    label: 'Inventario',
    to: ROUTES.inventario,
    icon: WarehouseIcon,
    description: 'Existencias, movimientos y alertas de stock.',
    permisos: ['INVENTARIO_CONSULTAR', 'INVENTARIO_GESTIONAR'],
  },
]

/** Indica si el usuario en sesion tiene permiso para ver una opcion del menu. */
export const puedeVerItem = (item: NavItem): boolean =>
  !item.permisos || item.permisos.some(tienePermiso)