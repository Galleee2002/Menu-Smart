# SmartMenu — Product Requirements Document (PRD)

| Campo   | Valor        |
| ------- | ------------ |
| Versión | 1.4          |
| Estado  | MVP en curso |
| Owner   | GRGSolutions |

---

## Tabla de contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos del Producto](#2-objetivos-del-producto)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura General](#4-arquitectura-general)
5. [Alcance Funcional](#5-alcance-funcional)
6. [Roles del Sistema](#6-roles-del-sistema)
7. [Sistema de Autenticación](#7-sistema-de-autenticación)
8. [Modelo de Datos](#8-modelo-de-datos)
9. [Relaciones](#9-relaciones)
10. [API Design](#10-api-design)
11. [Convenciones API](#11-convenciones-api)
12. [MVP (Fase 1)](#12-mvp-fase-1)
13. [Fase 2](#13-fase-2)
14. [Fase 3](#14-fase-3)
15. [Fase 4](#15-fase-4)
16. [Requisitos No Funcionales](#16-requisitos-no-funcionales)
17. [Entornos](#17-entornos)
18. [Estrategia de Testing](#18-estrategia-de-testing)
19. [Criterios de Producción MVP](#19-criterios-de-producción-mvp)
20. [Estado Actual del Proyecto](#20-estado-actual-del-proyecto)

---

## 1. Resumen Ejecutivo

SmartMenu es una plataforma SaaS para la creación, administración y publicación de menús digitales para negocios gastronómicos.

El producto permite que restaurantes, cafeterías, bares, pizzerías y comercios gastronómicos administren su carta digital mediante un panel de control moderno, reflejando los cambios en tiempo real sobre menús públicos accesibles mediante URL.

El sistema estará diseñado para ser escalable y preparado para evolucionar hacia una solución comercial SaaS multi-tenant. En el MVP, cada usuario administra un único restaurante.

---

## 2. Objetivos del Producto

### Objetivos de Negocio

- Crear un producto demostrable para GRGSolutions.
- Captar clientes gastronómicos.
- Generar una futura línea SaaS.
- Construir un caso de estudio técnico para portfolio.

### Objetivos Técnicos

- Arquitectura escalable.
- Excelente experiencia de usuario.
- SEO optimizado.
- Alto rendimiento.
- Tipado completo end-to-end.
- Despliegue serverless.

---

## 3. Stack Tecnológico

| Capa            | Tecnologías                                              |
| --------------- | -------------------------------------------------------- |
| **Frontend**    | Astro, React, TypeScript, SCSS Modules, Lucide React, pnpm |
| **Backend**     | Hono, Better Auth, TypeScript, Prisma ORM, Zod           |
| **Base de datos** | Neon PostgreSQL                                        |
| **Hosting**     | Vercel                                                   |
| **Versionado**  | Git, GitHub                                              |
| **Testing**     | Vitest (96 tests integración API). Playwright, Lighthouse CI y axe-core _(planificados)_ |
| **CI/CD**       | GitHub Actions _(fase futura)_                           |

---

## 4. Arquitectura General

```text
Client
 │
 ▼
Astro Application
 │
 ├── Public Menu
 └── Admin Dashboard
          │
          ▼
       Hono API
          │
          ▼
      Prisma ORM
          │
          ▼
    Neon PostgreSQL
```

---

## 5. Alcance Funcional

### Menú Público

Cada restaurante puede publicar **varios menús** (por ejemplo: carta principal, menú del día, carta de bebidas). Cada menú tiene su propia URL:

```text
/menu/:restaurantSlug/:menuSlug
```

**Funciones:**

- Navegar categorías.
- Visualizar productos.
- Visualizar precios.
- Visualizar descripciones.
- Ver productos destacados.
- Visualizar disponibilidad.
- Visualizar alérgenos.
- Diseño responsive.
- SEO optimizado.

### Dashboard Administrativo

Accesible mediante:

```text
/admin
```

**Funciones:**

- Gestión de restaurante (uno por usuario en MVP).
- Gestión de menús (múltiples por restaurante).
- Gestión de categorías.
- Gestión de productos.
- Gestión visual.
- Cambios masivos.
- Gestión de usuarios.
- Vista previa en tiempo real.

---

## 6. Roles del Sistema

Los roles **Owner** y **Staff** se asignan por restaurante mediante la entidad `UserRestaurant`. Un usuario solo puede tener un rol activo por restaurante.

> **MVP:** Cada usuario está vinculado a **un único restaurante**.

| Rol | Descripción | Permisos | Restricciones |
| --- | ----------- | -------- | ------------- |
| **Owner** | Dueño del restaurante. Rol definido en `UserRestaurant`. | Acceso completo. Gestión de usuarios. Gestión de menú. Gestión visual. | — |
| **Staff** | Empleado autorizado. Rol definido en `UserRestaurant`. | Editar productos. Editar categorías. Cambiar disponibilidad. | No puede gestionar usuarios. No puede eliminar restaurante. |
| **Super Admin** _(GRGSolutions)_ | Permisos globales de plataforma. | Administrar todos los restaurantes. Resolver incidencias. Gestionar suscripciones futuras. | **Fuera del alcance del MVP**; se definirá en Fase 3. |

---

## 7. Sistema de Autenticación

| Aspecto | Decisión |
| ------- | -------- |
| Librería | Better Auth con adapter Prisma |
| Persistencia | Neon PostgreSQL |
| Integración | Rutas expuestas desde Hono (`/api/auth/*`) |
| Sesiones | Cookies httpOnly |
| MVP | Email + password |

Better Auth gestiona identidad y sesión. Los roles de negocio (`OWNER`, `STAFF`) viven en `UserRestaurant` y la autorización se aplica en la API Hono.

---

## 8. Modelo de Datos

### User

```ts
{
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
}
```

> Identidad y credenciales las gestiona Better Auth (tablas propias vía Prisma). El rol respecto a un restaurante vive en `UserRestaurant`, no en `User`.

### Restaurant

```ts
{
  id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### UserRestaurant

```ts
{
  userId: string
  restaurantId: string
  role: "OWNER" | "STAFF"
  createdAt: Date
  updatedAt: Date
}
```

> En el MVP, un usuario solo puede tener **una** relación `UserRestaurant` activa.

### Menu

```ts
{
  id: string
  restaurantId: string
  name: string
  slug: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

> Un restaurante puede tener **múltiples menús** desde el MVP.

### Category

```ts
{
  id: string
  menuId: string
  name: string
  order: number
}
```

### MenuItem

```ts
{
  id: string
  categoryId: string

  name: string
  description: string

  price: number

  isAvailable: boolean
  isFeatured: boolean

  allergens: string[]

  order: number
}
```

### Theme

```ts
{
  id: string

  restaurantId: string

  primaryColor: string
  secondaryColor: string

  backgroundColor: string
  textColor: string
  accentColor: string

  fontFamily: string

  createdAt: Date
  updatedAt: Date
}
```

---

## 9. Relaciones

```text
User
 └── UserRestaurant (role: OWNER | STAFF)
        └── Restaurant (1 por usuario en MVP)
                 ├── Menu (N menús por restaurante)
                 │     ├── Category
                 │     │      └── MenuItem
                 │
                 └── Theme
```

---

## 10. API Design

| Aspecto | Valor |
| ------- | ----- |
| Estilo | REST API |
| Formato | JSON |

### Auth

Gestionado por Better Auth vía Hono:

```http
/api/auth/*
```

### Restaurants

| Método | Endpoint |
| ------ | -------- |
| `GET` | `/api/restaurants` |
| `POST` | `/api/restaurants` |
| `GET` | `/api/restaurants/:id` |
| `PATCH` | `/api/restaurants/:id` |
| `DELETE` | `/api/restaurants/:id` |

### Menus

| Método | Endpoint |
| ------ | -------- |
| `GET` | `/api/menus` |
| `POST` | `/api/menus` |
| `PATCH` | `/api/menus/:id` |
| `DELETE` | `/api/menus/:id` |

### Categories

| Método | Endpoint |
| ------ | -------- |
| `GET` | `/api/categories` |
| `POST` | `/api/categories` |
| `PATCH` | `/api/categories/:id` |
| `DELETE` | `/api/categories/:id` |

### Menu Items

| Método | Endpoint |
| ------ | -------- |
| `GET` | `/api/items` |
| `POST` | `/api/items` |
| `PATCH` | `/api/items/:id` |
| `DELETE` | `/api/items/:id` |

### Themes

| Método | Endpoint |
| ------ | -------- |
| `GET` | `/api/themes/:restaurantId` |
| `PATCH` | `/api/themes/:restaurantId` |

### Public Menu

| Método | Endpoint |
| ------ | -------- |
| `GET` | `/api/public/menu/:restaurantSlug/:menuSlug` |

---

## 11. Convenciones API

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Not Found"
  }
}
```

---

## 12. MVP (Fase 1)

### Incluye

| Área | Funcionalidades |
| ---- | --------------- |
| **Restaurantes** | Crear restaurante (uno por usuario en MVP). Editar restaurante. |
| **Menús** | Crear múltiples menús por restaurante. Editar menús. Publicar / despublicar menús. |
| **Categorías** | Crear. Editar. Eliminar. Reordenar. |
| **Productos** | Crear. Editar. Eliminar. Disponibilidad. |
| **Menú Público** | URL pública por menú (`/menu/:restaurantSlug/:menuSlug`). Responsive. |
| **Personalización** | Temas predefinidos. Tipografías configurables. |
| **Cambios Masivos** | Incremento porcentual. Incremento fijo. |
| **Vista Previa** | Actualización en tiempo real. |
| **Autenticación** | Better Auth (email + password, sesiones por cookies). |

### No Incluye

- Múltiples restaurantes por usuario
- Códigos QR
- Super Admin de plataforma
- Multi idioma
- Analytics
- Multi sucursal
- Sistema de pagos
- Suscripciones
- Integraciones externas

---

## 13. Fase 2

### Personalización Avanzada

- Constructor visual propio.
- Configuración completa de estilos.
- Presets personalizados.

### Organización

- Drag & Drop categorías.
- Drag & Drop productos.

### QR

- Generación automática.

---

## 14. Fase 3

### SaaS Multi-Tenant

- Un usuario puede administrar **múltiples restaurantes**.
- Super Admin (GRGSolutions) con permisos globales.
- Roles avanzados y gestión de usuarios entre restaurantes.

### Analytics

- Productos más vistos.
- Categorías más vistas.
- Visitas totales.

---

## 15. Fase 4

### Multi Idioma

- Español
- Inglés
- Portugués

### Multi Sucursal

- Menús independientes.
- Precios independientes.

### Promociones

- Happy Hour
- Descuentos
- Productos destacados temporales

### WhatsApp

- Contacto directo desde el menú.

---

## 16. Requisitos No Funcionales

### Rendimiento

| Métrica | Objetivo |
| ------- | -------- |
| Lighthouse | > 90 |
| LCP | < 2.5s |
| FCP | < 1.8s |
| CLS | < 0.1 |

### Seguridad

- Validación con Zod.
- Sanitización de inputs.
- Protección CSRF.
- Rate Limiting.
- Password hashing.
- Variables de entorno seguras.

### Observabilidad

- Logs estructurados.
- Error tracking.
- Auditoría básica de acciones críticas.

### SEO

- Sitemap.
- Robots.
- Open Graph.
- Metadata dinámica.

### Accesibilidad

- Navegación por teclado.
- Contraste AA.
- Etiquetas semánticas.

---

## 17. Entornos

| Entorno | Plataforma |
| ------- | ---------- |
| **Development** | Local |
| **Staging** | Vercel Preview Deployments |
| **Production** | Vercel Production |

---

## 18. Estrategia de Testing

### Principios

- Priorizar **tests de integración API** y **E2E de flujos críticos** sobre cobertura superficial de UI.
- Mantener **paridad con producción** en base de datos de test (PostgreSQL vía Neon branch o instancia local).
- Automatizar calidad en CI antes de merge a `main`.
- No bloquear el MVP con cobertura alta en componentes Astro estáticos.

### Pirámide de pruebas

```text
        ┌─────────────┐
        │  Playwright │  ~5–8 tests E2E (flujos críticos)
        ├─────────────┤
        │   Vitest    │  API + Prisma + Zod + permisos (integración)
        ├─────────────┤
        │   Vitest    │  Unitarios puros (helpers, cálculos, validación)
        └─────────────┘
```

### Stack de herramientas

| Herramienta | Capa | Uso |
| ----------- | ---- | --- |
| **Vitest** | Unit + integración | Runner principal; compatible con Vite/Astro |
| **@testing-library/react** + **user-event** | Componentes | Islas React del dashboard (formularios, vista previa) |
| **Playwright** | E2E | Flujos completos con auth por cookies y menú público |
| **MSW** _(opcional)_ | Frontend | Mock de API en tests de UI aislados |
| **@lhci/cli** | Rendimiento | Lighthouse automatizado en CI (objetivo > 90) |
| **@axe-core/playwright** | Accesibilidad | Validación a11y en E2E del menú público |

Detalle de implementación backend: [BACKEND-IMPLEMENTATION.md §14](./BACKEND-IMPLEMENTATION.md#14-estrategia-de-pruebas).

### Alcance por tipo de prueba

#### Unitarios (Vitest)

| Área | Ejemplos |
| ---- | -------- |
| Schemas Zod | Payloads de restaurantes, menús, categorías, productos |
| Lógica de negocio | Cambios masivos de precios (% y fijo), generación de slugs |
| Autorización | Helpers RBAC Owner vs Staff |

#### Integración (Vitest + Hono + Prisma)

| Área | Ejemplos |
| ---- | -------- |
| API Hono | `app.request()` en rutas REST sin levantar servidor |
| Persistencia | CRUD contra base de datos de test |
| Auth | Sesiones Better Auth en endpoints protegidos |

#### Componentes (Vitest + Testing Library)

Solo islas React con lógica relevante: formularios CRUD, cambios masivos, vista previa en tiempo real. No priorizar snapshots masivos ni páginas Astro estáticas.

#### E2E (Playwright)

| # | Flujo crítico |
| - | ------------- |
| 1 | Registro y login (Better Auth) |
| 2 | Crear restaurante → menú → categoría → producto |
| 3 | Publicar menú y verificar menú público en `/menu/:restaurantSlug/:menuSlug` |
| 4 | Staff edita productos; no puede gestionar usuarios |
| 5 | Smoke responsive básico del menú público |

Los E2E pueden ejecutarse contra servidor local o Vercel Preview Deployments (staging).

#### Rendimiento y accesibilidad

| Herramienta | Objetivo |
| ----------- | -------- |
| Lighthouse CI | Score > 90 en build de Astro |
| axe-core (Playwright) | Sin violaciones críticas en menú público |

### Base de datos de test

| Entorno | Estrategia |
| ------- | ---------- |
| Local / CI | Rama de Neon (`neon branches`) o PostgreSQL local con `DATABASE_URL` dedicada |
| Seed | Script `prisma/seed.ts`: Owner, Staff, restaurante, menús, categorías e ítems de ejemplo |

Evitar SQLite para tests de integración: mantener paridad con Neon PostgreSQL en producción.

### Scripts npm (referencia)

Disponibles hoy en `package.json`:

```json
{
  "test": "vitest",
  "test:run": "vitest run"
}
```

Planificados para CI completo: `test:e2e`, `lhci` (ver §19).

### CI (GitHub Actions — fase futura)

```yaml
# Flujo típico en pull request
- pnpm install
- prisma migrate deploy   # contra DB de test
- pnpm test:run           # Vitest (unit + integración)
- pnpm build              # astro build
- pnpm test:e2e           # Playwright (servidor local o preview URL)
- pnpm lhci               # Lighthouse CI
```

### Prioridades MVP

| Prioridad | Qué testear |
| --------- | ----------- |
| **Alta** | Integración API (Hono + Prisma + Zod + RBAC) |
| **Alta** | E2E smoke: auth, CRUD catálogo, menú público |
| **Media** | Unitarios: bulk pricing, slugs, validación |
| **Media** | Lighthouse CI > 90 |
| **Baja** | Componentes React aislados (solo con lógica compleja) |

### Fuera de alcance MVP

- Cobertura > 80 % en componentes Astro estáticos.
- Tests E2E de cada variante de tema.
- Snapshot masivo de UI.
- Contract testing entre servicios.

---

## 19. Criterios de Producción MVP

El producto será considerado listo para producción cuando:

- [x] CRUD completo de menús funcionando (múltiples menús por restaurante).
- [x] CRUD completo de categorías funcionando.
- [x] CRUD completo de productos funcionando.
- [x] Menú público API funcionando (URL por menú).
- [ ] Menú público UI en `/menu/:restaurantSlug/:menuSlug`.
- [ ] Dashboard admin completo (tema, equipo, inicio).
- [x] Autenticación funcionando.
- [x] Persistencia en Neon funcionando.
- [ ] Deploy automatizado funcionando.
- [ ] Responsive validado en menú público real.
- [ ] Lighthouse superior a 90.
- [x] Suite Vitest en verde (integración API — 96 tests).
- [ ] Al menos 5 tests E2E críticos en verde (auth, CRUD, menú público, roles).
- [ ] Lighthouse CI > 90 en staging.
- [ ] Menú público sin violaciones a11y críticas (axe-core).

---

## 20. Estado Actual del Proyecto

**Actualizado:** junio 2026. Detalle técnico ampliado en [docs/README.md](./README.md), [BACKEND-IMPLEMENTATION.md](./BACKEND-IMPLEMENTATION.md) y [FRONTEND.md](./FRONTEND.md).

### Backend (Fase 0 + Fase 1)

| Componente | Estado |
| ---------- | ------ |
| Neon PostgreSQL | ✅ Provisionado; rama **Test** para Vitest |
| Esquema Prisma + migración inicial | ✅ `prisma/schema.prisma` |
| API Hono en `/api/*` | ✅ Montada vía `src/pages/api/[...path].ts` |
| Better Auth (`/api/auth/*`) | ✅ Email + password, cookies httpOnly |
| CRUD restaurantes, menús, categorías, productos | ✅ Con RBAC Owner/Staff |
| Temas y presets | ✅ GET/PATCH/apply-preset |
| Miembros (invitar Staff) | ✅ Solo Owner |
| Menú público API | ✅ `GET /api/public/menu/:restaurantSlug/:menuSlug` |
| Rate limit + logs estructurados | ✅ Auth (Better Auth) + público (Hono) |
| Tests Vitest | ✅ 96 tests en verde (`pnpm test:run`) |

### Frontend

| Componente | Estado |
| ---------- | ------ |
| Auth UI (`/login`, `/register`) | ✅ |
| Middleware protección `/admin/*` | ✅ |
| Panel admin (shell, sidebar, onboarding) | ✅ |
| Página restaurante | ✅ Edición y eliminación |
| Editor de menús | ✅ CRUD menús, categorías, productos, bulk pricing |
| Páginas tema y equipo | 🔄 Placeholder (API lista) |
| Dashboard inicio `/admin` | 🔄 Placeholder |
| Menú público UI `/menu/:slug/:slug` | ⏳ Pendiente (API lista) |
| Demo visual `/example` | ✅ Datos mock, 3 presets — ver [design.md](./design.md) |

### Infraestructura y calidad

| Componente | Estado |
| ---------- | ------ |
| Deploy Vercel | Configurado (`@astrojs/vercel`); CI automatizado pendiente |
| Playwright E2E | ⏳ No instalado |
| Lighthouse CI / axe-core | ⏳ Planificado |
| Seed `prisma/seed.ts` | ⏳ Pendiente |

### Próximos hitos MVP

1. Página pública del menú consumiendo la API.
2. UI de apariencia (temas) y gestión de equipo.
3. Dashboard de inicio con resumen.
4. E2E smoke y pipeline CI.

Este documento sigue siendo la referencia de producto; el estado técnico detallado vive en los documentos enlazados arriba.
