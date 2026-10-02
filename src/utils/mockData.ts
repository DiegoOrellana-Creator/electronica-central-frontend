// Datos de demostracion del Ciclo #1. Son ficticios y no provienen de ningun backend.
// Siguen la estructura conceptual: usuario, rol, permiso y usuario_rol (rolesIds).

// ---------- Seguridad y acceso (CU-2) ----------

export type ModuloCiclo1 =
  | 'Usuarios y Roles'
  | 'Bitácora'
  | 'Productos'
  | 'Categorías'
  | 'Unidades de Medida'

export interface Permiso {
  id: number
  nombre: string
  modulo: ModuloCiclo1
}

export interface Rol {
  id: number
  nombre: string
  descripcion: string
  permisosIds: number[]
}

export type EstadoUsuario = 'activo' | 'inactivo'

export interface Usuario {
  id: number
  nombre: string
  correo: string
  estado: EstadoUsuario
  /** Roles asignados (relacion usuario_rol). */
  rolesIds: number[]
  /** Fecha de registro en formato ISO 8601. */
  creadoEn: string
}

export const PERMISOS: readonly Permiso[] = [
  { id: 1, nombre: 'Ver usuarios y roles', modulo: 'Usuarios y Roles' },
  { id: 2, nombre: 'Gestionar usuarios', modulo: 'Usuarios y Roles' },
  { id: 3, nombre: 'Gestionar roles', modulo: 'Usuarios y Roles' },
  { id: 4, nombre: 'Asignar y revocar roles', modulo: 'Usuarios y Roles' },
  { id: 5, nombre: 'Consultar bitácora', modulo: 'Bitácora' },
  { id: 6, nombre: 'Ver productos', modulo: 'Productos' },
  { id: 7, nombre: 'Gestionar productos', modulo: 'Productos' },
  { id: 8, nombre: 'Ver categorías', modulo: 'Categorías' },
  { id: 9, nombre: 'Gestionar categorías', modulo: 'Categorías' },
  { id: 10, nombre: 'Ver unidades de medida', modulo: 'Unidades de Medida' },
  { id: 11, nombre: 'Gestionar unidades de medida', modulo: 'Unidades de Medida' },
]

export const ROLES_INICIALES: readonly Rol[] = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso completo a los módulos del sistema.',
    permisosIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    id: 2,
    nombre: 'Supervisor',
    descripcion: 'Gestiona el catálogo y supervisa la actividad del sistema.',
    permisosIds: [1, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    id: 3,
    nombre: 'Empleado',
    descripcion: 'Consulta el catálogo y mantiene los productos.',
    permisosIds: [6, 7, 8, 10],
  },
  {
    id: 4,
    nombre: 'Auditor',
    descripcion: 'Consulta la información y la bitácora sin modificar datos.',
    permisosIds: [1, 5, 6, 8, 10],
  },
]

export const USUARIOS_INICIALES: readonly Usuario[] = [
  { id: 1, nombre: 'Admin Demo', correo: 'admin@electronicaaz.com', estado: 'activo', rolesIds: [1], creadoEn: '2026-01-12T08:30:00-04:00' },
  { id: 2, nombre: 'Laura Mendoza', correo: 'lmendoza@electronicaaz.com', estado: 'activo', rolesIds: [2], creadoEn: '2026-01-20T09:15:00-04:00' },
  { id: 3, nombre: 'Carlos Vargas', correo: 'cvargas@electronicaaz.com', estado: 'activo', rolesIds: [3], creadoEn: '2026-02-03T10:00:00-04:00' },
  { id: 4, nombre: 'Diego Suárez', correo: 'dsuarez@electronicaaz.com', estado: 'activo', rolesIds: [3], creadoEn: '2026-02-03T10:20:00-04:00' },
  { id: 5, nombre: 'Ximena Justiniano', correo: 'xjustiniano@electronicaaz.com', estado: 'activo', rolesIds: [3], creadoEn: '2026-09-29T11:40:00-04:00' },
  { id: 6, nombre: 'Marcela Rojas', correo: 'mrojas@electronicaaz.com', estado: 'activo', rolesIds: [4], creadoEn: '2026-04-15T14:05:00-04:00' },
  { id: 7, nombre: 'Jorge Peña', correo: 'jpena@electronicaaz.com', estado: 'inactivo', rolesIds: [3], creadoEn: '2026-02-18T09:45:00-04:00' },
  { id: 8, nombre: 'Andrea Salvatierra', correo: 'asalvatierra@electronicaaz.com', estado: 'activo', rolesIds: [2, 4], creadoEn: '2026-05-06T16:10:00-04:00' },
  { id: 9, nombre: 'Roberto Claros', correo: 'rclaros@electronicaaz.com', estado: 'inactivo', rolesIds: [4], creadoEn: '2026-03-22T11:30:00-04:00' },
  { id: 10, nombre: 'Valeria Egüez', correo: 'veguez@electronicaaz.com', estado: 'activo', rolesIds: [3], creadoEn: '2026-06-09T08:50:00-04:00' },
  { id: 11, nombre: 'Sofía Barrientos', correo: 'sbarrientos@electronicaaz.com', estado: 'activo', rolesIds: [3], creadoEn: '2026-07-14T15:25:00-04:00' },
  { id: 12, nombre: 'Luis Antelo', correo: 'lantelo@electronicaaz.com', estado: 'activo', rolesIds: [3], creadoEn: '2026-08-01T10:40:00-04:00' },
]

// ---------- Productos (CU-4) ----------
// Categorias y unidades de medida son datos de seleccion del formulario de productos.
// Se administran en CU-5 y CU-8; sus servicios los usan como estado inicial.
// Esta seccion se declara antes del Panel porque los indicadores se calculan a partir de ella.

export type EstadoCategoria = 'activo' | 'inactivo'

export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  /** Categoria padre, o `null` si es una categoria principal. La jerarquia es de maximo dos niveles. */
  categoriaPadreId: number | null
  estado: EstadoCategoria
}

export type EstadoUnidad = 'activo' | 'inactivo'

export interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  estado: EstadoUnidad
}

export type EstadoProducto = 'activo' | 'inactivo'

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  /** Precio en bolivianos (Bs). */
  precio: number
  categoriaId: number
  marca: string
  modelo: string
  unidadId: number
  estado: EstadoProducto
}

export const CATEGORIAS_CATALOGO: readonly Categoria[] = [
  // Categorias principales
  { id: 1, nombre: 'Componentes electrónicos', descripcion: 'Componentes pasivos y básicos para armar y reparar circuitos.', categoriaPadreId: null, estado: 'activo' },
  { id: 2, nombre: 'Placas de desarrollo', descripcion: 'Placas programables y microcontroladores para proyectos electrónicos.', categoriaPadreId: null, estado: 'activo' },
  { id: 3, nombre: 'Cables', descripcion: 'Cables para redes y conexiones electrónicas.', categoriaPadreId: null, estado: 'activo' },
  { id: 4, nombre: 'Conectores', descripcion: 'Conectores y terminales para cables y circuitos.', categoriaPadreId: null, estado: 'activo' },
  { id: 5, nombre: 'Prototipado', descripcion: 'Material para armar y probar circuitos sin soldar.', categoriaPadreId: null, estado: 'activo' },
  { id: 6, nombre: 'Sensores y módulos', descripcion: 'Sensores y módulos compatibles con placas de desarrollo.', categoriaPadreId: null, estado: 'activo' },
  { id: 7, nombre: 'Semiconductores', descripcion: 'Diodos, transistores y reguladores de voltaje.', categoriaPadreId: null, estado: 'activo' },
  { id: 8, nombre: 'Fuentes y alimentación', descripcion: 'Fuentes y adaptadores para alimentar circuitos y placas.', categoriaPadreId: null, estado: 'activo' },
  // Subcategorias
  { id: 9, nombre: 'Resistencias', descripcion: 'Resistencias fijas de distintos valores.', categoriaPadreId: 1, estado: 'activo' },
  { id: 10, nombre: 'Capacitores', descripcion: 'Capacitores cerámicos y electrolíticos.', categoriaPadreId: 1, estado: 'activo' },
  { id: 11, nombre: 'Arduino', descripcion: 'Placas de la familia Arduino.', categoriaPadreId: 2, estado: 'activo' },
  { id: 12, nombre: 'ESP32 y ESP8266', descripcion: 'Placas con WiFi de la familia Espressif.', categoriaPadreId: 2, estado: 'activo' },
  { id: 13, nombre: 'Cable de red', descripcion: 'Cable UTP para redes Ethernet.', categoriaPadreId: 3, estado: 'activo' },
  { id: 14, nombre: 'Cables de conexión', descripcion: 'Cables jumper para conexiones en protoboard.', categoriaPadreId: 3, estado: 'activo' },
  { id: 15, nombre: 'RJ45', descripcion: 'Conectores RJ45 para terminar cables de red.', categoriaPadreId: 4, estado: 'activo' },
  { id: 16, nombre: 'Borneras', descripcion: 'Borneras de tornillo para conexión de cables.', categoriaPadreId: 4, estado: 'activo' },
  { id: 17, nombre: 'Protoboards', descripcion: 'Placas de pruebas sin soldadura.', categoriaPadreId: 5, estado: 'activo' },
  { id: 18, nombre: 'Sensores', descripcion: 'Sensores de distancia, temperatura y humedad.', categoriaPadreId: 6, estado: 'activo' },
  { id: 19, nombre: 'Módulos', descripcion: 'Módulos como relés para controlar cargas.', categoriaPadreId: 6, estado: 'activo' },
  { id: 20, nombre: 'Diodos', descripcion: 'Diodos rectificadores y de conmutación.', categoriaPadreId: 7, estado: 'activo' },
  { id: 21, nombre: 'Transistores', descripcion: 'Transistores NPN de uso general.', categoriaPadreId: 7, estado: 'activo' },
  { id: 22, nombre: 'Reguladores de voltaje', descripcion: 'Reguladores para estabilizar la alimentación.', categoriaPadreId: 7, estado: 'activo' },
]

export const UNIDADES_CATALOGO: readonly UnidadMedida[] = [
  { id: 1, nombre: 'Unidad', abreviatura: 'und', estado: 'activo' },
  { id: 2, nombre: 'Metro', abreviatura: 'm', estado: 'activo' },
  { id: 3, nombre: 'Rollo', abreviatura: 'rollo', estado: 'activo' },
  { id: 4, nombre: 'Pack', abreviatura: 'pack', estado: 'activo' },
  { id: 5, nombre: 'Caja', abreviatura: 'caja', estado: 'activo' },
]

// Ids de unidad: 1 Unidad, 2 Metro, 3 Rollo, 4 Pack, 5 Caja.
export const PRODUCTOS_INICIALES: readonly Producto[] = [
  // Placas de desarrollo
  { id: 1, nombre: 'Arduino Uno R3', descripcion: 'Placa de desarrollo basada en ATmega328P para proyectos de electrónica y programación.', precio: 135, categoriaId: 11, marca: 'Arduino', modelo: 'Uno R3', unidadId: 1, estado: 'activo' },
  { id: 2, nombre: 'Arduino Mega 2560', descripcion: 'Placa de desarrollo con más pines de entrada y salida para proyectos de mayor tamaño.', precio: 210, categoriaId: 11, marca: 'Arduino', modelo: 'Mega 2560', unidadId: 1, estado: 'activo' },
  { id: 3, nombre: 'Arduino Nano', descripcion: 'Placa compacta compatible con Arduino, ideal para montajes en protoboard.', precio: 75, categoriaId: 11, marca: 'Arduino', modelo: 'Nano', unidadId: 1, estado: 'activo' },
  { id: 4, nombre: 'ESP32 DevKit V1', descripcion: 'Placa de desarrollo con WiFi y Bluetooth para proyectos de internet de las cosas.', precio: 68, categoriaId: 12, marca: 'Espressif', modelo: 'ESP32 DevKit V1', unidadId: 1, estado: 'activo' },
  { id: 5, nombre: 'ESP8266 NodeMCU', descripcion: 'Placa de desarrollo con WiFi integrado para proyectos conectados.', precio: 52, categoriaId: 12, marca: 'Espressif', modelo: 'ESP8266 NodeMCU', unidadId: 1, estado: 'inactivo' },
  // Cableado de red
  { id: 6, nombre: 'Cable UTP Cat 5e', descripcion: 'Cable de red UTP categoría 5e para conexiones Ethernet, vendido por metro.', precio: 3.5, categoriaId: 13, marca: 'Genérica', modelo: 'UTP Cat 5e', unidadId: 2, estado: 'activo' },
  { id: 7, nombre: 'Cable UTP Cat 6', descripcion: 'Cable de red UTP categoría 6 para conexiones Ethernet, vendido por metro.', precio: 5, categoriaId: 13, marca: 'Genérica', modelo: 'UTP Cat 6', unidadId: 2, estado: 'activo' },
  { id: 8, nombre: 'Cable UTP Cat 6 exterior', descripcion: 'Cable de red UTP categoría 6 para instalaciones a la intemperie, vendido por metro.', precio: 8, categoriaId: 13, marca: 'Genérica', modelo: 'UTP Cat 6 exterior', unidadId: 2, estado: 'inactivo' },
  { id: 9, nombre: 'Cable UTP Cat 6 en rollo de 305 m', descripcion: 'Rollo completo de cable de red UTP categoría 6 para instalaciones de red.', precio: 780, categoriaId: 13, marca: 'Genérica', modelo: 'UTP Cat 6 rollo 305 m', unidadId: 3, estado: 'activo' },
  // Conectores
  { id: 10, nombre: 'Conector RJ45 Cat 5e', descripcion: 'Conector RJ45 para terminación de cables de red.', precio: 35, categoriaId: 15, marca: 'Genérica', modelo: 'RJ45 Cat 5e', unidadId: 4, estado: 'activo' },
  { id: 11, nombre: 'Conector RJ45 Cat 6', descripcion: 'Conector RJ45 para terminación de cables de red categoría 6.', precio: 55, categoriaId: 15, marca: 'Genérica', modelo: 'RJ45 Cat 6', unidadId: 4, estado: 'activo' },
  { id: 12, nombre: 'Bornera 2 pines', descripcion: 'Bornera de tornillo de 2 pines para conexión de cables en placas.', precio: 2, categoriaId: 16, marca: 'Genérica', modelo: 'Bornera 2 pines', unidadId: 1, estado: 'activo' },
  { id: 13, nombre: 'Bornera 3 pines', descripcion: 'Bornera de tornillo de 3 pines para conexión de cables en placas.', precio: 3, categoriaId: 16, marca: 'Genérica', modelo: 'Bornera 3 pines', unidadId: 1, estado: 'activo' },
  // Resistencias
  { id: 14, nombre: 'Resistencia 220 Ω', descripcion: 'Resistencia de 220 ohmios para circuitos electrónicos.', precio: 0.5, categoriaId: 9, marca: 'Genérica', modelo: 'Resistencia 220 Ω', unidadId: 1, estado: 'activo' },
  { id: 15, nombre: 'Resistencia 330 Ω', descripcion: 'Resistencia de 330 ohmios para circuitos electrónicos.', precio: 0.5, categoriaId: 9, marca: 'Genérica', modelo: 'Resistencia 330 Ω', unidadId: 1, estado: 'activo' },
  { id: 16, nombre: 'Resistencia 1 kΩ', descripcion: 'Resistencia de 1 kiloohmio para circuitos electrónicos.', precio: 0.5, categoriaId: 9, marca: 'Genérica', modelo: 'Resistencia 1 kΩ', unidadId: 1, estado: 'activo' },
  { id: 17, nombre: 'Resistencia 10 kΩ', descripcion: 'Resistencia de 10 kiloohmios para circuitos electrónicos.', precio: 0.5, categoriaId: 9, marca: 'Genérica', modelo: 'Resistencia 10 kΩ', unidadId: 1, estado: 'activo' },
  { id: 18, nombre: 'Kit de resistencias surtidas', descripcion: 'Caja con resistencias de distintos valores para prototipos y reparaciones.', precio: 45, categoriaId: 9, marca: 'Elegoo', modelo: 'Kit resistencias 1/4 W', unidadId: 5, estado: 'activo' },
  // Capacitores
  { id: 19, nombre: 'Capacitor cerámico 100 nF', descripcion: 'Capacitor cerámico de 100 nanofaradios para desacople en circuitos electrónicos.', precio: 1, categoriaId: 10, marca: 'Genérica', modelo: 'Capacitor 100 nF', unidadId: 1, estado: 'activo' },
  { id: 20, nombre: 'Capacitor cerámico 1 µF', descripcion: 'Capacitor cerámico de 1 microfaradio para circuitos electrónicos.', precio: 1.5, categoriaId: 10, marca: 'Genérica', modelo: 'Capacitor 1 µF', unidadId: 1, estado: 'activo' },
  { id: 21, nombre: 'Capacitor electrolítico 100 µF', descripcion: 'Capacitor electrolítico de 100 µF para aplicaciones de filtrado y alimentación.', precio: 2, categoriaId: 10, marca: 'Genérica', modelo: 'Capacitor 100 µF', unidadId: 1, estado: 'activo' },
  { id: 22, nombre: 'Capacitor electrolítico 470 µF', descripcion: 'Capacitor electrolítico de 470 µF para aplicaciones de filtrado y alimentación.', precio: 3.5, categoriaId: 10, marca: 'Genérica', modelo: 'Capacitor 470 µF', unidadId: 1, estado: 'inactivo' },
  // Semiconductores
  { id: 23, nombre: 'Diodo 1N4007', descripcion: 'Diodo rectificador de uso general para fuentes de alimentación.', precio: 1, categoriaId: 20, marca: 'Vishay', modelo: '1N4007', unidadId: 1, estado: 'activo' },
  { id: 24, nombre: 'Diodo 1N4148', descripcion: 'Diodo de conmutación rápida para circuitos de señal.', precio: 0.8, categoriaId: 20, marca: 'Genérica', modelo: '1N4148', unidadId: 1, estado: 'activo' },
  { id: 25, nombre: 'Transistor BC547', descripcion: 'Transistor NPN de uso general para amplificación y conmutación.', precio: 1.5, categoriaId: 21, marca: 'Genérica', modelo: 'BC547', unidadId: 1, estado: 'activo' },
  { id: 26, nombre: 'Transistor 2N2222', descripcion: 'Transistor NPN de uso general para conmutación de pequeñas cargas.', precio: 2, categoriaId: 21, marca: 'Genérica', modelo: '2N2222', unidadId: 1, estado: 'inactivo' },
  { id: 27, nombre: 'Regulador LM7805', descripcion: 'Regulador de voltaje de 5 V para alimentación de circuitos.', precio: 4, categoriaId: 22, marca: 'Texas Instruments', modelo: 'LM7805', unidadId: 1, estado: 'activo' },
  // Prototipado
  { id: 28, nombre: 'Protoboard 400 puntos', descripcion: 'Placa de pruebas sin soldadura para armar circuitos de prueba.', precio: 18, categoriaId: 17, marca: 'Genérica', modelo: 'Protoboard 400 puntos', unidadId: 1, estado: 'inactivo' },
  { id: 29, nombre: 'Protoboard 830 puntos', descripcion: 'Placa de pruebas sin soldadura para armar circuitos de prueba.', precio: 28, categoriaId: 17, marca: 'Genérica', modelo: 'Protoboard 830 puntos', unidadId: 1, estado: 'activo' },
  { id: 30, nombre: 'Cables jumper macho-macho (40 u)', descripcion: 'Pack de cables jumper para conexiones en protoboard.', precio: 14, categoriaId: 14, marca: 'Genérica', modelo: 'Jumper macho-macho 20 cm', unidadId: 4, estado: 'activo' },
  // Sensores y módulos
  { id: 31, nombre: 'Sensor ultrasónico HC-SR04', descripcion: 'Sensor medidor de distancia para proyectos con Arduino.', precio: 18, categoriaId: 18, marca: 'HandsOn Tech', modelo: 'HC-SR04', unidadId: 1, estado: 'activo' },
  { id: 32, nombre: 'Sensor de temperatura y humedad DHT11', descripcion: 'Sensor digital de temperatura y humedad ambiental.', precio: 15, categoriaId: 18, marca: 'Aosong', modelo: 'DHT11', unidadId: 1, estado: 'activo' },
  { id: 33, nombre: 'Módulo relé 1 canal', descripcion: 'Módulo relé de 1 canal para controlar cargas desde una placa de desarrollo.', precio: 14, categoriaId: 19, marca: 'Genérica', modelo: 'Relé 5 V 1 canal', unidadId: 1, estado: 'activo' },
  // Fuentes y alimentación
  { id: 34, nombre: 'Fuente de alimentación 5 V 2 A', descripcion: 'Adaptador de corriente de 5 V para alimentar placas y módulos electrónicos.', precio: 38, categoriaId: 8, marca: 'Genérica', modelo: 'Adaptador 5 V 2 A', unidadId: 1, estado: 'activo' },
]

// ---------- Panel ----------

export type IndicadorId = 'usuarios' | 'roles' | 'productos' | 'categorias' | 'unidadesMedida'

export interface IndicadorResumen {
  id: IndicadorId
  titulo: string
  valor: number
  contexto: string
}

export type ResultadoActividad = 'exitoso' | 'error'

export interface ActividadReciente {
  id: number
  accion: string
  objeto: string
  usuario: string
  /** Fecha y hora en formato ISO 8601. */
  fechaHora: string
  resultado: ResultadoActividad
}

const usuariosActivos = USUARIOS_INICIALES.filter((u) => u.estado === 'activo').length
const usuariosInactivos = USUARIOS_INICIALES.length - usuariosActivos

const productosActivos = PRODUCTOS_INICIALES.filter((p) => p.estado === 'activo').length
const categoriasPrincipales = CATEGORIAS_CATALOGO.filter((c) => c.categoriaPadreId === null).length

export const INDICADORES_RESUMEN: readonly IndicadorResumen[] = [
  {
    id: 'usuarios',
    titulo: 'Usuarios',
    valor: USUARIOS_INICIALES.length,
    contexto: `${usuariosActivos} activos y ${usuariosInactivos} inactivos`,
  },
  {
    id: 'roles',
    titulo: 'Roles',
    valor: ROLES_INICIALES.length,
    contexto: 'Roles definidos en el sistema',
  },
  { id: 'productos', titulo: 'Productos', valor: PRODUCTOS_INICIALES.length, contexto: `${productosActivos} activos en el catálogo` },
  { id: 'categorias', titulo: 'Categorías', valor: CATEGORIAS_CATALOGO.length, contexto: `${categoriasPrincipales} son categorías principales` },
  { id: 'unidadesMedida', titulo: 'Unidades de medida', valor: UNIDADES_CATALOGO.length, contexto: 'Unidades registradas' },
]

export const ACTIVIDAD_RECIENTE: readonly ActividadReciente[] = [
  { id: 1, accion: 'Producto actualizado', objeto: 'ESP32 DevKit V1', usuario: 'Laura Mendoza', fechaHora: '2026-09-30T10:12:00-04:00', resultado: 'exitoso' },
  { id: 2, accion: 'Rol asignado', objeto: 'Usuario cvargas, rol Empleado', usuario: 'Admin Demo', fechaHora: '2026-09-30T09:47:00-04:00', resultado: 'exitoso' },
  { id: 3, accion: 'Intento de inicio de sesión', objeto: 'Usuario dsuarez', usuario: 'Diego Suárez', fechaHora: '2026-09-30T09:31:00-04:00', resultado: 'error' },
  { id: 4, accion: 'Categoría modificada', objeto: 'Cables', usuario: 'Laura Mendoza', fechaHora: '2026-09-29T17:05:00-04:00', resultado: 'exitoso' },
  { id: 5, accion: 'Unidad de medida activada', objeto: 'Metro (m)', usuario: 'Admin Demo', fechaHora: '2026-09-29T15:26:00-04:00', resultado: 'exitoso' },
  { id: 6, accion: 'Usuario creado', objeto: 'Usuario xjustiniano', usuario: 'Admin Demo', fechaHora: '2026-09-29T11:40:00-04:00', resultado: 'exitoso' },
]

// ---------- Bitácora ----------

export type ResultadoBitacora = 'exito' | 'advertencia' | 'error'

/** Registro de auditoria. Es de solo lectura: la aplicacion nunca lo modifica ni lo elimina. */
export interface RegistroBitacora {
  id: number | string
  /** Fecha y hora en formato ISO 8601. */
  fechaHora: string
  accion: string
  /** Objeto afectado por la accion. Si hubo advertencia o error, incluye el motivo entre parentesis. */
  objeto: string
  resultado: ResultadoBitacora
  usuario: string
  ip: string
}

export const REGISTROS_BITACORA: readonly RegistroBitacora[] = [
  { id: 1, fechaHora: '2026-09-30T10:12:00-04:00', accion: 'Producto actualizado', objeto: 'ESP32 DevKit V1', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 2, fechaHora: '2026-09-30T09:47:00-04:00', accion: 'Rol asignado', objeto: 'Usuario cvargas, rol Empleado', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 3, fechaHora: '2026-09-30T09:33:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario dsuarez', resultado: 'exito', usuario: 'Diego Suárez', ip: '192.168.1.35' },
  { id: 4, fechaHora: '2026-09-30T09:31:00-04:00', accion: 'Intento de inicio de sesión', objeto: 'Usuario dsuarez (contraseña incorrecta)', resultado: 'error', usuario: 'Diego Suárez', ip: '192.168.1.35' },
  { id: 5, fechaHora: '2026-09-30T09:29:00-04:00', accion: 'Intento de inicio de sesión', objeto: 'Usuario dsuarez (contraseña incorrecta)', resultado: 'error', usuario: 'Diego Suárez', ip: '192.168.1.35' },
  { id: 6, fechaHora: '2026-09-30T08:55:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario lmendoza', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 7, fechaHora: '2026-09-30T08:40:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario admin', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 8, fechaHora: '2026-09-30T08:20:00-04:00', accion: 'Intento de inicio de sesión', objeto: 'Usuario jpena (cuenta inactiva)', resultado: 'advertencia', usuario: 'Jorge Peña', ip: '192.168.1.37' },
  { id: 9, fechaHora: '2026-09-29T17:05:00-04:00', accion: 'Categoría modificada', objeto: 'Cables', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 10, fechaHora: '2026-09-29T16:20:00-04:00', accion: 'Producto creado', objeto: 'Arduino Nano', resultado: 'exito', usuario: 'Carlos Vargas', ip: '192.168.1.34' },
  { id: 11, fechaHora: '2026-09-29T15:26:00-04:00', accion: 'Unidad de medida activada', objeto: 'Metro (m)', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 12, fechaHora: '2026-09-29T14:02:00-04:00', accion: 'Producto creado', objeto: 'Arduino Nano (el producto ya existe)', resultado: 'error', usuario: 'Carlos Vargas', ip: '192.168.1.34' },
  { id: 13, fechaHora: '2026-09-29T11:48:00-04:00', accion: 'Rol asignado', objeto: 'Usuario xjustiniano, rol Empleado', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 14, fechaHora: '2026-09-29T11:40:00-04:00', accion: 'Usuario creado', objeto: 'Usuario xjustiniano', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 15, fechaHora: '2026-09-29T10:15:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario lmendoza', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 16, fechaHora: '2026-09-29T09:10:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario admin', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 17, fechaHora: '2026-09-28T16:45:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario mrojas', resultado: 'exito', usuario: 'Marcela Rojas', ip: '192.168.1.51' },
  { id: 18, fechaHora: '2026-09-28T15:10:00-04:00', accion: 'Producto actualizado', objeto: 'Cable UTP Cat 6', resultado: 'exito', usuario: 'Carlos Vargas', ip: '192.168.1.34' },
  { id: 19, fechaHora: '2026-09-28T12:30:00-04:00', accion: 'Unidad de medida creada', objeto: 'Caja (caja)', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 20, fechaHora: '2026-09-28T11:05:00-04:00', accion: 'Usuario modificado', objeto: 'Usuario lantelo (correo ya registrado)', resultado: 'error', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 21, fechaHora: '2026-09-28T09:20:00-04:00', accion: 'Inicio de sesión', objeto: 'Usuario admin', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 22, fechaHora: '2026-09-26T14:50:00-04:00', accion: 'Rol modificado', objeto: 'Rol Auditor', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 23, fechaHora: '2026-09-26T10:00:00-04:00', accion: 'Categoría creada', objeto: 'Fuentes y alimentación', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 24, fechaHora: '2026-09-25T16:30:00-04:00', accion: 'Producto creado', objeto: 'Capacitor electrolítico 100 µF', resultado: 'exito', usuario: 'Sofía Barrientos', ip: '192.168.1.46' },
  { id: 25, fechaHora: '2026-09-25T15:00:00-04:00', accion: 'Producto actualizado', objeto: 'Resistencia 220 Ω', resultado: 'exito', usuario: 'Valeria Egüez', ip: '192.168.1.44' },
  { id: 26, fechaHora: '2026-09-25T09:05:00-04:00', accion: 'Intento de inicio de sesión', objeto: 'Usuario rclaros (cuenta inactiva)', resultado: 'advertencia', usuario: 'Roberto Claros', ip: '192.168.1.60' },
  { id: 27, fechaHora: '2026-09-24T17:20:00-04:00', accion: 'Usuario desactivado', objeto: 'Usuario rclaros', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 28, fechaHora: '2026-09-24T16:10:00-04:00', accion: 'Rol revocado', objeto: 'Usuario asalvatierra, rol Empleado', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 29, fechaHora: '2026-09-24T16:05:00-04:00', accion: 'Rol asignado', objeto: 'Usuario asalvatierra, rol Auditor', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 30, fechaHora: '2026-09-22T11:35:00-04:00', accion: 'Producto creado', objeto: 'Conector RJ45 Cat 6', resultado: 'exito', usuario: 'Carlos Vargas', ip: '192.168.1.34' },
  { id: 31, fechaHora: '2026-09-22T09:15:00-04:00', accion: 'Producto actualizado', objeto: 'Sensor de temperatura y humedad DHT11', resultado: 'exito', usuario: 'Diego Suárez', ip: '192.168.1.35' },
  { id: 32, fechaHora: '2026-09-18T15:40:00-04:00', accion: 'Unidad de medida modificada', objeto: 'Pack (pack)', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 33, fechaHora: '2026-09-18T10:25:00-04:00', accion: 'Rol modificado', objeto: 'Rol Supervisor', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 34, fechaHora: '2026-09-15T12:00:00-04:00', accion: 'Usuario desactivado', objeto: 'Usuario jpena (conserva el rol Empleado)', resultado: 'advertencia', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 35, fechaHora: '2026-09-10T11:20:00-04:00', accion: 'Rol asignado', objeto: 'Usuario mrojas, rol Auditor', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 36, fechaHora: '2026-09-10T11:05:00-04:00', accion: 'Rol creado', objeto: 'Rol Auditor', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 37, fechaHora: '2026-09-05T16:15:00-04:00', accion: 'Producto creado', objeto: 'Arduino Uno R3', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 38, fechaHora: '2026-09-05T15:30:00-04:00', accion: 'Categoría creada', objeto: 'Placas de desarrollo', resultado: 'exito', usuario: 'Laura Mendoza', ip: '192.168.1.21' },
  { id: 39, fechaHora: '2026-08-20T10:45:00-04:00', accion: 'Unidad de medida creada', objeto: 'Metro (m)', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 40, fechaHora: '2026-08-01T10:42:00-04:00', accion: 'Rol asignado', objeto: 'Usuario lantelo, rol Empleado', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 41, fechaHora: '2026-08-01T10:40:00-04:00', accion: 'Usuario creado', objeto: 'Usuario lantelo', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 42, fechaHora: '2026-07-14T15:25:00-04:00', accion: 'Usuario creado', objeto: 'Usuario sbarrientos', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 43, fechaHora: '2026-07-02T09:30:00-04:00', accion: 'Usuario activado', objeto: 'Usuario veguez', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 44, fechaHora: '2026-06-25T17:10:00-04:00', accion: 'Usuario desactivado', objeto: 'Usuario veguez', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
  { id: 45, fechaHora: '2026-06-09T08:50:00-04:00', accion: 'Usuario creado', objeto: 'Usuario veguez', resultado: 'exito', usuario: 'Admin Demo', ip: '192.168.1.10' },
]
