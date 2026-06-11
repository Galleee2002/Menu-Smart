# SmartMenu — Endpoints para el Frontend

| Campo      | Valor                                              |
| ---------- | -------------------------------------------------- |
| Versión    | 1.0                                                |
| Alcance    | Fase 0 + Fase 1 parcial (auth, restaurantes, menús, categorías) |
| Referencia | [BACKEND-IMPLEMENTATION.md](./BACKEND-IMPLEMENTATION.md) |
| Base URL   | `/api` (mismo origen que la app Astro)             |

---

## Alcance actual

| Fase | Estado   | Grupos documentados                          |
| ---- | -------- | -------------------------------------------- |
| 0    | Completa | Health check                                 |
| 1    | Parcial  | Auth (Better Auth), Restaurantes, Menús, Categorías |

**Pendiente en Fase 1:** productos, temas, menú público y miembros.

---

## Convenciones

### Autenticación

- Sesión por **cookies** `httpOnly` gestionadas por Better Auth.
- En `fetch`, usar siempre `credentials: "include"`.
- Tras login/sign-up, la cookie se envía automáticamente en peticiones al mismo origen.

### Formato de respuesta

**API de dominio** (`/api/restaurants`, `/api/health`, etc.):

```json
// Éxito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "message": "..." } }
```

**Better Auth** (`/api/auth/*`): respuesta nativa de la librería, **sin** envelope `{ success, data }`.

### Roles de negocio

| Rol     | Descripción                                      |
| ------- | ------------------------------------------------ |
| `OWNER` | Dueño del restaurante; acciones destructivas     |
| `STAFF` | Personal; lectura y edición limitada             |

En MVP un usuario pertenece a **un solo** restaurante.

### Códigos HTTP habituales

| Código | Significado                                      |
| ------ | ------------------------------------------------ |
| `200`  | OK                                               |
| `201`  | Recurso creado                                   |
| `400`  | Validación fallida                               |
| `401`  | Sin sesión                                       |
| `403`  | Sin permiso (rol insuficiente)                   |
| `404`  | Recurso no encontrado o sin acceso               |
| `409`  | Conflicto (p. ej. slug duplicado, ya tiene restaurante) |
| `429`  | Rate limit (auth)                                |

---

## Fase 0 — Health check

### `GET /api/health`

Comprueba que la API responde. No requiere autenticación.

**Respuesta `200`:**

```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

| Campo `data` | Tipo     | Uso en frontend                          |
| ------------ | -------- | ---------------------------------------- |
| `status`     | `string` | Indicador de disponibilidad (`"ok"`)     |

---

## Autenticación — Better Auth

Rutas gestionadas por Better Auth. **No usan** el envelope estándar.

### `POST /api/auth/sign-up/email`

Registra un usuario. No crea restaurante (flujo separado).

**Body:**

| Campo      | Tipo     | Requerido | Descripción                          |
| ---------- | -------- | --------- | ------------------------------------ |
| `name`     | `string` | Sí        | Nombre visible del usuario           |
| `email`    | `string` | Sí        | Email único                          |
| `password` | `string` | Sí        | Mínimo 8 caracteres                  |

**Respuesta `200`:** usuario creado + cookie de sesión (`Set-Cookie`).

**Rate limit:** 5 intentos / 10 s por IP.

---

### `POST /api/auth/sign-in/email`

Inicia sesión.

**Body:**

| Campo      | Tipo     | Requerido | Descripción        |
| ---------- | -------- | --------- | ------------------ |
| `email`    | `string` | Sí        | Email registrado   |
| `password` | `string` | Sí        | Contraseña         |

**Respuesta `200`:** sesión activa + cookie.

**Rate limit:** 5 intentos / 10 s por IP. `429` si se excede.

---

### `POST /api/auth/sign-out`

Cierra la sesión actual. Requiere cookie activa.

**Respuesta `200`:** sesión invalidada.

---

### `GET /api/auth/get-session`

Devuelve la sesión y el usuario autenticado.

**Respuesta con sesión `200`:**

```json
{
  "session": { "id": "...", "userId": "...", "expiresAt": "..." },
  "user": {
    "id": "...",
    "name": "Owner",
    "email": "owner@test.com",
    "emailVerified": false,
    "image": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

| Campo `user`      | Tipo      | Uso en frontend                              |
| ----------------- | --------- | -------------------------------------------- |
| `id`              | `string`  | Identificador del usuario                    |
| `name`            | `string`  | Nombre para UI y perfil                        |
| `email`           | `string`  | Email de la cuenta                           |
| `emailVerified`   | `boolean` | Siempre `false` en MVP (verificación off)  |
| `image`           | `string?` | Avatar (no usado en MVP)                     |

**Sin sesión:** respuesta `null`.

---

## Restaurantes

Todas las rutas requieren sesión (`401` sin cookie).

### Objeto `Restaurant` (respuesta)

| Campo         | Tipo      | Descripción                                              |
| ------------- | --------- | -------------------------------------------------------- |
| `id`          | `string`  | ID interno (CUID)                                        |
| `name`        | `string`  | Nombre comercial del restaurante                         |
| `slug`        | `string`  | Identificador URL (`la-casa-del-sabor`); único global    |
| `description` | `string`  | Texto descriptivo; vacío por defecto                     |
| `isActive`    | `boolean` | Si `false`, el menú público no se mostrará (futuro)      |
| `createdAt`   | `string`  | ISO 8601                                                 |
| `updatedAt`   | `string`  | ISO 8601                                                 |
| `role`        | `string?` | Rol del usuario actual: `OWNER` \| `STAFF`               |

---

### `GET /api/restaurants`

Lista el restaurante del usuario autenticado.

**Auth:** cualquier usuario logueado.

**Respuesta `200`:** array de 0 o 1 elemento en MVP.

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "La Casa del Sabor",
      "slug": "la-casa-del-sabor",
      "description": "Comida casera",
      "isActive": true,
      "createdAt": "2026-06-11T12:00:00.000Z",
      "updatedAt": "2026-06-11T12:00:00.000Z",
      "role": "OWNER"
    }
  ]
}
```

**Uso en frontend:** comprobar si el usuario ya tiene restaurante antes de mostrar onboarding.

---

### `POST /api/restaurants`

Crea restaurante y asigna al usuario como `OWNER`. Inicializa tema por defecto en servidor.

**Auth:** usuario sin restaurante previo.

**Body:**

| Campo         | Tipo      | Requerido | Descripción                                           |
| ------------- | --------- | --------- | ----------------------------------------------------- |
| `name`        | `string`  | Sí        | 2–100 caracteres                                      |
| `description` | `string`  | No        | Máx. 500 caracteres                                   |
| `slug`        | `string`  | No        | Solo `a-z`, `0-9` y `-`. Si se omite, se genera del nombre |

**Respuesta `201`:** objeto `Restaurant` con `role: "OWNER"`.

**Errores:**

| Código | Mensaje                              | Cuándo                          |
| ------ | ------------------------------------ | ------------------------------- |
| `409`  | `User already belongs to a restaurant` | Segundo intento de creación  |
| `409`  | `Slug already taken`                 | Slug manual ya en uso           |
| `400`  | Mensaje de validación Zod            | Campos inválidos                |

**Tema por defecto** (creado en servidor, no en la respuesta):

| Campo             | Valor por defecto                    |
| ----------------- | ------------------------------------ |
| `primaryColor`    | `#10b981`                            |
| `secondaryColor`  | `#64748b`                            |
| `backgroundColor` | `#f8fafc`                            |
| `textColor`       | `#0f172a`                            |
| `accentColor`     | `#dc2626`                            |
| `fontFamily`      | `'Inter', system-ui, sans-serif`     |

---

### `GET /api/restaurants/:id`

Detalle de un restaurante.

**Auth:** miembro del restaurante (`OWNER` o `STAFF`).

**Parámetro URL:**

| Parámetro | Descripción        |
| --------- | ------------------ |
| `id`      | ID del restaurante |

**Respuesta `200`:** objeto `Restaurant` con `role`.

**Errores:** `404` si no es miembro.

---

### `PATCH /api/restaurants/:id`

Actualiza datos del restaurante.

**Auth:** solo `OWNER`.

**Body** (al menos un campo):

| Campo         | Tipo      | Descripción                              |
| ------------- | --------- | ---------------------------------------- |
| `name`        | `string`  | 2–100 caracteres                         |
| `description` | `string`  | Máx. 500 caracteres                      |
| `slug`        | `string`  | Solo `a-z`, `0-9` y `-`; único global    |
| `isActive`    | `boolean` | Activar/desactivar visibilidad pública   |

**Respuesta `200`:** objeto `Restaurant` actualizado.

**Errores:** `403` si es `STAFF`, `409` si el slug está ocupado.

---

### `DELETE /api/restaurants/:id`

Elimina el restaurante y todos sus datos en cascada (menús, categorías, productos, tema, miembros).

**Auth:** solo `OWNER`.

**Respuesta `200`:**

```json
{ "success": true, "data": { "deleted": true } }
```

**Errores:** `403` si es `STAFF`.

---

## Menús

Todas las rutas requieren sesión (`401` sin cookie). El usuario debe pertenecer al restaurante del menú.

### Objeto `Menu` (respuesta)

| Campo          | Tipo      | Descripción                                              |
| -------------- | --------- | -------------------------------------------------------- |
| `id`           | `string`  | ID interno (CUID)                                        |
| `restaurantId` | `string`  | Restaurante al que pertenece el menú                     |
| `name`         | `string`  | Nombre visible del menú                                  |
| `slug`         | `string`  | Identificador URL; único dentro del restaurante          |
| `isPublished`  | `boolean` | Si `true`, visible en el endpoint público (futuro §6.8)   |
| `createdAt`    | `string`  | ISO 8601                                                 |
| `updatedAt`    | `string`  | ISO 8601                                                 |

---

### `GET /api/menus`

Lista los menús del restaurante del usuario.

**Auth:** miembro del restaurante (`OWNER` o `STAFF`).

**Query params:**

| Parámetro      | Requerido | Descripción                                           |
| -------------- | --------- | ----------------------------------------------------- |
| `restaurantId` | No        | Filtrar por restaurante; en MVP coincide con el del usuario |

**Respuesta `200`:** array de objetos `Menu`.

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "restaurantId": "clx...",
      "name": "Main Menu",
      "slug": "main",
      "isPublished": true,
      "createdAt": "2026-06-11T12:00:00.000Z",
      "updatedAt": "2026-06-11T12:00:00.000Z"
    }
  ]
}
```

**Notas:** devuelve `[]` si el usuario no tiene restaurante o no es miembro del `restaurantId` indicado.

---

### `POST /api/menus`

Crea un menú en el restaurante del usuario.

**Auth:** `OWNER` o `STAFF`.

**Body:**

| Campo          | Tipo      | Requerido | Descripción                                           |
| -------------- | --------- | --------- | ----------------------------------------------------- |
| `name`         | `string`  | Sí        | 2–100 caracteres                                      |
| `slug`         | `string`  | No        | Solo `a-z`, `0-9` y `-`. Si se omite, se genera del nombre |
| `restaurantId` | `string`  | No        | En MVP se infiere del restaurante del usuario         |
| `isPublished`  | `boolean` | No        | Por defecto `false`                                   |

**Respuesta `201`:** objeto `Menu`.

**Errores:**

| Código | Mensaje              | Cuándo                              |
| ------ | -------------------- | ----------------------------------- |
| `404`  | `Not Found`          | Usuario sin restaurante             |
| `409`  | `Slug already taken` | Slug manual ya usado en el restaurante |
| `400`  | Mensaje Zod          | Campos inválidos                    |

---

### `PATCH /api/menus/:id`

Actualiza un menú existente.

**Auth:** `OWNER` o `STAFF` del restaurante del menú.

**Body** (al menos un campo):

| Campo         | Tipo      | Descripción                              |
| ------------- | --------- | ---------------------------------------- |
| `name`        | `string`  | 2–100 caracteres                         |
| `slug`        | `string`  | Solo `a-z`, `0-9` y `-`; único en el restaurante |
| `isPublished` | `boolean` | Publicar o despublicar el menú           |

**Respuesta `200`:** objeto `Menu` actualizado.

**Errores:** `404` si no es miembro, `409` si el slug está ocupado.

---

### `DELETE /api/menus/:id`

Elimina el menú y sus categorías/productos en cascada.

**Auth:** solo `OWNER`.

**Respuesta `200`:**

```json
{ "success": true, "data": { "deleted": true } }
```

**Errores:** `403` si es `STAFF`, `404` si no es miembro.

---

## Categorías

Todas las rutas requieren sesión (`401` sin cookie). Las categorías pertenecen a un menú del restaurante del usuario.

### Objeto `Category` (respuesta)

| Campo    | Tipo     | Descripción                              |
| -------- | -------- | ---------------------------------------- |
| `id`     | `string` | ID interno (CUID)                        |
| `menuId` | `string` | Menú al que pertenece la categoría       |
| `name`   | `string` | Nombre visible de la categoría           |
| `order`  | `number` | Posición de ordenación (0 = primero)     |

---

### `GET /api/categories`

Lista las categorías de un menú, ordenadas por `order` ascendente.

**Auth:** miembro del restaurante del menú (`OWNER` o `STAFF`).

**Query params:**

| Parámetro | Requerido | Descripción        |
| --------- | --------- | ------------------ |
| `menuId`  | Sí        | ID del menú padre  |

**Respuesta `200`:** array de objetos `Category`.

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "menuId": "clx...",
      "name": "Starters",
      "order": 0
    }
  ]
}
```

**Errores:** `400` si falta `menuId`, `404` si el menú no existe o el usuario no es miembro.

---

### `POST /api/categories`

Crea una categoría en un menú.

**Auth:** `OWNER` o `STAFF` del restaurante del menú.

**Body:**

| Campo    | Tipo     | Requerido | Descripción                                              |
| -------- | -------- | --------- | -------------------------------------------------------- |
| `menuId` | `string` | Sí        | Menú donde crear la categoría                            |
| `name`   | `string` | Sí        | 1–100 caracteres                                         |
| `order`  | `number` | No        | Entero ≥ 0; si se omite, se asigna al final del menú     |

**Respuesta `201`:** objeto `Category`.

**Errores:** `404` si no es miembro del restaurante del menú, `400` si el body es inválido.

---

### `PATCH /api/categories/:id`

Actualiza nombre u orden de una categoría.

**Auth:** `OWNER` o `STAFF` del restaurante del menú.

**Body** (al menos un campo):

| Campo   | Tipo     | Descripción              |
| ------- | -------- | ------------------------ |
| `name`  | `string` | 1–100 caracteres         |
| `order` | `number` | Entero ≥ 0               |

**Respuesta `200`:** objeto `Category` actualizado.

**Errores:** `404` si no es miembro, `400` si el body es inválido.

---

### `DELETE /api/categories/:id`

Elimina la categoría y sus productos en cascada.

**Auth:** `OWNER` o `STAFF` del restaurante del menú.

**Respuesta `200`:**

```json
{ "success": true, "data": { "deleted": true } }
```

**Errores:** `404` si no es miembro.

---

### `PATCH /api/categories/reorder`

Reordena varias categorías de un menú en una sola petición.

**Auth:** `OWNER` o `STAFF` del restaurante del menú.

**Body:**

| Campo    | Tipo     | Requerido | Descripción                                      |
| -------- | -------- | --------- | ------------------------------------------------ |
| `menuId` | `string` | Sí        | Menú cuyas categorías se reordenan               |
| `items`  | `array`  | Sí        | Al menos un `{ id, order }` por categoría        |

```json
{
  "menuId": "clx...",
  "items": [
    { "id": "cat1", "order": 0 },
    { "id": "cat2", "order": 1 }
  ]
}
```

**Respuesta `200`:** array de objetos `Category` del menú, ya ordenados.

**Errores:** `400` si algún `id` no pertenece al `menuId`, `404` si no es miembro.

---

## Flujo recomendado para el frontend

```text
1. POST /api/auth/sign-up/email  →  registro
2. GET  /api/auth/get-session    →  confirmar sesión
3. GET  /api/restaurants         →  ¿tiene restaurante?
4. POST /api/restaurants         →  onboarding (si data === [])
5. GET  /api/restaurants/:id     →  dashboard con datos y role
6. GET  /api/menus               →  listar menús del restaurante
7. POST /api/menus               →  crear menú (publicar con PATCH)
8. GET  /api/categories?menuId=  →  listar categorías del menú
9. POST /api/categories          →  crear categoría
10. PATCH /api/categories/reorder →  reordenar tras drag-and-drop
```

---

## Próximos endpoints (Fase 1 — no disponibles aún)

| Grupo       | Rutas principales                                              |
| ----------- | -------------------------------------------------------------- |
| Productos   | `GET/POST /api/items`, `POST /api/items/bulk-pricing`          |
| Temas       | `GET/PATCH /api/themes/:restaurantId`                          |
| Público     | `GET /api/public/menu/:restaurantSlug/:menuSlug`               |
| Miembros    | `GET/POST /api/restaurants/:id/members`                        |

Detalle completo en [BACKEND-IMPLEMENTATION.md §6](./BACKEND-IMPLEMENTATION.md#6-fase-1--mvp-backend).
