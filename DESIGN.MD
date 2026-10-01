# DESIGN.md — Electrónica Central AZ

## 1. CONTEXTO

Electrónica Central AZ es un sistema web administrativo para la gestión de una tienda de productos electrónicos.

El frontend se desarrollará por ciclos. Actualmente solo se implementa el prototipo correspondiente al CICLO #1.

CICLO #1:
- CU-1: Iniciar sesión
- CU-2: Gestionar usuarios y roles
- CU-3: Bitácora
- CU-4: Gestionar productos
- CU-5: Gestionar categoría
- CU-8: Unidades de medida

No implementar módulos de ciclos posteriores.

---

## 2. OBJETIVO DEL FRONTEND

Crear una interfaz administrativa profesional, clara, moderna y consistente.

El frontend debe permitir visualizar y recorrer los casos de uso del Ciclo #1 mediante datos de prueba/mock.

Por ahora:
- No conectar con backend.
- No crear API ficticias.
- No inventar endpoints.
- No ejecutar procedimientos almacenados desde el frontend.
- No implementar lógica real de base de datos.
- Preparar la arquitectura para conectar posteriormente con PostgreSQL/backend.

---

## 3. IDENTIDAD VISUAL

Nombre:
Electrónica Central AZ

Símbolo:
⚡

Estilo:
- Profesional
- Tecnológico
- Limpio
- Administrativo
- Moderno
- Minimalista
- Con buena jerarquía visual

Evitar:
- Estética gamer
- Cyberpunk
- Exceso de neón
- Gradientes excesivos
- Glassmorphism excesivo
- Interfaces genéricas de IA
- Decoración innecesaria

---

## 4. LAYOUT PRINCIPAL

Usar una estructura administrativa:

Sidebar + Header + Main Content.

Sidebar:
- Logo ⚡
- Electrónica Central AZ
- Panel
- Usuarios y Roles
- Bitácora
- Productos
- Categorías
- Unidades de Medida

El elemento activo debe estar claramente identificado.

Header:
- Título de la vista actual
- Usuario autenticado
- Menú de usuario
- Opción cerrar sesión

Main:
- Contenido de la vista
- Breadcrumb cuando sea útil
- Acciones principales claramente visibles

---

## 5. LOGIN

La pantalla de inicio de sesión corresponde a CU-1.

Debe contener:
- Logo/símbolo ⚡
- Electrónica Central AZ
- Correo/usuario
- Contraseña
- Mostrar/ocultar contraseña
- Recordar sesión, si resulta útil
- Botón "Ingresar"
- Mensaje de error visual cuando corresponda

Para el prototipo utilizar autenticación simulada.

No implementar autenticación real.

---

## 6. USUARIOS Y ROLES

Corresponde a CU-2.

Debe permitir visualizar:

Usuarios:
- Nombre
- Correo
- Estado
- Roles
- Acciones

Roles:
- Nombre
- Descripción
- Permisos

Interacciones del prototipo:
- Crear usuario
- Editar usuario
- Activar/desactivar usuario
- Ver detalles
- Asignar rol
- Revocar rol

Usar modales o paneles laterales para formularios simples.

La estructura debe quedar preparada para posteriormente conectarse con usuario, rol, permiso y usuario_rol.

Los procedimientos existentes incluyen asignación y revocación de roles; mantener la UI compatible con esas operaciones futuras.

---

## 7. BITÁCORA

Corresponde a CU-3.

Mostrar una tabla administrativa de auditoría.

Columnas:
- Fecha
- Acción
- Objeto afectado
- Resultado
- Usuario
- Dirección IP

Incluir:
- Buscador
- Filtro por acción
- Filtro por usuario
- Filtro por fecha
- Paginación

La bitácora representa acciones realizadas por usuarios y debe visualizarse como información de auditoría, no como una tabla editable.

---

## 8. PRODUCTOS

Corresponde a CU-4.

Crear una vista de gestión de productos.

Vista principal:
- Buscador
- Filtros
- Botón "Nuevo producto"
- Tabla de productos

Columnas recomendadas:
- Producto
- Categoría
- Marca
- Modelo
- Unidad
- Precio
- Estado
- Acciones

Acciones:
- Ver
- Editar
- Activar/desactivar

Formulario de producto:
- Nombre
- Descripción
- Precio
- Categoría
- Marca
- Modelo
- Unidad de medida
- Estado

No implementar todavía inventario, compras o ventas dentro de esta vista.

---

## 9. CATEGORÍAS

Corresponde a CU-5.

Vista CRUD de categorías.

Mostrar:
- Nombre
- Descripción
- Categoría padre, si corresponde
- Estado
- Acciones

Funciones visuales:
- Crear
- Editar
- Activar/desactivar
- Buscar

La categoría puede tener relación jerárquica padre/hija. La interfaz debe permitir seleccionar una categoría padre sin complicar innecesariamente la vista.

---

## 10. UNIDADES DE MEDIDA

Corresponde a CU-8.

Vista CRUD sencilla.

Mostrar:
- Nombre
- Abreviatura
- Estado
- Acciones

Funciones:
- Crear
- Editar
- Activar/desactivar
- Buscar

---

## 11. TABLAS

Las tablas son un componente importante del sistema.

Deben incluir cuando corresponda:
- Encabezados claros
- Ordenamiento
- Búsqueda
- Filtros
- Paginación
- Acciones por fila
- Estados mediante badges

Evitar tablas visualmente saturadas.

---

## 12. FORMULARIOS

Todos los formularios deben tener:
- Labels claros
- Campos correctamente agrupados
- Indicador de campos obligatorios
- Validación visual
- Mensajes de error
- Estados disabled/loading
- Botón cancelar
- Botón principal claramente identificado

No utilizar `alert()` del navegador.

---

## 13. ESTADOS

Utilizar estados visuales consistentes:

- Activo
- Inactivo
- Éxito
- Advertencia
- Error
- Información
- Cargando
- Vacío

No depender únicamente del color para comunicar estados.

---

## 14. COMPONENTES REUTILIZABLES

Crear componentes reutilizables para evitar duplicación.

Como mínimo considerar:

- Button
- Input
- Select
- Modal
- Table
- Badge
- Card
- Sidebar
- Header
- SearchBar
- Pagination
- Toast
- EmptyState
- LoadingState
- ConfirmDialog

---

## 15. ARQUITECTURA REACT

Mantener separación clara:

src/
├── components/
├── layouts/
├── pages/
├── hooks/
├── services/
├── utils/
└── assets/

Las páginas representan vistas.

Los componentes contienen elementos reutilizables.

Los services deben quedar preparados para futuras llamadas al backend.

No colocar toda la lógica dentro de un único componente.

---

## 16. TAILWIND

Usar Tailwind CSS.

No agregar otro framework visual.

Priorizar:
- Clases reutilizables
- Consistencia
- Responsive design
- Estados hover/focus/disabled
- Buena accesibilidad

Evitar estilos inline salvo casos realmente necesarios.

---

## 17. RESPONSIVE

El sistema debe funcionar correctamente en:
- Desktop
- Tablet
- Mobile

En pantallas pequeñas el sidebar debe adaptarse sin romper el contenido.

Las tablas deben tener comportamiento responsive adecuado.

---

## 18. ACCESIBILIDAD

Aplicar:
- HTML semántico
- Labels asociados a inputs
- Navegación mediante teclado
- Focus visible
- Contraste adecuado
- Botones con nombres claros
- No depender únicamente del color
- Estados accesibles

---

## 19. ICONOS

Usar una única librería de iconos.

Mantener:
- Mismo estilo
- Tamaños consistentes
- Iconos reconocibles

No utilizar emojis como iconos funcionales excepto el símbolo de marca ⚡.

---

## 20. NOTIFICACIONES

Utilizar Toasts o mensajes internos para:
- Creación
- Edición
- Activación/desactivación
- Asignación/revocación de roles
- Errores

No utilizar `alert()`.

---

## 21. DATOS DEL PROTOTIPO

Utilizar datos mock realistas y consistentes.

Los datos deben respetar la estructura conceptual de la base de datos.

No inventar módulos o relaciones que todavía no correspondan al Ciclo #1.

Los datos mock deben estar separados de los componentes para facilitar posteriormente la conexión con el backend.

---

## 22. BACKEND FUTURO

La arquitectura debe permitir sustituir fácilmente los datos mock por servicios reales.

No modificar ni inventar procedimientos almacenados.

Cuando posteriormente se conecte el backend, respetar la lógica existente de la base de datos, triggers y procedimientos almacenados.

Las operaciones de negocio deben ejecutarse en backend, no mediante lógica duplicada en React.

---

## 23. DISEÑO Y UX

Prioridad:

1. Usabilidad
2. Accesibilidad
3. Jerarquía visual
4. Consistencia
5. Responsive
6. Estética
7. Decoración

Cada pantalla debe tener una acción principal claramente identificable.

Evitar exceso de cards, sombras, bordes y elementos decorativos.

La interfaz debe sentirse como un sistema administrativo profesional.

---

## 24. RESTRICCIÓN DEL CICLO #1

NO implementar todavía:

- Compras
- Ventas
- Clientes
- Proveedores
- Inventario operativo
- Pagos
- Comprobantes
- Solicitudes de productos
- Reportes avanzados
- Compatibilidades
- Procesos de ciclos posteriores

Solo preparar arquitectura para futuras expansiones.

---

## 25. REGLA PRINCIPAL

El frontend debe representar el sistema real de Electrónica Central AZ sin inventar funcionalidades.

Diseñar pensando en escalabilidad, pero implementar únicamente el alcance definido para el Ciclo #1.