# SmartMenu — Documentación

Índice de la documentación técnica del proyecto. Actualizado al estado del repo (junio 2026).

---

## Mapa de documentos

| Documento | Audiencia | Contenido |
| --------- | --------- | --------- |
| [PRD.md](./PRD.md) | Producto / visión | Requisitos, modelo de datos, roadmap por fases, criterios MVP |
| [BACKEND-IMPLEMENTATION.md](./BACKEND-IMPLEMENTATION.md) | Backend | Plan por fases, arquitectura Hono, estado de implementación, tests |
| [ENDPOINTS-FRONTEND.md](./ENDPOINTS-FRONTEND.md) | Frontend / integración | Contrato REST, payloads, códigos HTTP, flujo recomendado |
| [FRONTEND.md](./FRONTEND.md) | Frontend | Rutas Astro, panel admin, capa `admin-api`, auth, pendientes |
| [design.md](./design.md) | Diseño | Design system del menú de demostración en `/example` |

---

## Estado resumido

| Área | Estado | Detalle |
| ---- | ------ | ------- |
| **Backend Fase 0** | ✅ Completada | Prisma, Hono, health check, Vitest |
| **Backend Fase 1** | ✅ Completada | Auth, CRUD completo, menú público API, RBAC, 96 tests |
| **Frontend auth** | ✅ Operativo | `/login`, `/register`, sesión Better Auth |
| **Panel admin** | 🔄 En curso | Shell, onboarding, restaurante y menús; tema y equipo pendientes |
| **Menú público UI** | ⏳ Pendiente | API lista; falta ruta `/menu/:restaurantSlug/:menuSlug` |
| **Demo visual** | ✅ Operativa | `/example` con datos mock y 3 presets |
| **E2E / CI** | ⏳ Pendiente | Sin Playwright ni GitHub Actions en el repo |

---

## Rutas de la aplicación

| Ruta | Auth | Descripción |
| ---- | ---- | ----------- |
| `/` | No | Placeholder Astro (sin landing de producto) |
| `/example` | No | Menú de demostración con datos mock |
| `/login`, `/register` | No | Autenticación email + password |
| `/admin` | Sí | Panel administrativo (SPA React en isla) |
| `/admin/restaurant` | Sí | Datos del restaurante |
| `/admin/menus` | Sí | Editor de menús, categorías y productos |
| `/admin/theme` | Sí (Owner) | Placeholder — API de temas lista |
| `/admin/members` | Sí (Owner) | Placeholder — API de miembros lista |
| `/menu/:restaurantSlug/:menuSlug` | No | **Planificado** — enlace de vista previa ya generado en admin |
| `/api/*` | Parcial | API Hono (dominio + Better Auth) |

Protección de rutas: `src/middleware.ts` redirige a `/login` si no hay sesión en `/admin/*`.

---

## Comandos útiles

```bash
pnpm dev          # Astro en http://localhost:4321
pnpm test:run     # Vitest (integración API; requiere DATABASE_URL_TEST)
pnpm db:migrate   # Migraciones en desarrollo
pnpm db:studio    # Prisma Studio
pnpm build        # prisma generate && astro build
```

Variables de entorno necesarias en local: `DATABASE_URL`, `DATABASE_URL_TEST`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Ver [BACKEND-IMPLEMENTATION.md §12](./BACKEND-IMPLEMENTATION.md#12-variables-de-entorno).

---

## Orden de lectura recomendado

1. **Nuevo en el proyecto** → este README → [PRD.md §20](./PRD.md#20-estado-actual-del-proyecto)
2. **Consumir la API** → [ENDPOINTS-FRONTEND.md](./ENDPOINTS-FRONTEND.md)
3. **Trabajar en admin** → [FRONTEND.md](./FRONTEND.md)
4. **Backend / tests** → [BACKEND-IMPLEMENTATION.md](./BACKEND-IMPLEMENTATION.md)
5. **UI del menú público demo** → [design.md](./design.md)
