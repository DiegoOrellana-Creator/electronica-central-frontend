# Electrónica Central AZ

Frontend del sistema administrativo para **Electrónica Central AZ**, desarrollado como proyecto académico.

## Descripción

Aplicación web frontend para la gestión administrativa de una tienda de productos electrónicos.

El proyecto implementa las funcionalidades correspondientes al **Ciclo 1**, utilizando datos mock en memoria para simular el funcionamiento del sistema mientras el backend se desarrolla por separado.

## Funcionalidades

Actualmente están implementados:

* Inicio de sesión
* Panel principal
* Gestión de usuarios y roles
* Bitácora
* Gestión de productos
* Gestión de categorías
* Gestión de unidades de medida

### Gestión de productos

Permite:

* Consultar productos
* Buscar productos
* Filtrar por categoría y estado
* Crear productos
* Editar productos
* Ver detalles
* Activar y desactivar productos

### Gestión de categorías

Permite:

* Consultar categorías
* Buscar categorías
* Filtrar por estado y categoría padre
* Crear categorías
* Editar categorías
* Ver detalles
* Activar y desactivar categorías
* Manejar relaciones padre/hija

### Gestión de unidades de medida

Permite:

* Consultar unidades
* Buscar unidades
* Filtrar por estado
* Crear unidades
* Editar unidades
* Ver detalles
* Activar y desactivar unidades

## Tecnologías

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Phosphor Icons

## Requisitos

Para ejecutar el proyecto localmente necesitas:

* [Node.js](https://nodejs.org/)
* npm

Se recomienda utilizar una versión reciente de Node.js compatible con la versión de Vite utilizada por el proyecto.

## Instalación

Clona el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Entra a la carpeta del proyecto:

```bash
cd electronica-central-az-frontend
```

Instala las dependencias:

```bash
npm install
```

También puedes utilizar:

```bash
npm ci
```

si quieres instalar exactamente las versiones especificadas en `package-lock.json`.

## Ejecutar en desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local donde podrás abrir la aplicación, normalmente:

```text
http://localhost:5173
```

## Comandos disponibles

### Desarrollo

```bash
npm run dev
```

### Compilar para producción

```bash
npm run build
```

### Verificar el código

```bash
npm run lint
```

## Datos y backend

Actualmente el proyecto funciona con **datos mock almacenados en memoria**.

No requiere:

* Base de datos
* Backend
* API
* PostgreSQL
* Variables de entorno

La arquitectura está preparada para que posteriormente los servicios mock puedan ser reemplazados por servicios conectados al backend.

Los datos se reinician al recargar la aplicación, ya que actualmente no existe persistencia en una base de datos.

## Estructura principal

```text
src/
├── components/     # Componentes reutilizables
├── hooks/           # Hooks personalizados
├── layouts/         # Layout principal
├── pages/           # Vistas de la aplicación
├── services/        # Servicios y lógica de datos mock
└── utils/           # Utilidades y datos iniciales
```

## Estado del proyecto

**Ciclo 1 — Implementado**

Incluye:

* CU-1 — Iniciar sesión
* CU-2 — Gestionar usuarios y roles
* CU-3 — Bitácora
* CU-4 — Gestionar productos
* CU-5 — Gestionar categorías
* CU-8 — Unidades de medida

El backend será integrado posteriormente.

## Diseño

Las decisiones de diseño, estructura y restricciones funcionales del proyecto se encuentran documentadas en:

```text
DESIGN.md
```

## Licencia

Proyecto académico.
