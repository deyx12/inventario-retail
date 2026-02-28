# Inventario Retail — MVP

Sistema de Gestión de Inventario para Retail. Next.js 14, Supabase, TailwindCSS.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend/Auth:** Supabase (PostgreSQL + RLS + Auth)
- **Despliegue:** Vercel

## Funcionalidades

- **Dashboard:** Valor total de inventario, productos con stock bajo, métricas
- **Productos:** CRUD completo con búsqueda por nombre/SKU, categorías
- **Scanner:** Lector de códigos de barras/QR con cámara (html5-qrcode)
- **Control de Stock:** Entradas y salidas rápidas con función SQL atómica
- **Reportes:** Historial de movimientos filtrable por fecha/tipo, exportación CSV
- **Almacenes:** Gestión multi-almacén
- **UI:** Mobile-first, dark/light mode, notificaciones toast

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el script SQL de `supabase/migrations/001_schema_inicial.sql` en el SQL Editor
3. Copia `.env.example` a `.env.local` y llena las variables:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
app/                    # Páginas (App Router)
  (auth)/               # Login, Registro (sin sidebar)
  (dashboard)/          # Páginas protegidas (con sidebar)
features/               # Lógica por funcionalidad
  auth/                 # Autenticación
  productos/            # CRUD productos, categorías, almacenes
  inventario/           # Control de stock, movimientos
  dashboard/            # Métricas
  scanner/              # Lector de barras
  reportes/             # Historial y filtros
lib/                    # Utilidades compartidas
  supabase/             # Clientes Supabase (browser/server)
  utils/                # Formatters, validators (Zod)
components/             # Componentes reutilizables
  ui/                   # shadcn/ui
  layout/               # Sidebar, Navbar, MobileNav
  shared/               # EmptyState, LoadingSpinner
```

## Base de Datos

El script SQL (`supabase/migrations/001_schema_inicial.sql`) crea:
- **perfiles** — datos del usuario/tienda
- **almacenes** — ubicaciones de inventario
- **categorias** — clasificación de productos
- **productos** — catálogo con SKU, precios, stock mínimo
- **inventario** — cantidad por producto/almacén
- **movimientos** — historial de entradas/salidas

Todas las tablas tienen **Row Level Security (RLS)** activado.
