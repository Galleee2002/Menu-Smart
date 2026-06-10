# Actualización de Arquitectura y Alcance Técnico

## Stack Tecnológico

### Frontend

* Astro
* React
* TypeScript
* SCSS Modules
* Lucide React
* pnpm

### Backend

* Node.js
* Prisma ORM
* TypeScript

### Base de Datos

* Neon PostgreSQL

### Infraestructura

#### Frontend

* Vercel o Netlify

#### Backend

* Vercel Functions o Netlify Functions

#### Base de Datos

* Neon PostgreSQL

#### Control de Versiones

* Git
* GitHub

---

# Arquitectura General

```text
Cliente
 │
 ▼
Astro Website
 │
 ├── Menú Público
 └── Dashboard Administrativo (React)
          │
          ▼
        API
          │
          ▼
     Prisma ORM
          │
          ▼
   Neon PostgreSQL
```

---

# Sistema de Personalización Visual

## Objetivo

Permitir que cada negocio gastronómico adapte la apariencia de su menú digital a su identidad visual.

## Funcionalidades

### Temas

El sistema deberá permitir:

* Seleccionar diseños predefinidos.
* Crear diseños personalizados.
* Modificar colores principales.
* Modificar colores secundarios.
* Modificar colores de texto.
* Modificar colores de elementos interactivos.

### Tipografías

El sistema deberá permitir:

* Seleccionar distintas familias tipográficas.
* Aplicar cambios en tiempo real.
* Mantener consistencia visual entre menú público y panel administrativo.

### Vista Previa

Todos los cambios visuales deberán reflejarse instantáneamente en una vista previa integrada.

---

# FASE 2 - Experiencia de Personalización Avanzada

## Constructor Visual

El sistema deberá incluir un editor visual propio de GRGSolutions orientado específicamente a negocios gastronómicos.

### Capacidades

* Personalización de apariencia.
* Gestión de temas.
* Gestión de tipografías.
* Visualización instantánea de cambios.
* Configuración de estilos globales.
* Guardado de configuraciones personalizadas.

### Objetivo

Permitir que cualquier cliente pueda adaptar el menú digital a su marca sin conocimientos técnicos.

---

# Entidad Theme

```ts
{
  id: string
  restaurantId: string

  backgroundColor: string
  textColor: string
  accentColor: string

  fontFamily: string

  createdAt: Date
  updatedAt: Date
}
```

---

# Requisitos de Diseño

## Principios

* Diseño minimalista.
* Experiencia intuitiva.
* Mobile First.
* Accesibilidad.
* Alto rendimiento.
* Identidad visual propia de GRGSolutions.

## Restricciones

* No replicar interfaces existentes.
* No depender de sistemas de diseño de terceros.
* Mantener coherencia visual entre dashboard y menú público.
* Priorizar simplicidad y velocidad de uso.

```
```
