# Backoffice ITEC — Frontend

Panel de administración académica para el Instituto ITEC. Permite gestionar alumnos, profesores, materias, comisiones, asistencia, calificaciones, reportes y certificados.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18** + **TypeScript 5**
- **Tailwind CSS** + **shadcn/ui**
- **Lucide React** (iconografía)
- **Sonner** (notificaciones toast)

## Requisitos

- Node.js 18+
- npm 9+
- Backend corriendo en `http://localhost:8081` (configurable vía `.env.local`)

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm start
```

La aplicación corre por defecto en `http://localhost:3000`.

## Estructura del proyecto

```
├── app/
│   ├── layout.tsx              # Layout raíz con AuthProvider
│   ├── page.tsx                # Redirección según autenticación
│   ├── login/                  # Página de login
│   └── dashboard/
│       ├── layout.tsx          # Layout con sidebar y header
│       ├── page.tsx            # Dashboard principal
│       └── students/           # Gestión de alumnos
├── components/
│   ├── auth/                   # Formulario de login
│   ├── dashboard/              # Widgets del dashboard (stats, gráficos, actividad)
│   ├── layout/                 # Header y sidebar
│   ├── students/               # Tabla de alumnos
│   └── ui/                     # Componentes base (shadcn/ui)
├── hooks/
│   ├── use-auth.tsx            # Contexto y lógica de autenticación
│   ├── use-mobile.tsx          # Detección de dispositivo móvil
│   └── use-toast.ts            # Hook de notificaciones
├── lib/
│   ├── api-client.ts           # Cliente HTTP centralizado
│   ├── types.ts                # Interfaces TypeScript
│   └── utils.ts                # Utilidades generales
└── middleware.ts               # Protección de rutas autenticadas
```

## Autenticación

El sistema de auth usa JWT almacenado en `localStorage` y cookies.

- `POST /auth/login` — Obtiene el token
- `GET /auth/validate` — Valida el token y devuelve el usuario

Las rutas bajo `/dashboard/*` están protegidas por el middleware de Next.js. Los usuarios no autenticados son redirigidos a `/login`.

## Roles

El sidebar muestra opciones según el rol del usuario autenticado:

| Rol | Acceso |
|---|---|
| `ADMIN` | Acceso completo |
| `PRECEPTOR` | Alumnos, asistencia, comisiones |
| `PROFESOR` | Materias, calificaciones |
| `ALUMNO` | Vista de sus propios datos |

## Páginas disponibles

| Ruta | Estado |
|---|---|
| `/login` | Implementada |
| `/dashboard` | Implementada |
| `/dashboard/students` | Implementada |
| `/dashboard/teachers` | Pendiente |
| `/dashboard/subjects` | Pendiente |
| `/dashboard/commissions` | Pendiente |
| `/dashboard/attendance` | Pendiente |
| `/dashboard/grades` | Pendiente |
| `/dashboard/reports` | Pendiente |
| `/dashboard/certificates` | Pendiente |
