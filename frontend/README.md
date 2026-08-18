# 🖥️ Backoffice ITEC — Frontend Web

> **Nota de Ecosistema:** Este módulo es la aplicación web cliente del monorepo ITEC 2026. Para una visión completa de la arquitectura y el backend, consulta el [README principal](../README.md).

---

## 📌 Descripción

El **Frontend** es el portal web de administración académica para directivos, administrativos, docentes y estudiantes del Instituto ITEC. Desarrollado con **Next.js 14** (App Router), **React 18** y **TypeScript**.

---

## 🗺️ Mapa de Relaciones en el Monorepo

| Componente | Carpeta | Relación / Comunicación |
|---|---|---|
| 🚪 **API Gateway** | [api-gateway](../api-gateway/README.md) | **Único punto de entrada HTTP**. Todas las peticiones van a `http://localhost:8080` (en Docker `http://api-gateway:8080`). Nunca conectarse directo a puertos internos. |
| 🧠 **Backend Core** | [backend](../backend/README.md) | Provee autenticación, ABMs maestros, inscripciones y catálogo. |
| 📅 **MS Asistencias** | [ms-asistencias](../ms-asistencias/README.md) | Provee endpoints de registro y consulta de presentismo. |
| 📊 **MS Notas** | [ms-notas](../ms-notas/README.md) | Provee carga de calificaciones, actas y estado de regularidad. |
| 📚 **Docs UX/UI** | [docs/05.00-Diseno_UX_UI.md](../docs/05.00-Diseno_UX_UI.md) | Guías de diseño, accesibilidad, paleta institucional y componentes. |
| 📌 **Tareas / Memoria** | [.remember](../.remember/PENDIENTES.md) | Única fuente de verdad del backlog y deudas técnicas. |

---

## 🧱 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje / Tipado:** TypeScript 5
- **Estilos:** Tailwind CSS + shadcn/ui
- **Iconografía:** Lucide React
- **Feedback:** Sonner (Toast notifications)

---

## ⚙️ Variables de Entorno

Crear un archivo `.env.local` en esta carpeta (`frontend/`):

```env
# URL alcanzable por el navegador del usuario hacia el API Gateway
NEXT_PUBLIC_API_URL=http://localhost:8080

# URL interna usada por Server Components / SSR dentro de Docker (opcional en local)
API_URL=http://localhost:8080
```

---

## 🚀 Comandos

```bash
# Instalación de dependencias (se requiere --legacy-peer-deps por compatibilidad React 18)
npm install --legacy-peer-deps

# Servidor de desarrollo (puerto 3000)
npm run dev

# Compilación para producción
npm run build

# Iniciar servidor de producción
npm start
```

---

## 🔐 Autenticación y Rutas Protegidas

El cliente maneja autenticación JWT coordinada con el [API Gateway](../api-gateway/README.md) y el [Backend Core](../backend/README.md):
- **Almacenamiento:** Token JWT en cookies y `localStorage`.
- **Interceptors:** Centralizados en `lib/api-client.ts`.
- **Middleware:** `middleware.ts` protege las vistas `/dashboard/*` redirigiendo al `/login` si no existe sesión válida.

---

## 📚 Enlaces de Interés
- 🎨 [Diseño UX / UI](../docs/05.00-Diseno_UX_UI.md)
- 🧭 [Arquitectura de Navegación](../docs/04.10-Arquitectura_Navegacion.md)
- 📋 [Única Fuente de Verdad (Tareas)](../.remember/PENDIENTES.md)
