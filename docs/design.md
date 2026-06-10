# SmartMenu — Design System (v1)

Documentación de la primera versión visual del menú público de demostración en `/example`.

Esta versión es **solo frontend**, con datos mock, sin backend ni panel admin.

---

## Alcance

| Incluye | No incluye |
| ------- | ---------- |
| Ruta `/example` para presentaciones a clientes | Panel `/admin` |
| 3 presets visuales intercambiables | CRUD, API, auth |
| Menú ficticio *Bella Napoli* | Imágenes de productos |
| Scroll continuo por categorías | Alérgenos, productos destacados |
| Título de categoría fijo que cambia al scrollear | Acordeones / apilado de secciones |

---

## Arquitectura de archivos

```
src/
├── pages/
│   └── example.astro              # Ruta, fuentes Google, reset global mínimo
├── styles/
│   └── example-menu-themes.scss # Tokens CSS por preset (data-example-theme)
├── lib/
│   ├── example-menu-themes.ts   # IDs, nombres y persistencia en localStorage
│   └── example-menu-data.ts       # Restaurante, categorías y productos mock
└── components/example-menu/
    ├── ExampleMenuDemo.tsx        # Shell: toolbar + selector de tema
    ├── ExampleMenuDemo.module.scss
    ├── ExampleThemeToggle.tsx     # Toggle de 3 presets (solo demo)
    ├── ExampleThemeToggle.module.scss
    ├── ExamplePublicMenu.tsx      # Menú público: header, barra categoría, lista
    ├── ExamplePublicMenu.module.scss
    ├── ExampleProductCard.tsx     # Fila de producto (nombre, precio, descripción)
    └── ExampleProductCard.module.scss
```

---

## Sistema de temas

Los presets se aplican con el atributo `data-example-theme` en `<html>`. Las variables CSS heredan a todo el documento.

Persistencia: `localStorage` → clave `smartmenu-example-theme`.

| ID | Nombre | Uso sugerido |
| -- | ------ | ------------- |
| `minimal-clean` | Minimal Clean | Restaurantes, cafés, look neutro |
| `warm-natural` | Warm & Natural | Cocina cálida, panaderías, brunch |
| `bold-night` | Bold Night | Bares, burgers, marcas premium oscuras |

Definición en código: `src/lib/example-menu-themes.ts`  
Tokens en SCSS: `src/styles/example-menu-themes.scss`

---

## Tokens CSS (`--example-*`)

Variables activas en v1. **No usar colores hardcodeados** en componentes; referenciar siempre estas variables.

| Token | Uso |
| ----- | --- |
| `--example-bg` | Fondo de página |
| `--example-menu-surface` | Superficie principal del menú y toolbar |
| `--example-card-surface` | Fondo de opciones activas en el theme toggle |
| `--example-muted-surface` | Barra de categoría, fondos secundarios |
| `--example-text` | Texto principal |
| `--example-text-muted` | Descripciones, meta, labels |
| `--example-border` | Separadores y bordes |
| `--example-primary` | Acento de marca, `:focus-visible` |
| `--example-price` | Precio del producto |
| `--example-radius-md` | Border radius (toggle, botones) |
| `--example-font-body` | Cuerpo y UI |
| `--example-font-heading` | Títulos (restaurante, categoría, producto) |

Variables locales (inline en componente, no en presets):

| Variable | Componente | Uso |
| -------- | ---------- | --- |
| `--sticky-offset` | `ExamplePublicMenu` | Altura del toolbar demo sticky |
| `--restaurant-header-height` | `ExamplePublicMenu` | Altura medida del header restaurante |
| `--category-bar-height` | `ExamplePublicMenu` | Altura fija de la barra de categoría (40px) |

---

## Paletas por preset

### Minimal Clean

| Token | Valor |
| ----- | ----- |
| `--example-bg` | `#F8FAFC` |
| `--example-menu-surface` | `#FFFFFF` |
| `--example-card-surface` | `#FFFFFF` |
| `--example-muted-surface` | `#F1F5F9` |
| `--example-text` | `#0F172A` |
| `--example-text-muted` | `#64748B` |
| `--example-border` | `#E2E8F0` |
| `--example-primary` | `#10B981` |
| `--example-price` | `#DC2626` |
| `--example-font-body` | Inter, system-ui, sans-serif |
| `--example-font-heading` | Inter, system-ui, sans-serif |

### Warm & Natural

| Token | Valor |
| ----- | ----- |
| `--example-bg` | `#FAF4EA` |
| `--example-menu-surface` | `#FFFDF8` |
| `--example-card-surface` | `#FFFFFF` |
| `--example-muted-surface` | `#F4EAD8` |
| `--example-text` | `#2C2C2C` |
| `--example-text-muted` | `#756B5E` |
| `--example-border` | `#E6D8C3` |
| `--example-primary` | `#2D5A3D` |
| `--example-price` | `#2D5A3D` |
| `--example-font-body` | Inter, system-ui, sans-serif |
| `--example-font-heading` | Georgia, Playfair Display, serif |

### Bold Night

| Token | Valor |
| ----- | ----- |
| `--example-bg` | `#060914` |
| `--example-menu-surface` | `#0B1020` |
| `--example-card-surface` | `#111827` |
| `--example-muted-surface` | `#1F2937` |
| `--example-text` | `#F9FAFB` |
| `--example-text-muted` | `#9CA3AF` |
| `--example-border` | `#374151` |
| `--example-primary` | `#7C3AED` |
| `--example-price` | `#C4B5FD` |
| `--example-font-body` | Poppins, Inter, system-ui, sans-serif |
| `--example-font-heading` | Poppins, Inter, system-ui, sans-serif |

---

## Tipografía

Fuentes cargadas en `example.astro` (Google Fonts):

- **Inter** — 400, 500, 600, 700
- **Playfair Display** — 600, 700
- **Poppins** — 400, 500, 600, 700

| Elemento | Tamaño | Peso | Fuente |
| -------- | ------ | ---- | ------ |
| Nombre restaurante | `1.375rem` | 700 | `--example-font-heading` |
| Subtítulo / meta | `0.875rem` / `0.75rem` | 400 | `--example-font-body` |
| Título categoría (barra fija) | `0.9375rem` | 700 | `--example-font-heading` |
| Nombre producto | `0.9375rem` | 700 | `--example-font-heading` |
| Precio | `0.9375rem` | 700 | `--example-font-body` |
| Descripción producto | `0.8125rem` | 400 | `--example-font-body` |
| Label toolbar | `0.75rem` | 600 | `--example-font-body` |
| Opciones theme toggle | `0.75rem` | 500 | `--example-font-body` |

---

## Layout

### Página (`ExampleMenuDemo`)

- Ancho **100%**, sin contenedor centrado flotante.
- Toolbar sticky en `top: 0`, `z-index: 30`.
- Scroll nativo del documento (sin contenedor con overflow propio).

### Menú (`ExamplePublicMenu`)

1. **Header restaurante** — sticky debajo del toolbar (`top: --sticky-offset`), centrado.
2. **Barra de categoría** — sticky debajo del header, altura 40px, título centrado.
3. **Catálogo** — lista continua de productos agrupados por sección, separadas con `border-top`.

### Producto (`ExampleProductCard`)

- Fila horizontal: nombre (izq) + precio (der).
- Descripción debajo en texto muted.
- Separador inferior sólido (`1px solid var(--example-border)`).
- Último producto de cada sección sin borde inferior.
- Productos no disponibles: `opacity: 0.55` + texto "No disponible".

---

## Comportamiento

### Cambio de categoría al scroll

Al scrollear, se detecta la sección visible bajo la barra de categoría y se actualiza el título. La transición usa la animación `categoryTitleIn` (280ms, fade + `translateY(6px)`). Respeta `prefers-reduced-motion`.

### Selector de tema

Solo visible en `/example`. No es feature de producto final. Tres botones segmentados; el activo usa `--example-card-surface` y borde `--example-border`.

---

## Convenciones de estilo

- **SCSS Modules** en cada componente (`.module.scss`).
- **Sin Tailwind**, sin shadcn, sin librerías UI extra.
- **Sin estilos inline** en JSX (salvo variables CSS dinámicas de layout).
- **Iconos**: Lucide React (`Clock`, `MapPin`).
- **Formato de precio**: `es-AR` → `$12.500`.

---

## Datos mock

Restaurante: **Bella Napoli** — Cocina italiana artesanal — Palermo, Buenos Aires.

Categorías: Pizzas, Pastas, Entradas, Bebidas (12 productos cada una).

Campos de producto en v1: `id`, `name`, `description`, `price`, `category`, `available`.

---

## Próximas versiones (fuera de v1)

- Imágenes de productos
- Alérgenos
- Productos destacados
- Menú público real en `/menu/:slug`
- Temas configurables desde admin
- Integración con API y `Theme` en Prisma
