# SmartMenu — Frontend

| Campo      | Valor                                              |
| ---------- | -------------------------------------------------- |
| Versión    | 1.0                                                |
| Stack      | Astro 6, React 19, TypeScript, SCSS Modules        |
| Referencia | [ENDPOINTS-FRONTEND.md](./ENDPOINTS-FRONTEND.md)   |

---

## Tabla de contenidos

1. [Arquitectura](#1-arquitectura)
2. [Rutas y protección](#2-rutas-y-protección)
3. [Autenticación](#3-autenticación)
4. [Panel administrativo](#4-panel-administrativo)
5. [Capa de API del cliente](#5-capa-de-api-del-cliente)
6. [Menú de demostración](#6-menú-de-demostración)
7. [Estilos y convenciones](#7-estilos-y-convenciones)
8. [Pendientes MVP](#8-pendientes-mvp)

---

## 1. Arquitectura

```text
Astro (páginas .astro)
 │
 ├── Páginas estáticas / layouts
 │     login.astro, register.astro, example.astro
 │
 └── Islas React (client:load)
       AdminShell ──► páginas admin por pathname
       LoginForm, RegisterForm
       ExampleMenuDemo
              │
              ▼
       fetch /api/*  (credentials: include)
```

- **Astro** sirve HTML y monta islas React donde hace falta interactividad.
- **Una sola API** en el mismo origen (`/api/*`); no hay proxy ni BFF separado.
- **Sesión** por cookies httpOnly de Better Auth; todo `fetch` autenticado usa `credentials: "include"`.

---

## 2. Rutas y protección

### Rutas públicas

Definidas en `src/lib/public-routes.ts`:

| Ruta | Notas |
| ---- | ----- |
| `/`, `/example`, `/login`, `/register` | Exactas |
| `/api/*`, `/_astro/*`, `/favicon*` | Prefijos |

### Rutas protegidas

| Prefijo | Comportamiento |
| ------- | -------------- |
| `/admin` | Middleware Astro verifica sesión; sin cookie → redirect `/login` |

Implementación: `src/middleware.ts` usa `auth.api.getSession()` de Better Auth.

### Páginas admin (Astro)

Todas usan `AdminLayout.astro`, que monta `<AdminShell client:load />`:

| Archivo | Ruta |
| ------- | ---- |
| `src/pages/admin/index.astro` | `/admin` |
| `src/pages/admin/restaurant.astro` | `/admin/restaurant` |
| `src/pages/admin/menus.astro` | `/admin/menus` |
| `src/pages/admin/theme.astro` | `/admin/theme` |
| `src/pages/admin/members.astro` | `/admin/members` |

El enrutado **dentro** del admin es client-side: `AdminShell` lee `window.location.pathname` y renderiza el componente correspondiente vía `getAdminPage()` en `admin-pages.tsx`.

---

## 3. Autenticación

| Archivo | Rol |
| ------- | --- |
| `src/lib/auth-api.ts` | Cliente Better Auth: `signIn`, `signUp`, `getSession`, `signOut` |
| `src/components/auth/LoginForm.tsx` | Formulario de login |
| `src/components/auth/RegisterForm.tsx` | Registro (redirect a login con aviso en sessionStorage) |
| `src/components/auth/AuthShell.tsx` | Layout compartido auth |
| `src/pages/login.astro`, `register.astro` | Entradas Astro |

Flujo post-registro: sign-up **no** crea restaurante. Tras login, `AdminShell` muestra onboarding si `GET /api/restaurants` devuelve `[]`.

Redirect tras login/registro exitoso: `/admin` (`AUTH_SUCCESS_REDIRECT`).

---

## 4. Panel administrativo

### Shell y bootstrap

`AdminShell.tsx` centraliza:

1. Carga de sesión (`getSession`)
2. Listado de restaurante (`listRestaurants`)
3. Detección de menú publicado para enlace de vista previa
4. Estados: `loading` | `unauthenticated` | `onboarding` | `ready`
5. Sidebar, menú de usuario, logout
6. Filtrado de nav por rol (`ownerOnly` en `admin-nav.ts`)

Enlace de vista previa (si hay menú publicado):

```text
/menu/{restaurant.slug}/{menu.slug}
```

> La ruta Astro del menú público real **aún no existe**; el enlace apunta al destino planificado del MVP.

### Navegación

`src/components/admin/admin-nav.ts`:

| Ruta | Label | Rol |
| ---- | ----- | --- |
| `/admin` | Inicio | Todos |
| `/admin/restaurant` | Restaurante | Todos |
| `/admin/menus` | Menús | Todos |
| `/admin/theme` | Apariencia | Owner |
| `/admin/members` | Equipo | Owner |

### Páginas implementadas

| Página | Componente | Funcionalidad |
| ------ | ---------- | ------------- |
| Onboarding | `AdminOnboarding` | Crear primer restaurante (`POST /api/restaurants`) |
| Restaurante | `AdminRestaurantPage` | Editar nombre, slug, descripción, `isActive`; eliminar (Owner) |
| Menús | `AdminMenusPage` + subcomponentes | CRUD menús; editor con categorías, productos, reorder, bulk pricing |

Subcomponentes del editor de menús (`src/components/admin/menus/`):

| Componente | Uso |
| ---------- | --- |
| `AdminMenuSidebar` | Lista de menús, crear/eliminar/publicar |
| `AdminMenuEditor` | Orquesta categorías e ítems del menú seleccionado |
| `AdminCategoryBlock` | Bloque de categoría con productos |
| `AdminMenuItemRow` / `AdminMenuItemForm` | Fila y formulario de producto |
| `AdminBulkPricingDialog` | Ajuste masivo de precios |

Query param en menús: `?menu={menuId}` persiste el menú seleccionado en la URL.

### Páginas placeholder

Registradas en `admin-pages.tsx` con `AdminSection` genérico:

- `/admin` — Inicio (resumen pendiente)
- `/admin/theme` — Apariencia
- `/admin/members` — Equipo

La API de temas y miembros está operativa en backend; falta UI y funciones en `admin-api.ts`.

### Componentes compartidos admin

| Componente | Uso |
| ---------- | --- |
| `AdminContext` | `restaurant`, `role`, `user`, `refresh()` |
| `AdminSection` | Encabezado de sección |
| `AdminConfirmDialog` | Confirmación destructiva |
| `AdminToggle` | Switch accesible |
| `admin-form.module.scss` | Estilos de formularios |

Estilos globales del panel: `src/styles/admin.scss` (tokens `--admin-*`).

---

## 5. Capa de API del cliente

### `src/lib/admin-api.ts`

Cliente tipado para la API de dominio. Parsea el envelope `{ success, data }` / `{ success, error }`.

| Grupo | Funciones |
| ----- | --------- |
| Restaurantes | `listRestaurants`, `createRestaurant`, `getRestaurant`, `updateRestaurant`, `deleteRestaurant` |
| Menús | `listMenus`, `createMenu`, `updateMenu`, `deleteMenu` |
| Categorías | `listCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories` |
| Productos | `listItems`, `createItem`, `updateItem`, `deleteItem`, `reorderItems`, `bulkPricing` |

**Pendiente en cliente:** temas (`/api/themes/*`) y miembros (`/api/restaurants/:id/members/*`).

### `src/lib/slugify.ts`

Utilidad frontend para previsualizar slugs al editar restaurante (espejo de la lógica del servidor).

---

## 6. Menú de demostración

Ruta `/example` — documentación visual en [design.md](./design.md).

| Aspecto | Demo `/example` | Menú real (planificado) |
| ------- | --------------- | ----------------------- |
| Datos | Mock en `example-menu-data.ts` | `GET /api/public/menu/...` |
| Temas | 3 presets locales + localStorage | Tema del restaurante en BD |
| Selector de tema | Visible (solo demo) | No aplica |

Los componentes en `src/components/example-menu/` sirven como referencia visual para la futura página pública.

---

## 7. Estilos y convenciones

| Convención | Detalle |
| ---------- | ------- |
| CSS | SCSS Modules (`.module.scss`) por componente |
| UI libs | Sin Tailwind ni shadcn |
| Iconos | Lucide React |
| Imports | Siempre al inicio del módulo |
| Formato precio | Locale `es-AR` en demo; API devuelve string `"12.50"` |

---

## 8. Pendientes MVP

Prioridad sugerida para cerrar el frontend del MVP:

| # | Tarea | Depende de |
| - | ----- | ---------- |
| 1 | Página `/menu/[restaurantSlug]/[menuSlug].astro` consumiendo API pública | API §6.8 ✅ |
| 2 | UI `/admin/theme` + funciones en `admin-api.ts` | API temas ✅ |
| 3 | UI `/admin/members` + funciones en `admin-api.ts` | API miembros ✅ |
| 4 | Dashboard `/admin` con resumen y accesos rápidos | Datos existentes |
| 5 | Landing `/` o redirect a demo/login | Producto |
| 6 | Tests E2E Playwright (auth + CRUD + menú público) | PRD §18 |

Contratos API: [ENDPOINTS-FRONTEND.md](./ENDPOINTS-FRONTEND.md).
