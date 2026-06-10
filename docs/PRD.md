# SmartMenu — Product Requirements Document (PRD)

| Campo   | Valor        |
| ------- | ------------ |
| Versión | 1.2          |
| Estado  | Draft        |
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
18. [Criterios de Producción MVP](#18-criterios-de-producción-mvp)
19. [Estado Actual del Proyecto](#19-estado-actual-del-proyecto)

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

## 18. Criterios de Producción MVP

El producto será considerado listo para producción cuando:

- [ ] CRUD completo de menús funcionando (múltiples menús por restaurante).
- [ ] CRUD completo de categorías funcionando.
- [ ] CRUD completo de productos funcionando.
- [ ] Menú público funcionando (URL por menú).
- [ ] Dashboard funcionando.
- [ ] Autenticación funcionando.
- [ ] Persistencia en Neon funcionando.
- [ ] Deploy automatizado funcionando.
- [ ] Responsive validado.
- [ ] Lighthouse superior a 90.

---

## 19. Estado Actual del Proyecto

**Situación actual:**

| Componente | Estado |
| ---------- | ------ |
| Proyecto | Fase inicial |
| Estructura Astro | Creada |
| Esquema Prisma | Sin esquema definitivo |
| API Hono | Sin implementar |
| Autenticación | Sin implementar _(decisión: Better Auth + Prisma + Neon)_ |
| Integración Neon | Sin implementar |

Este documento representa la visión objetivo del producto y servirá como guía de implementación para las siguientes iteraciones.
